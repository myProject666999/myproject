<template>
  <div class="statistics">
    <div class="page-header">
      <h2>数据统计</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card total-games">
          <div class="stat-icon">
            <el-icon :size="40"><Collection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalGames || 0 }}</div>
            <div class="stat-label">游戏总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card playtime">
          <div class="stat-icon">
            <el-icon :size="40"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatPlayTime(stats.totalPlayTime) }}</div>
            <div class="stat-label">总游玩时长</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card completed">
          <div class="stat-icon">
            <el-icon :size="40"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completedGames || 0 }}</div>
            <div class="stat-label">已通关</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card favorite">
          <div class="stat-icon">
            <el-icon :size="40"><Star /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.favoriteGames || 0 }}</div>
            <div class="stat-label">收藏游戏</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <h3>游戏状态分布</h3>
          <div class="progress-list">
            <div class="progress-item">
              <div class="progress-label">
                <span>进行中</span>
                <span>{{ stats.inProgressGames || 0 }} 款</span>
              </div>
              <el-progress :percentage="getPercentage(stats.inProgressGames)" color="#409eff" />
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>已通关</span>
                <span>{{ stats.completedGames || 0 }} 款</span>
              </div>
              <el-progress :percentage="getPercentage(stats.completedGames)" color="#67c23a" />
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>未开始</span>
                <span>{{ stats.notStartedGames || 0 }} 款</span>
              </div>
              <el-progress :percentage="getPercentage(stats.notStartedGames)" color="#909399" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <h3>最近游玩记录</h3>
          <el-empty description="暂无游玩记录" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { statisticsApi } from '../api'

const stats = reactive({
  totalGames: 0,
  totalPlayTime: 0,
  completedGames: 0,
  inProgressGames: 0,
  notStartedGames: 0,
  favoriteGames: 0
})

const formatPlayTime = (minutes) => {
  if (!minutes) return '0小时'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
  }
  return `${mins}分钟`
}

const getPercentage = (value) => {
  if (!stats.totalGames) return 0
  return Math.round((value / stats.totalGames) * 100)
}

const loadStatistics = async () => {
  try {
    const res = await statisticsApi.getUserStatistics(1)
    if (res.code === 200) {
      Object.assign(stats, res.data)
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped>
.statistics {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}
.total-games .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.playtime .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}
.completed .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}
.favorite .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #1e293b;
}
.stat-label {
  color: #64748b;
  font-size: 14px;
}
.charts-row {
  margin-top: 20px;
}
.charts-row h3 {
  margin: 0 0 20px 0;
  color: #334155;
}
.progress-item {
  margin-bottom: 20px;
}
.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #475569;
  font-size: 14px;
}
</style>
