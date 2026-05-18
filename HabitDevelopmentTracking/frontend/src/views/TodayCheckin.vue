<template>
  <div class="today-checkin">
    <div class="header">
      <div>
        <h1>今日打卡</h1>
        <p class="date">{{ stats.currentDate || currentDate }}</p>
      </div>
      <el-button type="primary" @click="loadData" :icon="Refresh">
        刷新
      </el-button>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <el-icon :size="28"><Aim /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.totalHabits || 0 }}</p>
              <p class="stat-label">总习惯数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <el-icon :size="28"><Check /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.checkedToday || 0 }}</p>
              <p class="stat-label">今日已完成</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <el-icon :size="28"><LineChart /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.checkRate || 0 }}%</p>
              <p class="stat-label">完成率</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <el-icon :size="28"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.avgStreak || 0 }}天</p>
              <p class="stat-label">平均连续</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="habits-card">
      <template #header>
        <div class="card-header">
          <span>今日习惯</span>
        </div>
      </template>
      <div v-loading="loading" class="habit-list">
        <div
          v-for="habit in habits"
          :key="habit.id"
          class="habit-item"
          :class="{ checked: habit.todayChecked }"
        >
          <div class="habit-left">
            <div class="habit-icon" :style="{ backgroundColor: habit.color + '20', color: habit.color }">
              {{ habit.icon }}
            </div>
            <div class="habit-info">
              <h3>{{ habit.name }}</h3>
              <p class="habit-desc">{{ habit.description }}</p>
              <div class="habit-stats">
                <span class="streak">🔥 连续 {{ habit.currentStreak }} 天</span>
                <span class="total">📊 累计 {{ habit.totalCheckins }} 次</span>
              </div>
            </div>
          </div>
          <div class="habit-right">
            <el-button
              v-if="!habit.todayChecked"
              type="primary"
              :style="{ backgroundColor: habit.color, borderColor: habit.color }"
              @click="handleCheckin(habit)"
            >
              打卡
            </el-button>
            <el-button
              v-else
              type="success"
              plain
              @click="handleCancel(habit)"
            >
              <el-icon><Check /></el-icon>
              已完成
            </el-button>
          </div>
        </div>
        <el-empty v-if="habits.length === 0 && !loading" description="暂无习惯，去添加一个吧" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Aim, Check, LineChart, Trophy } from '@element-plus/icons-vue'
import { getTodayHabits, checkin, cancelCheckin, getStats } from '../api/habit'

const loading = ref(false)
const habits = ref([])
const stats = ref({})
const currentDate = new Date().toLocaleDateString('zh-CN')

const loadData = async () => {
  loading.value = true
  try {
    const [habitsData, statsData] = await Promise.all([
      getTodayHabits(),
      getStats()
    ])
    habits.value = habitsData
    stats.value = statsData
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleCheckin = async (habit) => {
  try {
    await checkin(habit.id)
    ElMessage.success(`${habit.name} 打卡成功！`)
    loadData()
  } catch (error) {
    console.error('打卡失败:', error)
  }
}

const handleCancel = async (habit) => {
  try {
    await ElMessageBox.confirm(`确定要取消今天的${habit.name}打卡吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cancelCheckin(habit.id)
    ElMessage.success('已取消打卡')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消打卡失败:', error)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.today-checkin {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px 0;
}

.date {
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
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
  color: white;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.habits-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.habit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.habit-item:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.habit-item.checked {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
}

.habit-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.habit-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.habit-info h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 6px 0;
}

.habit-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 8px 0;
}

.habit-stats {
  display: flex;
  gap: 16px;
}

.habit-stats span {
  font-size: 13px;
  color: #606266;
}

.habit-right {
  display: flex;
  align-items: center;
}
</style>
