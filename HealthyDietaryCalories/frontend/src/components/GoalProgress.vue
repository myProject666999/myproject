<template>
  <div class="goal-progress">
    <div class="goal-header">
      <span class="goal-title">今日目标</span>
      <span class="goal-status" :class="goalClass">{{ goalStatus }}</span>
    </div>
    
    <div class="progress-item">
      <div class="progress-label">
        <span>热量</span>
        <span>{{ formatNumber(intake?.intake_calories || 0) }} / {{ formatNumber(goal?.target_calories || 0) }} kcal</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: caloriesPercent + '%' }" :class="getProgressClass(caloriesPercent)"></div>
      </div>
    </div>

    <div class="nutrients-grid">
      <div class="nutrient-item">
        <div class="nutrient-label">蛋白质</div>
        <div class="nutrient-value">{{ formatNumber(intake?.intake_protein || 0) }}g</div>
        <div class="nutrient-target">目标: {{ formatNumber(goal?.target_protein || 0) }}g</div>
      </div>
      <div class="nutrient-item">
        <div class="nutrient-label">碳水</div>
        <div class="nutrient-value">{{ formatNumber(intake?.intake_carbs || 0) }}g</div>
        <div class="nutrient-target">目标: {{ formatNumber(goal?.target_carbs || 0) }}g</div>
      </div>
      <div class="nutrient-item">
        <div class="nutrient-label">脂肪</div>
        <div class="nutrient-value">{{ formatNumber(intake?.intake_fat || 0) }}g</div>
        <div class="nutrient-target">目标: {{ formatNumber(goal?.target_fat || 0) }}g</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  goal: Object,
  intake: Object
})

const caloriesPercent = computed(() => {
  if (!props.goal?.target_calories) return 0
  return Math.min(((props.intake?.intake_calories || 0) / props.goal.target_calories) * 100, 150)
})

const goalStatus = computed(() => {
  if (!props.intake?.intake_calories) return '未开始'
  if (caloriesPercent.value >= 90 && caloriesPercent.value <= 110) return '已达成'
  if (caloriesPercent.value < 90) return '进行中'
  return '已超标'
})

const goalClass = computed(() => {
  if (goalStatus.value === '已达成') return 'achieved'
  if (goalStatus.value === '已超标') return 'exceeded'
  return 'in-progress'
})

const formatNumber = (num) => {
  return Math.round(num * 10) / 10
}

const getProgressClass = (percent) => {
  if (percent >= 90 && percent <= 110) return 'achieved'
  if (percent > 110) return 'exceeded'
  return ''
}
</script>

<style scoped>
.goal-progress {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.goal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.goal-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.goal-status.achieved {
  background: #d4edda;
  color: #155724;
}

.goal-status.in-progress {
  background: #cce5ff;
  color: #004085;
}

.goal-status.exceeded {
  background: #f8d7da;
  color: #721c24;
}

.progress-item {
  margin-bottom: 1.5rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-fill.achieved {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.progress-fill.exceeded {
  background: linear-gradient(90deg, #dc3545, #fd7e14);
}

.nutrients-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.nutrient-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.nutrient-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.nutrient-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.nutrient-target {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
}

@media (max-width: 480px) {
  .nutrients-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .nutrient-item {
    padding: 0.5rem;
  }
  
  .nutrient-value {
    font-size: 1rem;
  }
}
</style>
