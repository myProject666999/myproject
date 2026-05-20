<template>
  <div class="statistics-page">
    <h2>学习统计</h2>

    <el-row :gutter="20" style="margin-bottom: 30px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon><Notebook /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">总卡片数</p>
            <p class="stat-value">{{ statistics.totalCards || 0 }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #E6A23C;">
            <el-icon><AlarmClock /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">待复习</p>
            <p class="stat-value">{{ statistics.dueCards || 0 }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67C23A;">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">今日已复习</p>
            <p class="stat-value">{{ statistics.todayReviews || 0 }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #909399;">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">今日正确率</p>
            <p class="stat-value">{{ statistics.todayAccuracy || 0 }}%</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>学习状态</span>
          </template>
          <div class="status-item">
            <span class="status-label">新卡片</span>
            <span class="status-value">{{ statistics.newCards || 0 }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">学习中</span>
            <span class="status-value">{{ statistics.learningCards || 0 }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">已掌握</span>
            <span class="status-value">{{ statistics.reviewCards || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>今日复习详情</span>
          </template>
          <div class="today-detail">
            <div class="detail-item">
              <span>复习总数</span>
              <span>{{ statistics.todayReviews || 0 }}</span>
            </div>
            <div class="detail-item">
              <span>正确数</span>
              <span>{{ statistics.todayCorrectReviews || 0 }}</span>
            </div>
            <div class="detail-item">
              <span>错误数</span>
              <span>{{ (statistics.todayReviews || 0) - (statistics.todayCorrectReviews || 0) }}</span>
            </div>
            <div class="detail-item">
              <span>正确率</span>
              <span>{{ statistics.todayAccuracy || 0 }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>SM-2 算法说明</span>
      </template>
      <div class="algorithm-info">
        <p><strong>间隔重复算法 (SM-2)</strong> 是一种基于科学记忆曲线的复习调度算法，用于优化学习效率。</p>
        <h4>评分等级：</h4>
        <ul>
          <li><strong>0 - 完全忘记</strong>：完全不记得答案，需要重新学习</li>
          <li><strong>2 - 有点印象</strong>：有些印象但想不起来</li>
          <li><strong>3 - 记得</strong>：能够回忆起答案，需要稍微思考</li>
          <li><strong>5 - 非常熟悉</strong>：立刻就能想起答案</li>
        </ul>
        <h4>算法原理：</h4>
        <p>根据你的评分动态调整复习间隔：</p>
        <ul>
          <li>评分低于 3 分：重置复习进度，重新开始学习</li>
          <li>评分 3 分及以上：延长复习间隔，间隔时间 = 当前间隔 × 难度因子</li>
          <li>难度因子根据评分动态调整，最低为 1.3</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statisticsApi } from '../services/api'
import { ElMessage } from 'element-plus'

const statistics = ref({})

const loadStatistics = async () => {
  try {
    const response = await statisticsApi.getOverallStatistics()
    statistics.value = response.data
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped>
.statistics-page {
  max-width: 1200px;
  margin: 0 auto;
}

.statistics-page h2 {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.stat-label {
  color: #909399;
  margin: 0 0 5px 0;
  font-size: 14px;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  color: #606266;
}

.status-value {
  font-weight: bold;
  color: #303133;
}

.today-detail {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.detail-item span:first-child {
  color: #606266;
}

.detail-item span:last-child {
  font-weight: bold;
  color: #303133;
  font-size: 18px;
}

.algorithm-info h4 {
  margin: 15px 0 10px 0;
  color: #303133;
}

.algorithm-info ul {
  margin: 0 0 15px 0;
  padding-left: 20px;
}

.algorithm-info li {
  margin-bottom: 5px;
  color: #606266;
}

.algorithm-info p {
  color: #606266;
  line-height: 1.6;
}
</style>
