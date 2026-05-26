<template>
  <div class="task-list-page">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filter">
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部状态" clearable style="width: 160px" @change="loadTasks">
            <el-option label="等待中" value="pending" />
            <el-option label="转码中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Refresh" @click="loadTasks" :loading="loading">刷新</el-button>
          <el-switch
            v-model="autoRefresh"
            active-text="自动刷新"
            style="margin-left: 16px"
            @change="toggleAutoRefresh"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="tasks" v-loading="loading" stripe style="width: 100%" empty-text="暂无任务">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="file_name" label="文件名" min-width="180" show-overflow-tooltip />
        <el-table-column label="大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column label="目标格式" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.output_format.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="180">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="row.status === 'failed' ? 'exception' : row.status === 'completed' ? 'success' : undefined"
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column prop="retry_count" label="重试" width="80" align="center">
          <template #default="{ row }">
            {{ row.retry_count }} / {{ row.max_retries }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="goToProgress(row.id)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button
              v-if="row.status === 'completed'"
              size="small"
              type="success"
              link
              @click="handleDownload(row)"
            >
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadTasks"
        @current-change="loadTasks"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, View, Download, Delete } from '@element-plus/icons-vue'
import { getTaskList, deleteTask, downloadTask } from '../api'

const router = useRouter()
const loading = ref(false)
const tasks = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const autoRefresh = ref(false)
const filter = ref({ status: '' })
let refreshTimer = null

function loadTasks() {
  loading.value = true
  getTaskList({
    page: page.value,
    page_size: pageSize.value,
    status: filter.value.status || undefined
  }).then(({ data }) => {
    tasks.value = data.items || []
    total.value = data.total || 0
  }).catch(() => {
    ElMessage.error('加载任务列表失败')
  }).finally(() => {
    loading.value = false
  })
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

function goToProgress(id) {
  router.push(`/progress/${id}`)
}

function handleDownload(row) {
  downloadTask(row.id)
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除任务 #${row.id} (${row.file_name}) 吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTask(row.id)
      ElMessage.success('删除成功')
      loadTasks()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

function toggleAutoRefresh(val) {
  if (val) {
    refreshTimer = setInterval(loadTasks, 3000)
    ElMessage.info('已开启自动刷新（每3秒）')
  } else {
    if (refreshTimer) clearInterval(refreshTimer)
    ElMessage.info('已关闭自动刷新')
  }
}

onMounted(loadTasks)

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.task-list-page {
  max-width: 1400px;
  margin: 0 auto;
}
.filter-card {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
