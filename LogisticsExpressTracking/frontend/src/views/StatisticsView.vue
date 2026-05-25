<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>数据统计</h2>
    </div>

    <el-row :gutter="20" class="stats-cards">
      <el-col :span="4">
        <div class="stat-card total">
          <el-icon :size="40"><CollectionTag /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalWaybillCount || 0 }}</div>
            <div class="stat-label">运单总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card pending">
          <el-icon :size="40"><Clock /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pendingCount || 0 }}</div>
            <div class="stat-label">待揽件</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card transit">
          <el-icon :size="40"><Van /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ stats.inTransitCount || 0 }}</div>
            <div class="stat-label">运输中</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card delivering">
          <el-icon :size="40"><Truck /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ stats.deliveringCount || 0 }}</div>
            <div class="stat-label">派送中</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card delivered">
          <el-icon :size="40"><CircleCheck /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ stats.deliveredCount || 0 }}</div>
            <div class="stat-label">已签收</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card today">
          <el-icon :size="40"><Calendar /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayNewCount || 0 }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>运单状态分布</span>
          </template>
          <div class="status-chart">
            <div class="chart-item">
              <div class="chart-label">待揽件</div>
              <div class="chart-bar">
                <div class="chart-fill warning" :style="getBarStyle(stats.pendingCount, stats.totalWaybillCount)"></div>
              </div>
              <div class="chart-value">{{ stats.pendingCount || 0 }}</div>
            </div>
            <div class="chart-item">
              <div class="chart-label">运输中</div>
              <div class="chart-bar">
                <div class="chart-fill primary" :style="getBarStyle(stats.inTransitCount, stats.totalWaybillCount)"></div>
              </div>
              <div class="chart-value">{{ stats.inTransitCount || 0 }}</div>
            </div>
            <div class="chart-item">
              <div class="chart-label">派送中</div>
              <div class="chart-bar">
                <div class="chart-fill" :style="getBarStyle(stats.deliveringCount, stats.totalWaybillCount)"></div>
              </div>
              <div class="chart-value">{{ stats.deliveringCount || 0 }}</div>
            </div>
            <div class="chart-item">
              <div class="chart-label">已签收</div>
              <div class="chart-bar">
                <div class="chart-fill success" :style="getBarStyle(stats.deliveredCount, stats.totalWaybillCount)"></div>
              </div>
              <div class="chart-value">{{ stats.deliveredCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>今日数据</span>
          </template>
          <div class="today-stats">
            <div class="today-item">
              <div class="today-icon new">
                <el-icon :size="28"><Plus /></el-icon>
              </div>
              <div class="today-info">
                <div class="today-value">{{ stats.todayNewCount || 0 }}</div>
                <div class="today-label">今日新增运单</div>
              </div>
            </div>
            <div class="today-item">
              <div class="today-icon delivered">
                <el-icon :size="28"><CircleCheck /></el-icon>
              </div>
              <div class="today-info">
                <div class="today-value">{{ stats.todayDeliveredCount || 0 }}</div>
                <div class="today-label">今日已签收</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStatistics } from '../api/statistics'

const stats = ref({})

const getPercent = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value || 0) / total * 100)
}

const getBarStyle = (value, total) => {
  return { width: getPercent(value, total) + '%' }
}

const fetchData = async () => {
  const res = await getStatistics()
  if (res.code === 200) {
    stats.value = res.data
  }
}

onMounted(fetchData)
</script>

<style scoped>
.statistics-container {
  max-width: 1400px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  color: #303133;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card .el-icon {
  padding: 12px;
  border-radius: 12px;
}

.stat-card.total .el-icon {
  background: #ecf5ff;
  color: #409eff;
}

.stat-card.pending .el-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-card.transit .el-icon {
  background: #f0f9ff;
  color: #409eff;
}

.stat-card.delivering .el-icon {
  background: #ecf5ff;
  color: #1890ff;
}

.stat-card.delivered .el-icon {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-card.today .el-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.chart-card {
  margin-bottom: 20px;
}

.status-chart {
  padding: 20px 0;
}

.chart-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.chart-label {
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.chart-bar {
  flex: 1;
  height: 24px;
  background: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 16px;
}

.chart-fill {
  height: 100%;
  background: #409eff;
  border-radius: 12px;
  transition: width 0.5s ease;
}

.chart-fill.primary {
  background: #409eff;
}

.chart-fill.warning {
  background: #e6a23c;
}

.chart-fill.success {
  background: #67c23a;
}

.chart-value {
  width: 60px;
  font-size: 14px;
  color: #303133;
  text-align: right;
}

.today-stats {
  display: flex;
  justify-content: space-around;
  padding: 30px 0;
}

.today-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.today-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.today-icon.new {
  background: #ecf5ff;
  color: #409eff;
}

.today-icon.delivered {
  background: #f0f9eb;
  color: #67c23a;
}

.today-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.today-label {
  font-size: 14px;
  color: #909399;
}
</style>
