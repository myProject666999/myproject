<template>
  <div class="dashboard">
    <h2 class="page-title">数据概览</h2>
    
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-blue">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total_assets || 0 }}</div>
              <div class="stat-label">资产总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-green">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.idle_count || 0 }}</div>
              <div class="stat-label">空闲资产</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-orange">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.in_use_count || 0 }}</div>
              <div class="stat-label">使用中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-red">
              <el-icon><Tools /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.maintenance_count || 0 }}</div>
              <div class="stat-label">维修中</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-purple">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.borrowing_count || 0 }}</div>
              <div class="stat-label">领用中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-yellow">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending_maintenance || 0 }}</div>
              <div class="stat-label">待处理维修</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-cyan">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending_scrap || 0 }}</div>
              <div class="stat-label">待审批报废</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-pink">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatMoney(stats.total_value) }}</div>
              <div class="stat-label">资产总价值</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>资产分类统计</span>
          </template>
          <div class="chart-container">
            <div v-for="item in categoryStats" :key="item.id" class="chart-item">
              <div class="chart-item-header">
                <span>{{ item.name }}</span>
                <span>{{ item.count }} 件</span>
              </div>
              <el-progress :percentage="getPercentage(item.count)" :stroke-width="12" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>部门资产分布</span>
          </template>
          <div class="chart-container">
            <div v-for="item in departmentStats" :key="item.id" class="chart-item">
              <div class="chart-item-header">
                <span>{{ item.name }}</span>
                <span>{{ item.count }} 件</span>
              </div>
              <el-progress :percentage="getDepartmentPercentage(item.count)" :stroke-width="12" :color="'#67c23a'" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { stats as statsApi } from '../api'

const statsData = ref({})
const categoryStats = ref([])
const departmentStats = ref([])

const stats = computed(() => statsData.value)

const formatMoney = (value) => {
  if (!value) return '0.00'
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const getPercentage = (count) => {
  const total = categoryStats.value.reduce((sum, item) => sum + item.count, 0)
  return total > 0 ? Math.round((count / total) * 100) : 0
}

const getDepartmentPercentage = (count) => {
  const total = departmentStats.value.reduce((sum, item) => sum + item.count, 0)
  return total > 0 ? Math.round((count / total) * 100) : 0
}

const loadData = async () => {
  try {
    const [overviewRes, categoryRes, departmentRes] = await Promise.all([
      statsApi.getOverview(),
      statsApi.getByCategory(),
      statsApi.getByDepartment()
    ])
    if (overviewRes.code === 200) statsData.value = overviewRes.data
    if (categoryRes.code === 200) categoryStats.value = categoryRes.data
    if (departmentRes.code === 200) departmentStats.value = departmentRes.data
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.icon-blue { background: linear-gradient(135deg, #409eff 0%, #667eea 100%); }
.icon-green { background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%); }
.icon-orange { background: linear-gradient(135deg, #e6a23c 0%, #f5dab1 100%); color: #e6a23c; }
.icon-red { background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%); }
.icon-purple { background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%); }
.icon-yellow { background: linear-gradient(135deg, #f0c419 0%, #f7d870 100%); }
.icon-cyan { background: linear-gradient(135deg, #20b2aa 0%, #5fd4ce 100%); }
.icon-pink { background: linear-gradient(135deg, #ff69b4 0%, #ff9cc9 100%); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-container {
  max-height: 300px;
  overflow-y: auto;
}

.chart-item {
  margin-bottom: 16px;
}

.chart-item:last-child {
  margin-bottom: 0;
}

.chart-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}
</style>
