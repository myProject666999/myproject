<template>
  <div>
    <div class="page-header">
      <span class="page-title">预案管理</span>
      <el-button type="primary" @click="openDialog">新建预案</el-button>
    </div>
    
    <div class="card-wrapper">
      <el-table :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="预案名称" min-width="150" />
        <el-table-column prop="command" label="触发指令" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type === 1 ? 'HTTP' : row.type === 2 ? '脚本' : 'SQL' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timeout" label="超时(秒)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="executePlan(row)">执行</el-button>
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deletePlan(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑预案' : '新建预案'" width="700px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="预案名称" required>
          <el-input v-model="form.name" placeholder="请输入预案名称" />
        </el-form-item>
        <el-form-item label="预案描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入预案描述" />
        </el-form-item>
        <el-form-item label="触发指令" required>
          <el-input v-model="form.command" placeholder="请输入触发指令" />
        </el-form-item>
        <el-form-item label="执行类型" required>
          <el-radio-group v-model="form.type">
            <el-radio :value="1">HTTP请求</el-radio>
            <el-radio :value="2">脚本执行</el-radio>
            <el-radio :value="3">SQL执行</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="超时时间(秒)">
          <el-input-number v-model="form.timeout" :min="1" :max="600" />
        </el-form-item>
        <el-form-item label="幂等Key">
          <el-input v-model="form.idempotent_key" placeholder="支持模板变量，如: {{task_id}}" />
        </el-form-item>
        <el-form-item label="执行配置">
          <el-input v-model="configJson" type="textarea" :rows="6" placeholder="JSON格式的执行配置" />
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
        <el-button type="primary" @click="savePlan" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPlans, createPlan, updatePlan, deletePlan as deletePlanApi, executeCommand } from '@/api'

const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
  command: '',
  type: 1,
  timeout: 60,
  idempotent_key: '',
  config: {},
  status: 1
})

const configJson = computed({
  get: () => JSON.stringify(form.value.config, null, 2),
  set: (val) => {
    try {
      form.value.config = JSON.parse(val)
    } catch (e) {}
  }
})

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    command: '',
    type: 1,
    timeout: 60,
    idempotent_key: '',
    config: {},
    status: 1
  }
}

const loadData = async () => {
  try {
    const res = await getPlans({ page: 1, page_size: 100 })
    tableData.value = res.list || []
  } catch (error) {
    console.error(error)
  }
}

const openDialog = (row = null) => {
  resetForm()
  isEdit.value = !!row
  if (row) {
    Object.assign(form.value, JSON.parse(JSON.stringify(row)))
    if (!form.value.config) form.value.config = {}
  }
  dialogVisible.value = true
}

const savePlan = async () => {
  try {
    saving.value = true
    if (isEdit.value) {
      await updatePlan(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createPlan(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    saving.value = false
  }
}

const deletePlan = (row) => {
  ElMessageBox.confirm(`确定要删除预案"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deletePlanApi(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const executePlan = async (row) => {
  try {
    await executeCommand({ command: row.command, params: {} })
    ElMessage.success('执行成功')
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadData()
})
</script>
