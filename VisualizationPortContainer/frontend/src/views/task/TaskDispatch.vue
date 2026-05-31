<template>
  <div class="task-dispatch">
    <div class="page-title">
      <el-icon :size="24"><Tickets /></el-icon>
      <span>任务调度</span>
    </div>

    <el-card class="pending-tasks">
      <template #header>
        <div class="card-header">
          <el-icon><Clock /></el-icon>
          <span>待分配任务</span>
          <el-badge :value="pendingTasks.length" class="ml-2" />
        </div>
      </template>
      <el-table :data="pendingTasks" size="small" v-loading="loading">
        <el-table-column prop="id" label="任务ID" width="100" />
        <el-table-column prop="type" label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getTaskTypeTag(row.type)">
              {{ getTaskTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="containerNo" label="箱号" width="140" />
        <el-table-column prop="sourceSlot" label="起始位置" width="140" />
        <el-table-column prop="targetSlot" label="目标位置" width="140" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getPriorityTag(row.priority)">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openAssignDialog(row)">
              <el-icon><UserFilled /></el-icon>
              分配
            </el-button>
            <el-button type="success" size="small" @click="handleAutoAssign(row)">
              <el-icon><MagicStick /></el-icon>
              自动
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="gantt-chart" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <el-icon><DataLine /></el-icon>
          <span>吊机任务甘特图</span>
          <div class="gantt-controls">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              size="small"
              placeholder="选择日期"
              @change="fetchGanttData"
            />
            <el-button size="small" @click="fetchGanttData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      <div class="gantt-container">
        <div class="gantt-header">
          <div class="gantt-crane-col">吊机</div>
          <div class="gantt-timeline">
            <div v-for="hour in timeSlots" :key="hour" class="gantt-time-slot">
              {{ hour.toString().padStart(2, '0') }}:00
            </div>
          </div>
        </div>
        <div class="gantt-body">
          <div v-for="crane in craneTasks" :key="crane.id" class="gantt-row">
            <div class="gantt-crane-col">
              <div class="crane-name">{{ crane.name }}</div>
              <el-tag :type="getCraneStatusTag(crane.status)" size="small">
                {{ getCraneStatusText(crane.status) }}
              </el-tag>
            </div>
            <div class="gantt-timeline">
              <div
                v-for="task in crane.tasks"
                :key="task.id"
                class="gantt-task"
                :style="getTaskStyle(task)"
                :class="getTaskClass(task)"
                @mouseenter="hoveredTask = task"
                @mouseleave="hoveredTask = null"
              >
                <span class="task-label">{{ task.containerNo }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-tooltip
          v-model:visible="tooltipVisible"
          placement="top"
          :offset="10"
        >
          <template #content>
            <div v-if="hoveredTask" class="tooltip-content">
              <div><strong>箱号:</strong> {{ hoveredTask.containerNo }}</div>
              <div><strong>任务:</strong> {{ getTaskTypeText(hoveredTask.type) }}</div>
              <div><strong>位置:</strong> {{ hoveredTask.sourceSlot }} → {{ hoveredTask.targetSlot }}</div>
              <div><strong>时间:</strong> {{ formatTime(hoveredTask.startTime) }} - {{ formatTime(hoveredTask.endTime) }}</div>
            </div>
          </template>
          <div ref="tooltipTarget" style="display: none;"></div>
        </el-tooltip>
      </div>
    </el-card>

    <el-dialog v-model="assignDialogVisible" title="分配任务" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="任务ID">
          <el-input v-model="assignForm.taskId" disabled />
        </el-form-item>
        <el-form-item label="箱号">
          <el-input v-model="assignForm.containerNo" disabled />
        </el-form-item>
        <el-form-item label="分配吊机" prop="craneId">
          <el-select v-model="assignForm.craneId" placeholder="请选择吊机" style="width: 100%;">
            <el-option
              v-for="crane in availableCranes"
              :key="crane.id"
              :label="crane.name"
              :value="crane.id"
              :disabled="crane.status !== 'IDLE'"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预计开始时间">
          <el-date-picker
            v-model="assignForm.estimatedStartTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="assignForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assigning" @click="handleConfirmAssign">确认分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Tickets,
  Clock,
  UserFilled,
  MagicStick,
  DataLine,
  Refresh
} from '@element-plus/icons-vue'
import { getPendingTasks, assignTask, getTaskGantt } from '@/api/task'
import { getCraneList } from '@/api/crane'
import { formatDateTime, formatTime } from '@/utils/date'

const loading = ref(false)
const assigning = ref(false)
const pendingTasks = ref([])
const craneTasks = ref([])
const availableCranes = ref([])
const selectedDate = ref(new Date())
const hoveredTask = ref(null)
const tooltipVisible = ref(false)
const assignDialogVisible = ref(false)

const assignForm = reactive({
  taskId: '',
  containerNo: '',
  craneId: '',
  estimatedStartTime: '',
  remark: ''
})

const timeSlots = computed(() => {
  return Array.from({ length: 24 }, (_, i) => i)
})

function getTaskTypeText(type) {
  const map = { INBOUND: '进场', OUTBOUND: '出场', RELOCATION: '翻箱', MAINTENANCE: '维护' }
  return map[type] || type
}

function getTaskTypeTag(type) {
  const map = { INBOUND: 'primary', OUTBOUND: 'success', RELOCATION: 'warning', MAINTENANCE: 'info' }
  return map[type] || 'info'
}

function getPriorityText(priority) {
  const map = { HIGH: '高', NORMAL: '中', LOW: '低' }
  return map[priority] || priority
}

function getPriorityTag(priority) {
  const map = { HIGH: 'danger', NORMAL: 'warning', LOW: 'info' }
  return map[priority] || 'info'
}

function getCraneStatusText(status) {
  const map = { IDLE: '空闲', WORKING: '工作中', MAINTENANCE: '维护中', ERROR: '故障' }
  return map[status] || status
}

function getCraneStatusTag(status) {
  const map = { IDLE: 'success', WORKING: 'primary', MAINTENANCE: 'warning', ERROR: 'danger' }
  return map[status] || 'info'
}

function getTaskStyle(task) {
  const startHour = new Date(task.startTime).getHours() + new Date(task.startTime).getMinutes() / 60
  const endHour = new Date(task.endTime).getHours() + new Date(task.endTime).getMinutes() / 60
  const duration = endHour - startHour
  
  return {
    left: `${(startHour / 24) * 100}%`,
    width: `${(duration / 24) * 100}%`
  }
}

function getTaskClass(task) {
  const classes = []
  if (task.status === 'PROCESSING') {
    classes.push('processing')
  } else if (task.status === 'COMPLETED') {
    classes.push('completed')
  } else {
    classes.push('pending')
  }
  return classes
}

async function fetchPendingTasks() {
  loading.value = true
  try {
    const res = await getPendingTasks()
    pendingTasks.value = res.data || []
  } catch (error) {
    console.error('获取待分配任务失败:', error)
  } finally {
    loading.value = false
  }
}

async function fetchCranes() {
  try {
    const res = await getCraneList()
    availableCranes.value = res.data.list || res.data || []
  } catch (error) {
    console.error('获取吊机列表失败:', error)
  }
}

async function fetchGanttData() {
  try {
    const res = await getTaskGantt({
      date: formatDateTime(selectedDate.value, 'YYYY-MM-DD')
    })
    craneTasks.value = res.data || []
  } catch (error) {
    console.error('获取甘特图数据失败:', error)
  }
}

function openAssignDialog(row) {
  assignForm.taskId = row.id
  assignForm.containerNo = row.containerNo
  assignForm.craneId = ''
  assignForm.estimatedStartTime = new Date()
  assignForm.remark = ''
  assignDialogVisible.value = true
}

async function handleAutoAssign(row) {
  try {
    await assignTask(row.id, { autoAssign: true })
    ElMessage.success('自动分配成功')
    fetchPendingTasks()
    fetchGanttData()
  } catch (error) {
    console.error('自动分配失败:', error)
  }
}

async function handleConfirmAssign() {
  if (!assignForm.craneId) {
    ElMessage.warning('请选择吊机')
    return
  }
  
  try {
    assigning.value = true
    await assignTask(assignForm.taskId, {
      craneId: assignForm.craneId,
      estimatedStartTime: assignForm.estimatedStartTime,
      remark: assignForm.remark
    })
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
    fetchPendingTasks()
    fetchGanttData()
  } catch (error) {
    console.error('分配失败:', error)
  } finally {
    assigning.value = false
  }
}

onMounted(() => {
  fetchPendingTasks()
  fetchCranes()
  fetchGanttData()
})
</script>

<style scoped>
.task-dispatch {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-weight: 600;
}

.gantt-controls {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}

.ml-2 {
  margin-left: 8px;
}

.gantt-chart {
  flex: 1;
  min-height: 500px;
}

.gantt-container {
  position: relative;
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.gantt-header {
  display: flex;
  background: rgba(64, 158, 255, 0.1);
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
}

.gantt-crane-col {
  width: 120px;
  padding: 12px;
  border-right: 1px solid rgba(64, 158, 255, 0.2);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.crane-name {
  font-weight: 600;
  color: #e0e6ed;
  font-size: 13px;
}

.gantt-timeline {
  flex: 1;
  display: flex;
  position: relative;
  min-height: 60px;
}

.gantt-time-slot {
  flex: 1;
  padding: 8px 4px;
  font-size: 11px;
  color: #a8b2c1;
  text-align: center;
  border-right: 1px solid rgba(64, 158, 255, 0.1);
}

.gantt-body {
  max-height: 400px;
  overflow-y: auto;
}

.gantt-row {
  display: flex;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.gantt-row:last-child {
  border-bottom: none;
}

.gantt-task {
  position: absolute;
  top: 8px;
  height: calc(100% - 16px);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  overflow: hidden;
  transition: all 0.2s;
  min-width: 50px;
}

.gantt-task:hover {
  z-index: 10;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.gantt-task.processing {
  background: linear-gradient(90deg, #409eff 0%, #1c7ed6 100%);
  border: 1px solid #66b1ff;
}

.gantt-task.completed {
  background: linear-gradient(90deg, #67c23a 0%, #52c41a 100%);
  border: 1px solid #85ce61;
}

.gantt-task.pending {
  background: linear-gradient(90deg, #e6a23c 0%, #d48806 100%);
  border: 1px solid #ebb563;
}

.task-label {
  font-size: 11px;
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltip-content {
  font-size: 12px;
  line-height: 1.8;
}

.tooltip-content div {
  color: #e0e6ed;
}

.tooltip-content strong {
  color: #409eff;
  margin-right: 4px;
}
</style>
