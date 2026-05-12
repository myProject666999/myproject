<template>
  <div class="reminder-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>复诊提醒管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增提醒
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="发送状态">
          <el-select v-model="searchForm.sendStatus" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="待发送" :value="0" />
            <el-option label="已发送" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="读取状态">
          <el-select v-model="searchForm.readStatus" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeColor(scope.row.reminderType)">
              {{ getTypeText(scope.row.reminderType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="patientId" label="患者ID" width="100" />
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="reminderTime" label="提醒时间" width="170" />
        <el-table-column label="发送状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.sendStatus ? 'success' : 'warning'">
              {{ scope.row.sendStatus ? '已发送' : '待发送' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="读取状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.readStatus ? 'info' : 'danger'">
              {{ scope.row.readStatus ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleMarkRead(scope.row)" :disabled="scope.row.readStatus === 1">标记已读</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增提醒" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="患者" prop="patientId">
          <el-select v-model="form.patientId" placeholder="请选择患者" filterable style="width: 100%">
            <el-option v-for="patient in patients" :key="patient.id" :label="patient.name" :value="patient.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒类型" prop="reminderType">
          <el-select v-model="form.reminderType" placeholder="请选择提醒类型" style="width: 100%">
            <el-option label="预约提醒" value="APPOINTMENT" />
            <el-option label="治疗复查" value="TREATMENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入提醒内容"
          />
        </el-form-item>
        <el-form-item label="提醒时间" prop="reminderTime">
          <el-date-picker
            v-model="form.reminderTime"
            type="datetime"
            placeholder="选择提醒时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="发送方式">
          <el-select v-model="form.sendMethod" placeholder="请选择发送方式" style="width: 100%">
            <el-option label="短信" value="SMS" />
            <el-option label="邮件" value="EMAIL" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getReminders, createReminder, markReminderRead, getPatients } from '../../api'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()

const searchForm = reactive({
  sendStatus: null,
  readStatus: null
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const patients = ref([])

const form = reactive({
  patientId: null,
  reminderType: '',
  title: '',
  content: '',
  reminderTime: '',
  sendMethod: ''
})

const rules = {
  patientId: [{ required: true, message: '请选择患者', trigger: 'change' }],
  reminderType: [{ required: true, message: '请选择提醒类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  reminderTime: [{ required: true, message: '请选择提醒时间', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      sendStatus: searchForm.sendStatus,
      readStatus: searchForm.readStatus
    }
    const res = await getReminders(params)
    tableData.value = res.data.records
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const loadPatients = async () => {
  try {
    const res = await getPatients({ current: 1, size: 1000, clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1 })
    patients.value = res.data.records
  } catch (e) {
    console.error(e)
  }
}

const resetSearch = () => {
  searchForm.sendStatus = null
  searchForm.readStatus = null
  pagination.current = 1
  loadData()
}

const getTypeText = (type) => {
  const map = {
    APPOINTMENT: '预约提醒',
    TREATMENT: '治疗复查'
  }
  return map[type] || type
}

const getTypeColor = (type) => {
  return type === 'APPOINTMENT' ? 'primary' : 'warning'
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleMarkRead = async (row) => {
  await markReminderRead(row.id)
  ElMessage.success('操作成功')
  loadData()
}

const resetForm = () => {
  Object.assign(form, {
    patientId: null,
    reminderType: '',
    title: '',
    content: '',
    reminderTime: '',
    sendMethod: ''
  })
}

const handleSubmit = async () => {
  await formRef.value.validate()
  await createReminder(form)
  ElMessage.success('创建成功')
  dialogVisible.value = false
  loadData()
}

onMounted(() => {
  loadData()
  loadPatients()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
