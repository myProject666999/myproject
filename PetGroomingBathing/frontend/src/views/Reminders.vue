<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px">
      <h2>客户提醒管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增提醒
      </el-button>
    </div>

    <el-form :inline="true" style="margin-bottom: 20px">
      <el-form-item label="状态">
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 150px" @change="loadReminders">
          <el-option label="待处理" value="pending" />
          <el-option label="已提醒" value="reminded" />
          <el-option label="已忽略" value="dismissed" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="filterType" placeholder="全部类型" clearable style="width: 150px" @change="loadReminders">
          <el-option label="疫苗到期" value="vaccine" />
          <el-option label="定期洗护" value="grooming" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="reminders" border stripe>
      <el-table-column prop="pet.name" label="宠物" width="100" />
      <el-table-column prop="title" label="提醒标题" width="150" />
      <el-table-column label="类型" width="100">
        <template #default="scope">
          <el-tag :type="getTypeTagType(scope.row.type)">
            {{ getTypeLabel(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="详情" show-overflow-tooltip />
      <el-table-column prop="reminderDate" label="提醒日期" width="120" />
      <el-table-column prop="dueDate" label="到期日期" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="success" link v-if="scope.row.status === 'pending'" @click="handleMarkReminded(scope.row)">已提醒</el-button>
          <el-button type="warning" link v-if="scope.row.status === 'pending'" @click="handleDismiss(scope.row)">忽略</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑提醒' : '新增提醒'"
      width="600px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="关联宠物" prop="petId">
          <el-select v-model="form.petId" placeholder="请选择宠物" style="width: 100%" filterable>
            <el-option
              v-for="pet in pets"
              :key="pet.id"
              :label="pet.name + ' (' + pet.breed + ')'"
              :value="pet.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="提醒类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="疫苗到期" value="vaccine" />
                <el-option label="定期洗护" value="grooming" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提醒日期" prop="reminderDate">
              <el-date-picker
                v-model="form.reminderDate"
                type="date"
                placeholder="选择提醒日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="提醒标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入提醒标题" />
        </el-form-item>
        <el-form-item label="详情描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入详情描述" />
        </el-form-item>
        <el-form-item label="到期日期">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            placeholder="选择到期日期（可选）"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReminders, createReminder, updateReminder, deleteReminder } from '@/api/reminder'
import { getPets } from '@/api/pet'

const reminders = ref([])
const pets = ref([])
const filterStatus = ref('')
const filterType = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: '',
  petId: '',
  type: 'custom',
  title: '',
  description: '',
  reminderDate: '',
  dueDate: '',
  notes: '',
  status: 'pending'
})

const rules = {
  petId: [{ required: true, message: '请选择宠物', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入提醒标题', trigger: 'blur' }],
  reminderDate: [{ required: true, message: '请选择提醒日期', trigger: 'change' }]
}

const getTypeLabel = (type) => {
  const map = { vaccine: '疫苗到期', grooming: '定期洗护', custom: '自定义' }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = { vaccine: 'danger', grooming: 'warning', custom: 'info' }
  return map[type] || 'info'
}

const getStatusLabel = (status) => {
  const map = { pending: '待处理', reminded: '已提醒', dismissed: '已忽略' }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = { pending: 'warning', reminded: 'success', dismissed: 'info' }
  return map[status] || 'info'
}

const resetForm = () => {
  Object.assign(form, {
    id: '',
    petId: '',
    type: 'custom',
    title: '',
    description: '',
    reminderDate: '',
    dueDate: '',
    notes: '',
    status: 'pending'
  })
}

const loadReminders = async () => {
  const params = {}
  if (filterStatus.value) params.status = filterStatus.value
  if (filterType.value) params.type = filterType.value
  const data = await getReminders(params)
  reminders.value = data
}

const loadPets = async () => {
  pets.value = await getPets()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleMarkReminded = async (row) => {
  await updateReminder(row.id, { status: 'reminded' })
  ElMessage.success('已标记为已提醒')
  loadReminders()
}

const handleDismiss = async (row) => {
  await updateReminder(row.id, { status: 'dismissed' })
  ElMessage.success('已忽略')
  loadReminders()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该提醒吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteReminder(row.id)
    ElMessage.success('删除成功')
    loadReminders()
  }).catch(() => {})
}

const submitForm = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateReminder(form.id, form)
    ElMessage.success('更新成功')
  } else {
    await createReminder(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadReminders()
}

onMounted(() => {
  loadReminders()
  loadPets()
})
</script>
