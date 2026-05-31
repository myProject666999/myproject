<template>
  <div class="page-container">
    <div class="table-toolbar">
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 140px" @change="loadList">
        <el-option v-for="(label, key) in statusLabelMap" :key="key" :label="label" :value="key" />
      </el-select>
      <el-button type="primary" @click="openCreateDialog"><el-icon><Plus /></el-icon>新增任务</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="title" label="任务标题" min-width="140" />
      <el-table-column prop="areaName" label="巡检区域" width="120" />
      <el-table-column prop="routeName" label="航线" width="120" />
      <el-table-column prop="droneName" label="无人机" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagMap[row.status] || 'info'" size="small">{{ statusLabelMap[row.status] || row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="90">
        <template #default="{ row }">
          <el-tag :type="priorityTagMap[row.priority] || 'info'" size="small">{{ priorityLabelMap[row.priority] || row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openDetailDialog(row)">详情</el-button>
          <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="handleStatusAction(row, 'start')">开始</el-button>
          <el-button v-if="row.status === 'running'" type="warning" link size="small" @click="handleStatusAction(row, 'pause')">暂停</el-button>
          <el-button v-if="row.status === 'paused'" type="success" link size="small" @click="handleStatusAction(row, 'resume')">继续</el-button>
          <el-button v-if="row.status === 'running' || row.status === 'paused'" type="success" link size="small" @click="handleStatusAction(row, 'complete')">完成</el-button>
          <el-button v-if="['pending', 'running', 'paused'].includes(row.status)" type="danger" link size="small" @click="handleStatusAction(row, 'cancel')">取消</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      style="margin-top: 16px; justify-content: flex-end"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadList"
    />

    <el-dialog v-model="createDialogVisible" title="新增任务" width="560px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="巡检区域" prop="areaId">
          <el-select v-model="createForm.areaId" placeholder="选择区域" style="width: 100%" @change="onAreaChange">
            <el-option v-for="a in areaList" :key="a.id" :label="a.name" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="航线" prop="routeId">
          <el-select v-model="createForm.routeId" placeholder="选择航线" style="width: 100%">
            <el-option v-for="r in routeList" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="无人机" prop="droneId">
          <el-select v-model="createForm.droneId" placeholder="选择无人机" style="width: 100%">
            <el-option v-for="d in droneList" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="createForm.priority" placeholder="选择优先级" style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="任务详情" width="600px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagMap[detailData.status]" size="small">{{ statusLabelMap[detailData.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="巡检区域">{{ detailData.areaName }}</el-descriptions-item>
        <el-descriptions-item label="航线">{{ detailData.routeName }}</el-descriptions-item>
        <el-descriptions-item label="无人机">{{ detailData.droneName }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="priorityTagMap[detailData.priority]" size="small">{{ priorityLabelMap[detailData.priority] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailData.description || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTaskList, createTask, getTask, startTask, pauseTask, resumeTask, completeTask, cancelTask } from '../api/task'
import { getAreaList } from '../api/area'
import { getRouteList } from '../api/route'
import { getDroneList } from '../api/drone'

const statusLabelMap = { pending: '待执行', running: '执行中', paused: '已暂停', completed: '已完成', cancelled: '已取消' }
const statusTagMap = { pending: 'info', running: '', paused: 'warning', completed: 'success', cancelled: 'danger' }
const priorityLabelMap = { low: '低', medium: '中', high: '高', urgent: '紧急' }
const priorityTagMap = { low: 'info', medium: '', high: 'warning', urgent: 'danger' }

const statusActions = {
  start: startTask,
  pause: pauseTask,
  resume: resumeTask,
  complete: completeTask,
  cancel: cancelTask
}

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const filterStatus = ref('')

const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const detailData = ref({})
const createFormRef = ref(null)
const areaList = ref([])
const routeList = ref([])
const droneList = ref([])

const createForm = reactive({ title: '', areaId: null, routeId: null, droneId: null, priority: 'medium' })
const createRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  areaId: [{ required: true, message: '请选择区域', trigger: 'change' }],
  routeId: [{ required: true, message: '请选择航线', trigger: 'change' }],
  droneId: [{ required: true, message: '请选择无人机', trigger: 'change' }]
}

async function loadList() {
  loading.value = true
  try {
    const res = await getTaskList({ page: page.value, pageSize: pageSize.value, status: filterStatus.value })
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

async function loadAreaList() {
  const res = await getAreaList({ pageSize: 100 })
  areaList.value = res.data.list || res.data || []
}

async function onAreaChange(areaId) {
  createForm.routeId = null
  const res = await getRouteList({ areaId, pageSize: 100 })
  routeList.value = res.data.list || res.data || []
}

async function loadDroneList() {
  const res = await getDroneList({ pageSize: 100 })
  droneList.value = res.data.list || res.data || []
}

function openCreateDialog() {
  Object.assign(createForm, { title: '', areaId: null, routeId: null, droneId: null, priority: 'medium' })
  routeList.value = []
  createDialogVisible.value = true
  loadAreaList()
  loadDroneList()
}

async function handleCreate() {
  const valid = await createFormRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await createTask({ ...createForm })
    ElMessage.success('任务创建成功')
    createDialogVisible.value = false
    loadList()
  } finally {
    submitting.value = false
  }
}

async function openDetailDialog(row) {
  const res = await getTask(row.id)
  detailData.value = res.data
  detailDialogVisible.value = true
}

async function handleStatusAction(row, action) {
  const actionLabel = { start: '开始', pause: '暂停', resume: '继续', complete: '完成', cancel: '取消' }
  await ElMessageBox.confirm(`确定${actionLabel[action]}该任务？`, '提示', { type: 'warning' })
  await statusActions[action](row.id)
  ElMessage.success('操作成功')
  loadList()
}

onMounted(() => loadList())
</script>
