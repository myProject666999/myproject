<template>
  <div>
    <div class="page-header">
      <span class="page-title">巡检任务</span>
      <el-button type="primary" @click="openDialog">新建任务</el-button>
    </div>
    
    <div class="card-wrapper">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="任务名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="任务名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type === 1 ? 'HTTP' : '脚本' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cron_expr" label="Cron表达式" width="150" />
        <el-table-column prop="timeout" label="超时(秒)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="executeTask(row)">执行</el-button>
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteTask(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.page_size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑任务' : '新建任务'" width="700px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="任务名称" required>
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="任务类型" required>
          <el-radio-group v-model="form.type">
            <el-radio :value="1">HTTP检查</el-radio>
            <el-radio :value="2">脚本检查</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Cron表达式" required>
          <el-input v-model="form.cron_expr" placeholder="例如: */5 * * * * ?" />
          <div style="font-size: 12px; color: #909399; margin-top: 5px;">秒 分 时 日 月 周</div>
        </el-form-item>
        <el-form-item label="超时时间(秒)">
          <el-input-number v-model="form.timeout" :min="1" :max="300" />
        </el-form-item>
        <el-form-item label="重试次数">
          <el-input-number v-model="form.retry_count" :min="0" :max="5" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type === 1" label="HTTP配置">
          <div style="width: 100%;">
            <el-input v-model="form.http_config.url" placeholder="请求URL" style="margin-bottom: 10px;" />
            <el-select v-model="form.http_config.method" placeholder="请求方法" style="margin-bottom: 10px; width: 150px;">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item v-if="form.type === 2" label="脚本配置">
          <el-input v-model="form.script_config.script_path" placeholder="脚本路径" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTasks, createTask, updateTask, deleteTask as deleteTaskApi, executeTask as executeTaskApi } from '@/api'

const searchForm = reactive({
  page: 1,
  page_size: 10,
  keyword: '',
  status: ''
})

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
  type: 1,
  cron_expr: '',
  timeout: 30,
  retry_count: 0,
  retry_interval: 5,
  alert_threshold: 1,
  notify_channels: [],
  tags: '',
  status: 1,
  http_config: {
    url: '',
    method: 'GET',
    headers: {},
    body: ''
  },
  script_config: {
    script_path: '',
    args: [],
    timeout: 30
  }
})

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    type: 1,
    cron_expr: '',
    timeout: 30,
    retry_count: 0,
    retry_interval: 5,
    alert_threshold: 1,
    notify_channels: [],
    tags: '',
    status: 1,
    http_config: {
      url: '',
      method: 'GET',
      headers: {},
      body: ''
    },
    script_config: {
      script_path: '',
      args: [],
      timeout: 30
    }
  }
}

const loadData = async () => {
  try {
    const res = await getTasks(searchForm)
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error(error)
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.page = 1
  loadData()
}

const openDialog = (row = null) => {
  resetForm()
  isEdit.value = !!row
  if (row) {
    Object.assign(form.value, JSON.parse(JSON.stringify(row)))
    if (!form.value.http_config) {
      form.value.http_config = { url: '', method: 'GET', headers: {}, body: '' }
    }
    if (!form.value.script_config) {
      form.value.script_config = { script_path: '', args: [], timeout: 30 }
    }
  }
  dialogVisible.value = true
}

const saveTask = async () => {
  try {
    saving.value = true
    if (isEdit.value) {
      await updateTask(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createTask(form.value)
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

const handleDeleteTask = (row) => {
  ElMessageBox.confirm(`确定要删除任务"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTaskApi(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const executeTask = async (row) => {
  try {
    await executeTaskApi(row.id)
    ElMessage.success('任务已开始执行')
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadData()
})
</script>
