<template>
  <div class="history-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>转换历史</h2>
          <el-button type="primary" @click="loadHistory">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="historyList" v-loading="loading" stripe>
        <el-table-column prop="id" label="任务ID" width="120" show-overflow-tooltip />
        <el-table-column prop="url" label="URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="style" label="样式" width="100">
          <template #default="{ row }">
            {{ getStyleText(row.style) }}
          </template>
        </el-table-column>
        <el-table-column prop="pagination" label="分页" width="80" />
        <el-table-column prop="page_count" label="页数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tooltip v-if="row.status === 'failed' && row.error_msg" :content="row.error_msg" placement="top">
              <el-tag type="danger" size="small">失败</el-tag>
            </el-tooltip>
            <el-tag v-else :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'completed'"
              type="primary"
              size="small"
              @click="downloadPDF(row)"
            >
              下载
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteJob(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="total > 0">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>

      <el-empty v-if="!loading && historyList.length === 0" description="暂无转换记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import axios from 'axios'

const historyList = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const loadHistory = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/history', {
      params: {
        page: page.value,
        page_size: pageSize.value
      }
    })
    historyList.value = res.data.data
    total.value = res.data.total
  } catch (err) {
    ElMessage.error('加载历史记录失败: ' + (err.response?.data?.error || err.message))
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage) => {
  page.value = newPage
  loadHistory()
}

const downloadPDF = (row) => {
  window.open(`/api/download/${row.id}`, '_blank')
}

const deleteJob = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条记录吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await axios.delete(`/api/job/${row.id}`)
    ElMessage.success('删除成功')
    loadHistory()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getStatusType = (status) => {
  const map = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '等待中',
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

const getStyleText = (style) => {
  const map = {
    default: '默认',
    clean: '简洁',
    dark: '深色',
    ebook: '电子书'
  }
  return map[style] || style
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.history-page {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 20px;
  color: #303133;
  margin: 0;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
