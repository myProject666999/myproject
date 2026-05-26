<template>
  <div class="tasks-page">
    <el-card class="add-task-card">
      <template #header>
        <div class="card-header">
          <span>添加下载任务</span>
        </div>
      </template>
      <el-form :model="addForm" inline>
        <el-form-item label="下载链接" style="width: 500px">
          <el-input
            v-model="addForm.url"
            placeholder="请输入HTTP/HTTPS链接或磁力链"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="任务名称">
          <el-input
            v-model="addForm.title"
            placeholder="可选"
            size="large"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="adding" @click="handleAddTask">
            <el-icon><Upload /></el-icon>
            添加下载
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="task-list-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>下载队列</span>
            <el-radio-group v-model="currentStatus" size="small" @change="loadTasks">
              <el-radio-button :label="-1">全部</el-radio-button>
              <el-radio-button :label="1">下载中</el-radio-button>
              <el-radio-button :label="0">等待中</el-radio-button>
              <el-radio-button :label="2">已暂停</el-radio-button>
              <el-radio-button :label="3">已完成</el-radio-button>
              <el-radio-button :label="4">错误</el-radio-button>
            </el-radio-group>
          </div>
          <div class="header-right">
            <el-button size="small" @click="handlePauseAll">
              <el-icon><VideoPause /></el-icon>
              全部暂停
            </el-button>
            <el-button size="small" @click="handleResumeAll">
              <el-icon><VideoPlay /></el-icon>
              全部继续
            </el-button>
            <el-button size="small" type="danger" @click="handleClearCompleted">
              <el-icon><Delete /></el-icon>
              清空已完成
            </el-button>
            <el-button size="small" @click="loadTasks">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="task-list">
        <div v-if="tasks.length === 0" class="empty-state">
          <el-empty description="暂无下载任务" />
        </div>
        <div v-for="task in tasks" :key="task.id" class="task-item">
          <div class="task-item-header">
            <div class="task-info">
              <el-tag :type="getTaskTypeColor(task.type)" size="small">
                {{ task.type === 1 ? 'HTTP' : '磁力链' }}
              </el-tag>
              <span class="task-title">{{ task.title || task.file_name || '未命名任务' }}</span>
            </div>
            <div class="task-actions">
              <el-tag :type="getTaskStatusColor(task.status)" size="small">
                {{ getTaskStatusText(task.status) }}
              </el-tag>
              <el-dropdown @command="(cmd) => handleTaskAction(cmd, task)">
                <el-button size="small" text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="task.status === 0 || task.status === 1" command="pause">
                      <el-icon><VideoPause /></el-icon>
                      暂停
                    </el-dropdown-item>
                    <el-dropdown-item v-if="task.status === 2" command="resume">
                      <el-icon><VideoPlay /></el-icon>
                      继续
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon><Delete /></el-icon>
                      删除任务
                    </el-dropdown-item>
                    <el-dropdown-item command="deleteWithFiles">
                      <el-icon><Delete /></el-icon>
                      删除任务和文件
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="task-progress">
            <el-progress
              :percentage="Number(task.progress.toFixed(2))"
              :status="getProgressStatus(task.status)"
              :stroke-width="8"
            />
          </div>

          <div class="task-detail">
            <div class="detail-item">
              <span class="label">大小:</span>
              <span>{{ formatSize(task.total_size) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">已下载:</span>
              <span>{{ formatSize(task.downloaded_size) }}</span>
            </div>
            <div class="detail-item" v-if="task.status === 1">
              <span class="label">速度:</span>
              <span class="speed">{{ formatSpeed(task.speed) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">文件数:</span>
              <span>{{ task.file_count }}</span>
            </div>
            <div class="detail-item">
              <span class="label">创建时间:</span>
              <span>{{ formatTime(task.created_at) }}</span>
            </div>
          </div>

          <div v-if="task.error_message" class="task-error">
            <el-alert :title="task.error_message" type="error" :closable="false" show-icon size="small" />
          </div>
        </div>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadTasks"
          @current-change="loadTasks"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addTask, getTaskList, pauseTask, resumeTask, deleteTask, pauseAllTasks, resumeAllTasks, clearCompletedTasks } from '@/api/task'
import dayjs from 'dayjs'

const addForm = ref({
  url: '',
  title: ''
})

const adding = ref(false)
const loading = ref(false)
const tasks = ref([])
const currentStatus = ref(-1)
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

let refreshTimer = null

const loadTasks = async () => {
  loading.value = true
  try {
    const result = await getTaskList(currentStatus.value, pagination.value.page, pagination.value.pageSize)
    tasks.value = result.list
    pagination.value.total = result.total
  } catch (error) {
    console.error('Failed to load tasks:', error)
  } finally {
    loading.value = false
  }
}

const handleAddTask = async () => {
  if (!addForm.value.url.trim()) {
    ElMessage.warning('请输入下载链接')
    return
  }

  adding.value = true
  try {
    await addTask(addForm.value.url.trim(), addForm.value.title.trim())
    ElMessage.success('任务添加成功')
    addForm.value.url = ''
    addForm.value.title = ''
    loadTasks()
  } catch (error) {
    console.error('Failed to add task:', error)
  } finally {
    adding.value = false
  }
}

const handleTaskAction = async (action, task) => {
  try {
    switch (action) {
      case 'pause':
        await pauseTask(task.id)
        ElMessage.success('已暂停')
        break
      case 'resume':
        await resumeTask(task.id)
        ElMessage.success('已继续')
        break
      case 'delete':
        await ElMessageBox.confirm('确定要删除此任务吗？', '确认删除', {
          type: 'warning'
        })
        await deleteTask(task.id, false)
        ElMessage.success('任务已删除')
        break
      case 'deleteWithFiles':
        await ElMessageBox.confirm('确定要删除此任务和所有下载文件吗？此操作不可恢复！', '确认删除', {
          type: 'warning'
        })
        await deleteTask(task.id, true)
        ElMessage.success('任务和文件已删除')
        break
    }
    loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Action failed:', error)
    }
  }
}

const handlePauseAll = async () => {
  try {
    await pauseAllTasks()
    ElMessage.success('已暂停所有任务')
    loadTasks()
  } catch (error) {
    console.error('Failed to pause all:', error)
  }
}

const handleResumeAll = async () => {
  try {
    await resumeAllTasks()
    ElMessage.success('已继续所有任务')
    loadTasks()
  } catch (error) {
    console.error('Failed to resume all:', error)
  }
}

const handleClearCompleted = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有已完成的任务吗？', '确认清空', {
      type: 'warning'
    })
    await clearCompletedTasks()
    ElMessage.success('已清空已完成任务')
    loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to clear completed:', error)
    }
  }
}

