<template>
  <div class="page-container">
    <div class="page-header">
      <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
      <h2 class="page-title">{{ dailyPlan?.planDate }} 训练详情</h2>
    </div>

    <el-card v-if="dailyPlan" class="card-container">
      <el-descriptions :column="3" border class="plan-info">
        <el-descriptions-item label="训练重点">
          <el-tag type="primary">{{ dailyPlan.trainingFocus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="训练时长">{{ dailyPlan.totalDuration }} 分钟</el-descriptions-item>
        <el-descriptions-item label="预计消耗">{{ dailyPlan.totalCalories }} 大卡</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(dailyPlan.status)">{{ getStatusText(dailyPlan.status) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider>训练动作</el-divider>

      <div v-if="dailyPlan.exercises?.length" class="exercise-list">
        <div
          v-for="ex in dailyPlan.exercises"
          :key="ex.id"
          class="exercise-item"
          @click="goToExerciseDetail(ex.exerciseId)">
          <div class="exercise-header">
            <el-badge :value="ex.exerciseOrder" class="exercise-order" />
            <span class="exercise-name">{{ ex.exerciseName }}</span>
            <el-tag size="small" type="info" class="exercise-category">{{ ex.category }}</el-tag>
          </div>
          <div class="exercise-details">
            <div class="detail-item">
              <span class="label">目标:</span>
              <span class="value">{{ ex.targetSets }}组 × {{ ex.targetReps }}次</span>
            </div>
            <div class="detail-item" v-if="ex.restSeconds">
              <span class="label">组间休息:</span>
              <span class="value">{{ ex.restSeconds }}秒</span>
            </div>
            <div class="detail-item" v-if="ex.equipment">
              <span class="label">器材:</span>
              <span class="value">{{ ex.equipment }}</span>
            </div>
          </div>
          <div class="exercise-muscle" v-if="ex.muscleGroup">
            <el-icon><Gym /></el-icon>
            <span>目标肌群: {{ ex.muscleGroup }}</span>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <el-button type="primary" size="large" @click="goToCheckIn">
          打卡记录
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getWeeklyPlan } from '@/api'

const router = useRouter()
const route = useRoute()
const dailyPlan = ref(null)

onMounted(() => {
  const userStr = localStorage.getItem('fitness_user')
  if (userStr) {
    loadData()
  }
})

function loadData() {
  const userInfo = JSON.parse(localStorage.getItem('fitness_user') || '{}')
  getWeeklyPlan(userInfo.id).then(res => {
    if (res.data?.dailyPlans) {
      dailyPlan.value = res.data.dailyPlans.find(d => d.id === Number(route.params.id))
    }
  }).catch(() => {})
}

function getStatusType(status) {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = { 0: '未开始', 1: '进行中', 2: '已完成', 3: '已跳过' }
  return map[status] || '未知'
}

function goBack() {
  router.back()
}

function goToCheckIn() {
  router.push(`/check-in/${dailyPlan.value.id}`)
}

function goToExerciseDetail(id) {
  router.push(`/exercise/${id}`)
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.plan-info {
  margin-bottom: 10px;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.exercise-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.exercise-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.exercise-order :deep(.el-badge__content) {
  width: 24px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
}

.exercise-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.exercise-category {
  margin-left: auto;
}

.exercise-details {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.label {
  color: #909399;
  font-size: 13px;
}

.value {
  color: #606266;
  font-size: 13px;
}

.exercise-muscle {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #67c23a;
  font-size: 13px;
}

.action-buttons {
  margin-top: 24px;
  text-align: center;
}
</style>
