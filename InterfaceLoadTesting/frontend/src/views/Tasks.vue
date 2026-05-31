<template>
  <div class="tasks-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>压测任务</span>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建任务
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索任务名称"
          clearable
          style="width: 200px"
          @keyup.enter="loadTasks"
        />
        <el-select v-model="filters.status" placeholder="状态筛选" clearable style="width: 150px; margin-left: 10px">
          <el-option label="待执行" :value="0" />
          <el-option label="执行中" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="已中止" :value="3" />
          <el-option label="失败" :value="4" />
        </el-select>
        <el-button type="primary" @click="loadTasks" style="margin-left: 10px">查询</el-button>
      </div>

      <el-table :data="tasks" v-loading="loading" style="margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="任务名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="method" label="方法" width="80">
          <template #default="{ row }">
            <el-tag :type="getMethodType(row.method)" size="small">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="150" show-overflow-tooltip />
        <el-table-column prop="concurrency" label="并发数" width="100" />
        <el-table-column prop="duration" label="时长(s)" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewMonitor(row)" v-if="row.status === 1">
              <el-icon><Monitor /></el-icon>
              监控
            </el-button>
            <el-button size="small" type="success" @click="startTask(row)" v-if="row.status === 0">
              <el-icon><VideoPlay /></el-icon>
              启动
            </el-button>
            <el-button size="small" type="warning" @click="stopTask(row)" v-if="row.status === 1">
              <el-icon><VideoPause /></el-icon>
              中止
            </el-button>
            <el-button size="small" type="danger" @click="deleteTask(row)" v-if="row.status !== 1">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end; display: flex"
        @size-change="loadTasks"
        @current-change="loadTasks"
      />
    </el-card>

    <el-dialog v-model="showCreateDialog" title="新建压测任务" width="700px">
      <el-form :model="taskForm" :rules="taskRules" ref="taskFormRef" label-width="120px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="压测目标" prop="target_id">
          <el-select v-model="taskForm.target_id" placeholder="选择压测目标" style="width: 100%">
            <el-option v-for="t in targets" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-select v-model="taskForm.method">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="请求路径" prop="path">
          <el-input v-model="taskForm.path" placeholder="如: /api/test" />
        </el-form-item>
        <el-form-item label="请求头">
          <el-input v-model="taskForm.headers" type="textarea" :rows="3" placeholder='{"Content-Type": "application/json"}' />
        </el-form-item>
        <el-form-item label="请求体">
          <el-input v-model="taskForm.body" type="textarea" :rows="3" placeholder="请求体内容" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="并发数" prop="concurrency">
              <el-input-number v-model="taskForm.concurrency" :min="1" :max="10000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="压测时长(秒)" prop="duration">
              <el-input-number v-model="taskForm.duration" :min="1" :max="86400" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="阶梯启动(秒)">
              <el-input-number v-model="taskForm.ramp_up" :min="0" :max="3600" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="阶梯数">
              <el-input-number v-model="taskForm.steps" :min="1" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="超时时间(秒)" prop="timeout">
          <el-input-number v-model="taskForm.timeout" :min="1" :max="300" style="width: 200px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskApi, targetApi } from '@/api'

const router = useRouter()

const loading = ref(false)
const showCreateDialog = ref(false)
const taskFormRef = ref(null)

const tasks = ref([])
const targets = ref([])

const filters = ref({
  keyword: '',
  status: ''
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const taskForm = ref({
  name: '',
  target_id: null,
  method: 'GET',
  path: '',
  headers: '',
  body: '',
  concurrency: 10,
  duration: 60,
  ramp_up: 0,
  steps: 5,
  timeout: 30
})

const taskRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  target_id: [{ required: true, message: '请选择压测目标', trigger: 'change' }],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
  path: [{ required: true, message: '请输入请求路径', trigger: 'blur' }],
  concurrency: [{ required: true, message: '请输入并发数', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入压测时长', trigger: 'blur' }]
}

const getMethodType = (method) => {
  const types = { GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger' }
  return types[method] || 'info'
}

const getStatusType = (status) => {
  const types = ['info', 'success', '', 'warning', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待执行', '执行中', '已完成', '已中止', '失败']
  return texts[status] || '未知'
}

const loadTargets = async () => {
  try {
    const res = await targetApi.list({ page: 1, page_size: 100 })
    targets.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

const loadTasks = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      page_size: pagination.value.size,
      keyword: filters.value.keyword
    }
    if (filters.value.status !== '') {
      params.status = filters.value.status
    }
    const res = await taskApi.list(params)
    tasks.value = res.list || []
    pagination.value.total = res.total || 0
  } finally {
    loading.value = false
  }
}

const createTask = async () => {
  await taskFormRef.value.validate()
  try {
    await taskApi.create(taskForm.value)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    loadTasks()
    taskFormRef.value.resetFields()
  } catch (e) {
    console.error(e)
  }
}

const startTask = async (row) => {
  try {
    await taskApi.start(row.id)
    ElMessage.success('任务已启动')
    loadTasks()
  } catch (e) {
    console.error(e)
  }
}

const stopTask = async (row) => {
  await ElMessageBox.confirm('确定要中止该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await taskApi.stop(row.id)
    ElMessage.success('中止信号已发送')
    setTimeout(loadTasks, 1000)
  } catch (e) {
    console.error(e)
  }
}

const deleteTask = async (row) => {
  await ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await taskApi.remove(row.id)
    ElMessage.success('删除成功')
    loadTasks()
  } catch (e) {
    console.error(e)
  }
}

const viewMonitor = (row) => {
  router.push(`/tasks/${row.id}/monitor`)
}

onMounted(() => {
  loadTargets()
  loadTasks()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  display: flex;
  align-items: center;
}
</style>
