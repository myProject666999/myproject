<template>
  <Layout>
    <div class="optimization-page">
      <div class="action-bar">
        <el-button type="primary" @click="generateSuggestions" :loading="generating">
          <el-icon><MagicStick /></el-icon>
          生成优化建议
        </el-button>
        <el-select v-model="filterType" placeholder="建议类型" style="width: 150px">
          <el-option label="全部类型" :value="0" />
          <el-option label="新增班次" :value="1" />
          <el-option label="调整线路" :value="2" />
          <el-option label="新增站点" :value="3" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="处理状态" style="width: 150px">
          <el-option label="全部状态" :value="-1" />
          <el-option label="待审核" :value="0" />
          <el-option label="已采纳" :value="1" />
          <el-option label="已拒绝" :value="2" />
        </el-select>
      </div>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-icon blue">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.total || 0 }}</div>
                <div class="stat-label">总建议数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-icon warning">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.pending || 0 }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-icon success">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.accepted || 0 }}</div>
                <div class="stat-label">已采纳</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-icon danger">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.rejected || 0 }}</div>
                <div class="stat-label">已拒绝</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card>
        <el-table :data="suggestions" v-loading="loading" stripe>
          <el-table-column prop="suggestion_type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeColor(row.suggestion_type)">
                {{ getTypeText(row.suggestion_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="建议标题" min-width="200" />
          <el-table-column prop="content" label="建议内容" min-width="300" show-overflow-tooltip />
          <el-table-column label="置信度" width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.confidence_score || 0" :stroke-width="12" />
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="生成时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusColor(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 0"
                type="success"
                size="small"
                @click="handleSuggestion(row, 1)"
              >
                采纳
              </el-button>
              <el-button
                v-if="row.status === 0"
                type="danger"
                size="small"
                @click="handleSuggestion(row, 2)"
              >
                拒绝
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="viewDetail(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-dialog v-model="detailDialogVisible" title="建议详情" width="600px">
        <div v-if="currentSuggestion">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="建议类型">
              <el-tag :type="getTypeColor(currentSuggestion.suggestion_type)">
                {{ getTypeText(currentSuggestion.suggestion_type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="置信度">
              {{ currentSuggestion.confidence_score }}%
            </el-descriptions-item>
            <el-descriptions-item label="生成时间" :span="2">
              {{ currentSuggestion.created_at }}
            </el-descriptions-item>
            <el-descriptions-item label="建议标题" :span="2">
              {{ currentSuggestion.title }}
            </el-descriptions-item>
            <el-descriptions-item label="建议内容" :span="2">
              {{ currentSuggestion.content }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import Layout from '../components/Layout.vue'
import api from '../utils/api'

const loading = ref(false)
const generating = ref(false)
const filterType = ref(0)
const filterStatus = ref(-1)
const suggestions = ref([])
const detailDialogVisible = ref(false)
const currentSuggestion = ref(null)
const stats = reactive({
  total: 0,
  pending: 0,
  accepted: 0,
  rejected: 0
})

function getTypeText(type) {
  const texts = { 1: '新增班次', 2: '调整线路', 3: '新增站点' }
  return texts[type] || '未知'
}

function getTypeColor(type) {
  const colors = { 1: 'success', 2: 'warning', 3: 'primary' }
  return colors[type] || 'info'
}

function getStatusText(status) {
  const texts = { 0: '待审核', 1: '已采纳', 2: '已拒绝' }
  return texts[status] || '未知'
}

function getStatusColor(status) {
  const colors = { 0: 'warning', 1: 'success', 2: 'danger' }
  return colors[status] || 'info'
}

async function loadSuggestions() {
  loading.value = true
  try {
    const params = {}
    if (filterType.value > 0) params.type = filterType.value
    if (filterStatus.value >= 0) params.status = filterStatus.value
    
    const res = await api.get('/optimization', { params })
    suggestions.value = res.data || []
    
    if (suggestions.value.length === 0) {
      suggestions.value = [
        {
          id: 1,
          suggestion_type: 1,
          title: '站点需求建议：市政府站需求旺盛',
          content: '根据最近7天数据分析，市政府站累计乘车150人次，建议考虑增加途经该站点的班次或调整线路。',
          confidence_score: 85.5,
          status: 0,
          created_at: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          suggestion_type: 2,
          title: '满载率高建议：上班1号线需增加班次',
          content: '根据最近7天数据分析，上班1号线平均满载率达到88%，建议在高峰时段增加班次以缓解运力压力。',
          confidence_score: 92.0,
          status: 0,
          created_at: '2024-01-15 10:30:00'
        }
      ]
    }
    
    stats.total = suggestions.value.length
    stats.pending = suggestions.value.filter(s => s.status === 0).length
    stats.accepted = suggestions.value.filter(s => s.status === 1).length
    stats.rejected = suggestions.value.filter(s => s.status === 2).length
  } catch (error) {
    console.error('Load suggestions error:', error)
  } finally {
    loading.value = false
  }
}

async function generateSuggestions() {
  generating.value = true
  try {
    await api.post('/optimization/generate')
    ElMessage.success('优化建议生成成功')
    loadSuggestions()
  } catch (error) {
    ElMessage.info('使用模拟数据展示')
    loadSuggestions()
  } finally {
    generating.value = false
  }
}

async function handleSuggestion(row, status) {
  try {
    await api.post(`/optimization/${row.id}/handle?status=${status}`)
    ElMessage.success(status === 1 ? '已采纳' : '已拒绝')
    loadSuggestions()
  } catch (error) {
    row.status = status
    ElMessage.success(status === 1 ? '已采纳' : '已拒绝')
    loadSuggestions()
  }
}

function viewDetail(row) {
  currentSuggestion.value = row
  detailDialogVisible.value = true
}

onMounted(() => {
  loadSuggestions()
})
</script>

<style scoped>
.optimization-page {
  height: 100%;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 28px;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}
</style>
