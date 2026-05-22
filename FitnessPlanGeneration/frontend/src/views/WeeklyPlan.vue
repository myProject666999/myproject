<template>
  <div class="page-container">
    <el-card v-if="weeklyPlan" class="card-container">
      <template #header>
        <div class="card-header">
          <span>本周计划</span>
          <div>
            <el-tag type="primary" size="large">{{ weeklyPlan.goal === 1 ? '增肌' : '减脂' }}</el-tag>
            <span class="date-range">{{ weeklyPlan.weekStartDate }} ~ {{ weeklyPlan.weekEndDate }}</span>
          </div>
        </div>
      </template>

      <el-timeline v-if="weeklyPlan.dailyPlans?.length">
        <el-timeline-item
          v-for="plan in weeklyPlan.dailyPlans"
          :key="plan.id"
          :timestamp="plan.planDate"
          :type="getTimelineType(plan)"
          :hollow="plan.isRestDay === 1"
          placement="top">
          <el-card
            class="day-card"
            :class="{ 'rest-day-card': plan.isRestDay === 1, 'training-day-card': plan.isRestDay !== 1 }"
            shadow="hover"
            @click="goToDailyPlan(plan)">
            <div class="plan-header">
              <div class="plan-info">
                <el-tag :type="plan.isRestDay === 1 ? 'success' : 'primary'" size="large">
                  {{ getDayName(plan.dayOfWeek) }}
                </el-tag>
                <span class="focus-text">{{ plan.isRestDay === 1 ? '休息日' : plan.trainingFocus + '训练' }}</span>
              </div>
              <el-tag :type="getStatusType(plan.status)" class="status-tag">
                {{ getStatusText(plan.status) }}
              </el-tag>
            </div>
            <div v-if="plan.isRestDay !== 1 && plan.exercises?.length" class="plan-content">
              <div class="exercise-summary">
                <el-icon><List /></el-icon>
                <span>{{ plan.exercises.length }} 个动作 · {{ plan.totalDuration }} 分钟 · {{ plan.totalCalories }} 大卡</span>
              </div>
              <div class="exercise-preview">
                <el-tag
                  v-for="ex in plan.exercises.slice(0, 4)"
                  :key="ex.id"
                  size="small"
                  type="info"
                  class="exercise-tag">
                  {{ ex.exerciseName }}
                </el-tag>
                <el-tag v-if="plan.exercises.length > 4" size="small" type="info" class="exercise-tag">
                  +{{ plan.exercises.length - 4 }}
                </el-tag>
              </div>
            </div>
            <div v-else-if="plan.isRestDay === 1" class="rest-content">
              <el-icon :size="32" color="#67c23a"><CoffeeCup /></el-icon>
              <span>好好休息，恢复体力</span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <el-empty v-else description="暂无周计划，请先填写问卷并生成计划">
      <el-button type="primary" @click="goToQuestionnaire">去填写问卷</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentWeeklyPlan } from '@/api'

const router = useRouter()
const weeklyPlan = ref(null)
const userInfo = ref({})

onMounted(() => {
  const userStr = localStorage.getItem('fitness_user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
    loadWeeklyPlan()
  }
})

function loadWeeklyPlan() {
  getCurrentWeeklyPlan(userInfo.value.id).then(res => {
    weeklyPlan.value = res.data
  }).catch(() => {})
}

function getDayName(day) {
  const names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return names[day - 1] || ''
}

function getStatusType(status) {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = { 0: '未开始', 1: '进行中', 2: '已完成', 3: '已跳过' }
  return map[status] || '未知'
}

function getTimelineType(plan) {
  if (plan.isRestDay === 1) return 'success'
  if (plan.status === 2) return 'success'
  if (plan.status === 1) return 'warning'
  return 'primary'
}

function goToDailyPlan(plan) {
  if (plan.isRestDay !== 1) {
    router.push(`/daily-plan/${plan.id}`)
  }
}

function goToQuestionnaire() {
  router.push('/questionnaire')
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-range {
  margin-left: 12px;
  color: #909399;
  font-size: 14px;
}

.day-card {
  cursor: pointer;
  transition: all 0.3s;
}

.day-card:hover {
  transform: translateY(-2px);
}

.rest-day-card {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
}

.training-day-card {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.plan-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.focus-text {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.exercise-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
}

.exercise-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.exercise-tag {
  margin: 0;
}

.rest-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #67c23a;
}
</style>
