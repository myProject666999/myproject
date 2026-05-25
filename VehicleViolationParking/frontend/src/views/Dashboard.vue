<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">总车辆数</div>
              <div class="stat-value">{{ overview.total_vehicles || 0 }}</div>
            </div>
            <el-icon :size="48" color="#409eff"><Van /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">车位总数</div>
              <div class="stat-value">{{ overview.total_spots || 0 }}</div>
            </div>
            <el-icon :size="48" color="#67c23a"><Location /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">今日收入</div>
              <div class="stat-value">¥{{ overview.today_revenue || 0 }}</div>
            </div>
            <el-icon :size="48" color="#e6a23c"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">在场车辆</div>
              <div class="stat-value">{{ overview.current_inside || 0 }}</div>
            </div>
            <el-icon :size="48" color="#f56c6c"><Tickets /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="spot-row">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>车位状态</span>
              <el-tag type="success">空闲 {{ overview.free_spots || 0 }}</el-tag>
              <el-tag type="danger">占用 {{ overview.occupied_spots || 0 }}</el-tag>
            </div>
          </template>
          <div class="spot-usage">
            <div class="usage-bar">
              <div
                class="usage-occupied"
                :style="{ width: spotUsageRate + '%' }"
              ></div>
            </div>
            <div class="usage-text">
              使用率: {{ spotUsageRate.toFixed(1) }}%
            </div>
          </div>
          <div class="spot-legend">
            <span class="legend-item"><i class="dot free"></i>空闲</span>
            <span class="legend-item"><i class="dot occupied"></i>占用</span>
            <span class="legend-item"><i class="dot reserved"></i>预留</span>
            <span class="legend-item"><i class="dot repair"></i>维修</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>车辆类型分布</span>
          </template>
          <div class="vehicle-stats">
            <div class="stat-item">
              <div class="stat-item-label">月卡车辆</div>
              <div class="stat-item-value">{{ overview.monthly_vehicles || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-item-label">临时车辆</div>
              <div class="stat-item-value">{{ overview.temp_vehicles || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-item-label">有效月卡</div>
              <div class="stat-item-value">{{ overview.active_monthly_cards || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="14">
        <el-card>
          <template #header>
            <span>最近出入记录</span>
          </template>
          <el-table :data="recentRecords" stripe style="width: 100%">
            <el-table-column prop="plate_number" label="车牌号" width="120" />
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.access_type === 1 ? 'success' : 'info'">
                  {{ row.access_type === 1 ? '入场' : '出场' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="access_time" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.access_time) }}
              </template>
            </el-table-column>
            <el-table-column label="费用" width="100">
              <template #default="{ row }">
                {{ row.parking_fee ? '¥' + row.parking_fee : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card>
          <template #header>
            <span>即将到期月卡</span>
          </template>
          <el-table :data="expiringCards" stripe style="width: 100%">
            <el-table-column prop="plate_number" label="车牌号" width="120" />
            <el-table-column prop="owner_name" label="车主" width="100" />
            <el-table-column prop="end_date" label="到期日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.end_date) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getDashboardOverview,
  getRecentRecords,
  getExpiringCardsDashboard
} from '@/api'

const overview = ref({})
const recentRecords = ref([])
const expiringCards = ref([])

const spotUsageRate = computed(() => {
  const total = overview.value.total_spots || 0
  const occupied = overview.value.occupied_spots || 0
  return total > 0 ? (occupied / total * 100) : 0
})

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const fetchData = async () => {
  try {
    const [overviewRes, recordsRes, cardsRes] = await Promise.all([
      getDashboardOverview(),
      getRecentRecords(),
      getExpiringCardsDashboard()
    ])
    
    if (overviewRes.code === 0) {
      overview.value = overviewRes.data
    }
    if (recordsRes.code === 0) {
      recentRecords.value = recordsRes.data || []
    }
    if (cardsRes.code === 0) {
      expiringCards.value = cardsRes.data || []
    }
  } catch (error) {
    console.error('Fetch dashboard data error:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.spot-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spot-usage {
  padding: 20px 0;
}

.usage-bar {
  height: 24px;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}

.usage-occupied {
  height: 100%;
  background: linear-gradient(90deg, #67c23a, #e6a23c, #f56c6c);
  transition: width 0.3s;
}

.usage-text {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.spot-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}

.dot.free { background: #67c23a; }
.dot.occupied { background: #f56c6c; }
.dot.reserved { background: #e6a23c; }
.dot.repair { background: #909399; }

.vehicle-stats {
  padding: 10px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item-label {
  color: #606266;
  font-size: 14px;
}

.stat-item-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}
</style>
