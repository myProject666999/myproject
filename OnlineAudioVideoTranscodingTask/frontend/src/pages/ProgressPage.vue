<template>
  <div class="progress-page">
    <el-page-header class="page-header" @back="goBack" :content="`任务 #${taskId} 详情`" />

    <el-row :gutter="24" class="content-row">
      <el-col :span="16">
        <el-card class="task-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#667eea"><Document /></el-icon>
              <span>任务信息</span>
              <el-tag :type="statusType(task.status)" size="large" effect="dark" style="margin-left: auto">
                {{ statusText(task.status) }}
              </el-tag>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务ID">{{ task.id }}</el-descriptions-item>
            <el-descriptions-item label="文件名">{{ task.file_name }}</el-descriptions-item>
            <el-descriptions-item label="原始大小">{{ formatFileSize(task.file_size) }}</el-descriptions-item>
            <el-descriptions-item label="目标格式">{{ task.output_format?.toUpperCase() }}</el-descriptions-item>
            <el-descriptions-item label="重试次数">{{ task.retry_count }} / {{ task.max_retries }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(task.created_at) }}</el-descriptions-item>
            <el-descriptions-item v-if="task.status === 'completed'" label="输出大小">
              {{ formatFileSize(task.output_size) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="task.status === 'completed'" label="输出路径">
              {{ task.output_path }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="progress-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#667eea"><DataLine /></el-icon>
              <span>转码进度</span>
              <el-switch
                v-model="autoRefresh"
                active-text="自动刷新"
                style="margin-left: auto"
                @change="toggleAutoRefresh"
              />
            </div>
          </template>

          <div class="progress-container">
            <el-progress
              :percentage="task.progress || 0"
              :status="progressStatus"
              :stroke-width="20"
              :text-inside="true"
              style="max-width: 100%"
            />
            <div class="progress-info">
              <span>当前进度：<strong>{{ task.progress || 0 }}%</strong></span>
              <span v-if="task.status === 'processing'" class="processing-tip">
                <el-icon class="spinning"><Loading /></el-icon>
                正在转码中，请稍候...
              </span>
              <span v-if="task.status === 'completed'" class="success-tip">
                <el-icon><CircleCheckFilled /></el-icon>
                转码完成！
              </span>
              <span v-if="task.status === 'failed'" class="error-tip">
                <el-icon><CircleCloseFilled /></el-icon>
                转码失败
              </span>
            </div>
          </div>

          <div v-if="task.status === 'completed'" class="action-buttons">
            <el-button type="primary" size="large" :icon="Download" @click="handleDownload">
              下载转码文件
            </el-button>
          </div>

          <el-alert
            v-if="task.status === 'failed'"
            :title="'转码失败：' + (task.error_message || '未知错误')"
            type="error"
            :closable="false"
            show-icon
          />
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="side-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#667eea"><Operation /></el-icon>
              <span>任务状态</span>
            </div>
          </template>
          <div class="status-timeline">
            <el-timeline>
              <el-timeline-item
                v-for="(step, idx) in steps"
                :key="idx"
                :timestamp="step.timestamp"
                :type="step.type"
                :hollow="step.hollow"
              >
                <div class="timeline-content">
                  <el-icon :size="18"><component :is="step.icon" /></el-icon>
                  <span>{{ step.title }}</span>
                  <span v-if="step.detail" class="timeline-detail">{{ step.detail }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document, DataLine, Operation, Download, Loading,
  CircleCheckFilled, CircleCloseFilled, MoreFilled, VideoPlay, Check, Close
} from '@element-plus/icons-vue'
import { getTask, downloadTask } from '../api'

const route = useRoute()
const router = useRouter()
const taskId = computed(() => route.params.id)

const loading = ref(false)
const task = ref({})
const autoRefresh = ref(true)
let refreshTimer = null

const steps = computed(() => {
  const s = [
    { title: '创建任务', type: 'primary', hollow: false, icon: 'MoreFilled', timestamp: formatTime(task.value.created_at), detail: task.value.created_at ? '任务已创建' : '等待中' },
    { title: '加入队列', type: task.value.status !== 'pending' ? 'success' : 'primary', hollow: task.value.status === 'pending', icon: 'VideoPlay', detail: task.value.status === 'pending' ? '等待处理' : '已入队' },
    { title: '开始转码', type: task.value.status === 'processing' || task.value.status === 'completed' || task.value.status === 'failed' ? (task.value.status === 'failed' ? 'danger' : 'success') : 'primary', hollow: task.value.status === 'pending', icon: 'Loading', detail: task.value.status === 'processing' ? `进度 ${task.value.progress}%` : task.value.status === 'completed' ? '转码完成' : task.value.status === 'failed' ? '转码失败' : '等待中' },
    { title: '完成', type: task.value.status === 'completed' ? 'success' : task.value.status === 'failed' ? 'danger' : 'primary', hollow: task.value.status !== 'completed' && task.value.status !== 'failed', icon: task.value.status === 'completed' ? 'Check' : 'Close', detail: task.value.status === 'completed' ? '可下载' : task.value.status === 'failed' ? '任务失败' : '等待中' }
  ]
  return s
})

const progressStatus = computed(() => {
  if (task.value.status === 'completed') return 'success'
  if (task.value.status === 'failed') return 'exception'
  return ''
})

async function loadTask() {
  loading.value = true
  try {
    const { data } = await getTask(taskId.value)
    task.value = data
    if (data.status === 'completed' || data.status === 'failed') {
      autoRefresh.value = false
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
      }
    }
  } catch {
    ElMessage.error('加载任务信息失败')
  } finally {
    loading.value = false
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return size.toFixed(2) + ' ' + units[i]
}

function formatTime(timeStr) {
  if (!timeStr) return '-'
  return new Date(timeStr).toLocaleString('zh-CN')
}

function statusType(status) {
  const map = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

function statusText(status) {
  const map = {
    pending: '等待中',
    processing: '转码中',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

function handleDownload() {
  downloadTask(taskId.value)
}

function goBack() {
  router.back()
}

function toggleAutoRefresh(val) {
  if (val) {
    if (!refreshTimer) {
      refreshTimer = setInterval(loadTask, 2000)
    }
  } else {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }
}

onMounted(() => {
  loadTask()
  if (autoRefresh.value) {
    refreshTimer = setInterval(loadTask, 2000)
  }
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.progress-page {
  max-width: 1400px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 16px;
  padding: 0 0 16px;
}
.content-row {
  align-items: flex-start;
}
.task-card, .progress-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}
.progress-container {
  text-align: center;
  padding: 20px 0;
}
.progress-info {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 15px;
  color: #606266;
}
.progress-info strong {
  color: #303133;
  font-size: 18px;
}
.processing-tip {
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 4px;
}
.success-tip {
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}
.error-tip {
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 4px;
}
.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.action-buttons {
  margin-top: 20px;
  text-align: center;
}
.side-card {
  position: sticky;
  top: 0;
}
.status-timeline {
  padding: 10px 0;
}
.timeline-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.timeline-detail {
  font-size: 12px;
  color: #909399;
  width: 100%;
}
</style>
