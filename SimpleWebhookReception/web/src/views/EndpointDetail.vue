<template>
  <div class="endpoint-detail">
    <div class="page-header">
      <el-button @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>Endpoint 详情</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card v-loading="loading" class="info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-tag :type="endpoint.active ? 'success' : 'info'" size="large">
                {{ endpoint.active ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="名称">{{ endpoint.name }}</el-descriptions-item>
            <el-descriptions-item label="ID">{{ endpoint.id }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ endpoint.description || '无' }}</el-descriptions-item>
            <el-descriptions-item label="Token">
              <div class="token-display">
                <code>{{ endpoint.token }}</code>
                <el-button size="small" @click="copyToken(endpoint.token)">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="保留期">{{ endpoint.retention }} 天</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(endpoint.created_at) }}</el-descriptions-item>
          </el-descriptions>

          <div class="webhook-url-section">
            <h4>Webhook URL</h4>
            <el-input
              :model-value="webhookUrl"
              readonly
            >
              <template #append>
                <el-button @click="copyToken(webhookUrl)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </template>
            </el-input>
            <p class="tip">将此 URL 配置到 GitHub/GitLab 或其他服务的 Webhook 设置中</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>转发规则</span>
              <el-button type="primary" size="small" @click="showRuleDialog = true">
                <el-icon><Plus /></el-icon>
                添加规则
              </el-button>
            </div>
          </template>

          <el-table :data="rules" v-loading="rulesLoading" stripe>
            <el-table-column prop="name" label="名称" min-width="150" />
            <el-table-column prop="target_url" label="目标 URL" min-width="250" />
            <el-table-column prop="method" label="方法" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.method }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-switch
                  :model-value="row.active"
                  @change="toggleRule(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" type="danger" @click="deleteRule(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="!rulesLoading && rules.length === 0" description="暂无转发规则" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近请求</span>
              <el-button size="small" @click="loadRequests">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <el-table :data="requests" v-loading="requestsLoading" stripe>
            <el-table-column prop="method" label="方法" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="getMethodType(row.method)">{{ row.method }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="path" label="路径" min-width="200" />
            <el-table-column prop="source_ip" label="来源 IP" width="150" />
            <el-table-column label="转发状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.forwarded ? 'success' : 'info'" size="small">
                  {{ row.forwarded ? '已转发' : '未转发' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="received_at" label="接收时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.received_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewRequest(row)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="!requestsLoading && requests.length === 0" description="暂无请求记录" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showRuleDialog" title="添加转发规则" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="目标 URL" required>
          <el-input v-model="ruleForm.target_url" placeholder="https://example.com/webhook" />
        </el-form-item>
        <el-form-item label="请求方法">
          <el-select v-model="ruleForm.method">
            <el-option label="POST" value="POST" />
            <el-option label="GET" value="GET" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="自定义头">
          <el-input
            v-model="ruleForm.headers"
            type="textarea"
            :rows="3"
            placeholder='{"X-Custom": "value"}'
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { endpointApi, requestApi, ruleApi } from '../api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const rulesLoading = ref(false)
const requestsLoading = ref(false)

const endpoint = ref({})
const rules = ref([])
const requests = ref([])
const showRuleDialog = ref(false)

const ruleForm = ref({
  name: '',
  target_url: '',
  method: 'POST',
  headers: ''
})

const webhookUrl = computed(() => {
  if (!endpoint.value.token) return ''
  return `${window.location.origin}/webhook/${endpoint.value.token}`
})

const loadEndpoint = async () => {
  loading.value = true
  try {
    const res = await endpointApi.get(route.params.id)
    endpoint.value = res.data
  } catch (error) {
    ElMessage.error('加载 Endpoint 详情失败')
  } finally {
    loading.value = false
  }
}

const loadRules = async () => {
  rulesLoading.value = true
  try {
    const res = await endpointApi.listRules(route.params.id)
    rules.value = res.data.data || []
  } catch (error) {
    ElMessage.error('加载转发规则失败')
  } finally {
    rulesLoading.value = false
  }
}

const loadRequests = async () => {
  requestsLoading.value = true
  try {
    const res = await requestApi.list(route.params.id)
    requests.value = res.data.data || []
  } catch (error) {
    ElMessage.error('加载请求列表失败')
  } finally {
    requestsLoading.value = false
  }
}

const copyToken = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const saveRule = async () => {
  if (!ruleForm.value.name || !ruleForm.value.target_url) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    await endpointApi.createRule(route.params.id, ruleForm.value)
    ElMessage.success('添加成功')
    showRuleDialog.value = false
    ruleForm.value = {
      name: '',
      target_url: '',
      method: 'POST',
      headers: ''
    }
    loadRules()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const toggleRule = async (row) => {
  try {
    await ruleApi.update(row.id, { active: !row.active })
    ElMessage.success('状态已更新')
    loadRules()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const deleteRule = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除规则 "${row.name}" 吗？`, '删除确认', {
      type: 'warning'
    })
    await ruleApi.delete(row.id)
    ElMessage.success('删除成功')
    loadRules()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const viewRequest = (row) => {
  router.push(`/request/${row.id}`)
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
  loadEndpoint()
  loadRules()
  loadRequests()
})
</script>

<style scoped>
.endpoint-detail {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-card {
  margin-bottom: 20px;
}

.token-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.token-display code {
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.webhook-url-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.webhook-url-section h4 {
  margin: 0 0 12px 0;
  color: #606266;
}

.tip {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 12px;
}
</style>
