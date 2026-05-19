<template>
  <div class="visit-logs">
    <el-container>
      <el-header class="header">
        <el-button @click="back">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>访问统计</h2>
        <div></div>
      </el-header>
      <el-main>
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <el-icon class="stat-icon" style="color: #409eff;"><View /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ totalViews }}</div>
                  <div class="stat-label">总浏览量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <el-icon class="stat-icon" style="color: #67c23a;"><User /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ uniqueVisitors }}</div>
                  <div class="stat-label">独立访客</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <el-icon class="stat-icon" style="color: #e6a23c;"><Calendar /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ todayViews }}</div>
                  <div class="stat-label">今日访问</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <el-icon class="stat-icon" style="color: #f56c6c;"><TrendCharts /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ avgViews.toFixed(1) }}</div>
                  <div class="stat-label">日均访问</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="logs-card">
          <template #header>
            <div class="card-header">
              <span>访问日志</span>
              <el-button size="small" @click="loadLogs">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <el-table :data="logs" stripe v-loading="loading">
            <el-table-column prop="ip" label="IP地址" width="150" />
            <el-table-column prop="userAgent" label="浏览器信息" show-overflow-tooltip />
            <el-table-column prop="referer" label="来源页面" show-overflow-tooltip />
            <el-table-column prop="visitedAt" label="访问时间" width="200">
              <template #default="{ row }">
                {{ formatDate(row.visitedAt) }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="logs.length === 0 && !loading" description="暂无访问记录" />
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, View, User, Calendar, TrendCharts, Refresh } from '@element-plus/icons-vue'
import { visitLogApi } from '../api'

const route = useRoute()
const router = useRouter()
const resumeId = route.params.id

const logs = ref([])
const loading = ref(false)

const totalViews = computed(() => logs.value.length)
const uniqueVisitors = computed(() => {
  const ips = new Set(logs.value.map(log => log.ip))
  return ips.size
})
const todayViews = computed(() => {
  const today = new Date().toDateString()
  return logs.value.filter(log => new Date(log.visitedAt).toDateString() === today).length
})
const avgViews = computed(() => {
  if (logs.value.length === 0) return 0
  const dates = new Set(logs.value.map(log => new Date(log.visitedAt).toDateString()))
  return logs.value.length / dates.size
})

const loadLogs = async () => {
  loading.value = true
  try {
    logs.value = await visitLogApi.list(resumeId)
  } catch (e) {
    ElMessage.error('加载日志失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const back = () => {
  router.push('/resumes')
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.visit-logs {
  min-height: 100vh;
  background-color: #f5f7fa;
}
.header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header h2 {
  margin: 0;
}
.stats-row {
  margin-bottom: 20px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
}
.stat-icon {
  font-size: 40px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  color: #909399;
  font-size: 14px;
}
.logs-card {
  margin-top: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