const getTaskStatusText = (status) => {
  const statusMap = {
    0: '等待中',
    1: '下载中',
    2: '已暂停',
    3: '已完成',
    4: '错误',
    5: '已删除'
  }
  return statusMap[status] || '未知'
}

const getTaskStatusColor = (status) => {
  const colorMap = {
    0: 'info',
    1: 'primary',
    2: 'warning',
    3: 'success',
    4: 'danger',
    5: 'info'
  }
  return colorMap[status] || 'info'
}

const getTaskTypeColor = (type) => {
  return type === 1 ? '' : 'success'
}

const getProgressStatus = (status) => {
  const statusMap = {
    3: 'success',
    4: 'exception'
  }
  return statusMap[status] || ''
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

const formatSpeed = (bytesPerSec) => {
  if (bytesPerSec === 0) return '0 B/s'
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  let speed = bytesPerSec
  let unitIndex = 0
  while (speed >= 1024 && unitIndex < units.length - 1) {
    speed /= 1024
    unitIndex++
  }
  return `${speed.toFixed(2)} ${units[unitIndex]}`
}

const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  loadTasks()
  refreshTimer = setInterval(() => {
    if (currentStatus.value !== 3 && currentStatus.value !== 4) {
      loadTasks()
    }
  }, 5000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.tasks-page {
  max-width: 1400px;
  margin: 0 auto;
}

.add-task-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.task-list-card {
  margin-bottom: 20px;
}

.task-list {
  min-height: 200px;
}

.empty-state {
  padding: 40px 0;
}

.task-item {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-progress {
  margin-bottom: 12px;
}

.task-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  font-size: 13px;
  color: #909399;
}

.detail-item {
  display: flex;
  gap: 4px;
}

.detail-item .label {
  color: #c0c4cc;
}

.detail-item .speed {
  color: #409eff;
  font-weight: 500;
}

.task-error {
  margin-top: 12px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
