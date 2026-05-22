<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="48" color="#409eff"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ userInfo.nickname || userInfo.username }}</div>
              <div class="stat-label">当前用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card" @click="goToQuestionnaire">
          <div class="stat-content">
            <el-icon :size="48" color="#67c23a"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ hasQuestionnaire ? '已填写' : '未填写' }}</div>
              <div class="stat-label">目标问卷</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card" @click="goToWeeklyPlan">
          <div class="stat-content">
            <el-icon :size="48" color="#e6a23c"><Calendar /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ hasWeeklyPlan ? '已生成' : '未生成' }}</div>
              <div class="stat-label">本周计划</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>今日计划</span>
            </div>
          </template>
          <div v-if="todayPlan" class="today-plan">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="日期">{{ todayPlan.planDate }}</el-descriptions-item>
              <el-descriptions-item label="训练重点">
                <el-tag :type="todayPlan.isRestDay ? 'success' : 'primary'">
                  {{ todayPlan.isRestDay ? '休息日' : todayPlan.trainingFocus }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="statusType">{{ statusText }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="训练时长" v-if="!todayPlan.isRestDay">{{ todayPlan.totalDuration }} 分钟</el-descriptions-item>
              <el-descriptions-item label="预计消耗" v-if="!todayPlan.isRestDay">{{ todayPlan.totalCalories }} 大卡</el-descriptions-item>
              <el-descriptions-item label="动作数量" v-if="!todayPlan.isRestDay">{{ todayPlan.exercises?.length || 0 }} 个</el-descriptions-item>
            </el-descriptions>
            <div v-if="!todayPlan.isRestDay && todayPlan.exercises?.length" style="margin-top: 16px">
              <el-divider>训练动作</el-divider>
              <el-row :gutter="16">
                <el-col :span="12" v-for="ex in todayPlan.exercises" :key="ex.id">
                  <div class="exercise-item">
                    <span class="exercise-order">{{ ex.exerciseOrder }}</span>
                    <div class="exercise-info">
                      <div class="exercise-name">{{ ex.exerciseName }}</div>
                      <div class="exercise-detail">{{ ex.targetSets }}组 × {{ ex.targetRepps }}次</div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
            <div style="margin-top: 20px; text-align: center">
              <el-button type="primary" size="large" v-if="!todayPlan.isRestDay" @click="goToDailyPlan">
                开始训练
              </el-button>
              <el-button type="primary" size="large" v-else disabled>
                今天是休息日
              </el-button>
            </div>
          </div>
          <el-empty v-else description="暂无今日计划，请先填写问卷并生成周计划">
            <el-button type="primary" @click="goToQuestionnaire">去填写问卷</el-button>
          </el-empty>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentWeeklyPlan, getQuestionnaire } from '@/api'

const router = useRouter()
const userInfo = ref({})
const hasQuestionnaire = ref(false)
const hasWeeklyPlan = ref(false)
const todayPlan = ref(null)

const statusType = computed(() => {
  if (!todayPlan.value) return ''
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'info' }
  return map[todayPlan.value.status] || ''
})

const statusText = computed(() => {
  if (!todayPlan.value) return ''
  const map = { 0: '未开始', 1: '进行中', 2: '已完成', 3: '已跳过' }
  return map[todayPlan.value.status] || '未知'
})

onMounted(() => {
  const userStr = localStorage.getItem('fitness_user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
    loadQuestionnaire()
    loadWeeklyPlan()
  }
})

function loadQuestionnaire() {
  getQuestionnaire(userInfo.value.id).then(res => {
    hasQuestionnaire.value = !!res.data
  }).catch(() => {})
}

function loadWeeklyPlan() {
  getCurrentWeeklyPlan(userInfo.value.id).then(res => {
    hasWeeklyPlan.value = !!res.data
    if (res.data?.dailyPlans?.length) {
      const today = new Date().toISOString().split('T')[0]
      todayPlan.value = res.data.dailyPlans.find(d => d.planDate === today)
    }
  }).catch(() => {})
}

function goToQuestionnaire() {
  router.push('/questionnaire')
}

function goToWeeklyPlan() {
  router.push('/weekly-plan')
}

function goToDailyPlan() {
  router.push(`/daily-plan/${todayPlan.value.id}`)
}
</script>

<style scoped>
.home-container {
  padding: 0;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  font-weight: 600;
}

.today-plan {
  padding: 0 10px;
}

.exercise-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.exercise-order {
  width: 32px;
  height: 32px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
}

.exercise-name {
  font-weight: 500;
  color: #303133;
}

.exercise-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
