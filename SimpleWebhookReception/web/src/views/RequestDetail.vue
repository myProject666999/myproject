<template>
  <div class="request-detail">
    <div class="page-header">
      <el-button @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>请求详情</h2>
      <div class="header-actions">
        <el-button type="primary" @click="resendRequest" :loading="resending">
          <el-icon><RefreshRight /></el-icon>
          重新转发
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" v-if="request">
      <el-col :span="24">
        <el-card v-loading="loading" class="info-card">
          <template #header>
            <div class="card-header">
              <span>请求信息</span>
              <div class="request-meta">
                <el-tag :type="getMethodType(request.method)" size="large">
                  {{ request.method }}
                </el-tag>
                <el-tag :type="request.forwarded ? 'success' : 'info'" size="large">
                  {{ request.forwarded ? '已转发' : '未转发' }}
                </el-tag>
              </div>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="请求 ID">{{ request.id }}</el-descriptions-item>
            <el-descriptions-item label="接收时间">{{ formatDate(request.received_at) }}</el-descriptions-item>
            <el-descriptions-item label="来源 IP">{{ request.source_ip }}</el-descriptions-item>
            <el-descriptions-item label="User Agent">{{ request.user_agent || '-' }}</el-descriptions-item>
            <el-descriptions-item label="路径" :span="2">{{ request.path }}</el-descriptions-item>
            <el-descriptions-item v-if="request.query_params" label="查询参数" :span="2">
              <code class="inline-code">{{ request.query_params }}</code>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px" v-if="request">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>请求头</span>
              <el-button size="small" @click="copyContent(request.headers)">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </div>
          </template>
          <pre class="content-display">{{ formatJSON(request.headers) }}</pre>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>请求体</span>
              <div class="card-actions">
                <el-button size="small" @click="formatBody = !formatBody">
                  {{ formatBody ? '原始' : '格式化' }}
                </el-button>
                <el-button size="small" @click="copyContent(request.body)">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
            </div>
          </template>
          <pre class="content-display">{{ formatBody ? formatJSON(request.body) : request.body }}</pre>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px" v-if="forwardLogs.length > 0">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>转发日志</span>
          </template>

          <el-table :data="forwardLogs" stripe>
            <el-table-column prop="target_url" label="目标 URL" min-width="250" />
            <el-table-column prop="status_code" label="状态码" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status_code >= 200 && row.status_code < 300 ? 'success' : 'danger'" size="small">
                  {{ row.status_code }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                  {{ row.success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="error" label="错误信息" min-width="150">
              <template #default="{ row }">
                {{ row.error || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="forwarded_at" label="转发时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.forwarded_at) }}
              </template>
            </el-table-column>
            <el-table-column label="响应" width="100">
              <template #default="{ row }">
                <el-button
                  v-if="row.response_body"
                  size="small"
                  @click="showResponse(row)"
                >
                  查看
                </el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showResponseDialog" title="响应内容" width="700px">
      <pre class="content-display">{{ formatJSON(currentResponse) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { requestApi } from '../api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const resending = ref(false)
const request = ref(null)
const forwardLogs = ref([])
const formatBody = ref(true)
const showResponseDialog = ref(false)
const currentResponse = ref('')

const loadRequest = async () => {
  loading.value = true
  try {
    const res = await requestApi.get(route.params.id)
    request.value = res.data.request
    forwardLogs.value = res.data.forward_logs || []
  } catch (error) {
    ElMessage.error('加载请求详情失败')
  } finally {
    loading.value = false
  }
}

const resendRequest = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重新转发此请求吗？',
      '重新转发',
      { type: 'warning' }
    )
    
    resending.value = true
    await requestApi.resend(route.params.id)
    ElMessage.success('转发请求已发送')
    
    setTimeout(() => {
      loadRequest()
    }, 2000)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新转发失败')
    }
  } finally {
    resending.value = false
  }
}

const showResponse = (row) => {
  currentResponse.value = row.response_body
  showResponseDialog.value = true
}

const copyContent = async (content) => {
  if (!content) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const formatJSON = (content) => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return content
  }
}

const getMethodType = (method) => {
  const types = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info'
  }
  return types[method] || 'info'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadRequest()
})
</script>

<style scoped>
.request-detail {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  margin-left: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-meta {
  display: flex;
  gap: 8px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.info-card {
  margin-bottom: 20px;
}

.content-display {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.inline-code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}
</style>
