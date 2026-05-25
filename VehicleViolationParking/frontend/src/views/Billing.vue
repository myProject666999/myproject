<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">计费管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增规则</el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="车辆类型">
          <el-select v-model="searchType" placeholder="全部" clearable @change="fetchList">
            <el-option label="小型车" :value="1" />
            <el-option label="中型车" :value="2" />
            <el-option label="大型车" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchStatus" placeholder="全部" clearable @change="fetchList">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="rule_name" label="规则名称" width="150" />
      <el-table-column label="车辆类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.vehicle_type === 1 ? 'info' : row.vehicle_type === 2 ? 'warning' : 'danger'">
            {{ row.vehicle_type === 1 ? '小型车' : row.vehicle_type === 2 ? '中型车' : '大型车' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="基础费用" width="120">
        <template #default="{ row }">
          ¥{{ row.base_fee }} / {{ row.base_duration }}分钟
        </template>
      </el-table-column>
      <el-table-column label="单位费用" width="120">
        <template #default="{ row }">
          ¥{{ row.unit_fee }} / {{ row.unit_duration }}分钟
        </template>
      </el-table-column>
      <el-table-column label="日封顶" width="100">
        <template #default="{ row }">
          {{ row.max_fee ? '¥' + row.max_fee : '不封顶' }}
        </template>
      </el-table-column>
      <el-table-column label="免费时长" width="100">
        <template #default="{ row }">
          {{ row.free_duration }} 分钟
        </template>
      </el-table-column>
      <el-table-column label="月卡费用" width="100">
        <template #default="{ row }">
          {{ row.monthly_fee ? '¥' + row.monthly_fee + '/月' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="规则名称" prop="rule_name">
          <el-input v-model="form.rule_name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="车辆类型" prop="vehicle_type">
          <el-select v-model="form.vehicle_type">
            <el-option label="小型车" :value="1" />
            <el-option label="中型车" :value="2" />
            <el-option label="大型车" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="基础费用">
          <el-input-number v-model="form.base_fee" :min="0" :precision="2" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="基础时长">
          <el-input-number v-model="form.base_duration" :min="0" />
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
        <el-form-item label="单位费用">
          <el-input-number v-model="form.unit_fee" :min="0" :precision="2" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="单位时长">
          <el-input-number v-model="form.unit_duration" :min="1" />
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
        <el-form-item label="日封顶">
          <el-input-number v-model="form.max_fee" :min="0" :precision="2" />
          <span style="margin-left: 10px">元 (0表示不封顶)</span>
        </el-form-item>
        <el-form-item label="免费时长">
          <el-input-number v-model="form.free_duration" :min="0" />
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
        <el-form-item label="月卡费用">
          <el-input-number v-model="form.monthly_fee" :min="0" :precision="2" />
          <span style="margin-left: 10px">元/月</span>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="form.priority" :min="0" />
          <span style="margin-left: 10px">数字越大优先级越高</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRuleList,
  createRule,
  updateRule,
  deleteRule
} from '@/api'

const tableData = ref([])
const searchType = ref('')
const searchStatus = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('新增规则')
const submitting = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)

const form = reactive({
  rule_name: '',
  vehicle_type: 1,
  base_fee: 0,
  base_duration: 30,
  unit_fee: 0,
  unit_duration: 30,
  max_fee: 0,
  free_duration: 15,
  monthly_fee: null,
  priority: 0,
  status: 1
})

const rules = {
  rule_name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  vehicle_type: [{ required: true, message: '请选择车辆类型', trigger: 'change' }]
}

const fetchList = async () => {
  try {
    const params = {}
    if (searchType.value !== '') params.vehicle_type = searchType.value
    if (searchStatus.value !== '') params.status = searchStatus.value
    
    const res = await getRuleList(params)
    if (res.code === 0) {
      tableData.value = res.data || []
    }
  } catch (error) {
    console.error('Fetch rules error:', error)
  }
}

const resetForm = () => {
  Object.assign(form, {
    rule_name: '',
    vehicle_type: 1,
    base_fee: 0,
    base_duration: 30,
    unit_fee: 0,
    unit_duration: 30,
    max_fee: 0,
    free_duration: 15,
    monthly_fee: null,
    priority: 0,
    status: 1
  })
  formRef.value?.resetFields()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  dialogTitle.value = '新增规则'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑规则'
  Object.assign(form, {
    rule_name: row.rule_name,
    vehicle_type: row.vehicle_type,
    base_fee: row.base_fee,
    base_duration: row.base_duration,
    unit_fee: row.unit_fee,
    unit_duration: row.unit_duration,
    max_fee: row.max_fee,
    free_duration: row.free_duration,
    monthly_fee: row.monthly_fee,
    priority: row.priority,
    status: row.status
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除规则 "${row.rule_name}" 吗？`, '提示', {
      type: 'warning'
    })
    const res = await deleteRule(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      fetchList()
    }
  } catch {}
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        let res
        const submitData = { ...form }
        
        if (isEdit.value) {
          res = await updateRule(editId.value, submitData)
        } else {
          res = await createRule(submitData)
        }
        
        if (res.code === 0) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          fetchList()
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchList()
})
</script>
