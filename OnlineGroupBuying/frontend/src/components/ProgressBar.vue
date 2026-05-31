<template>
  <div class="progress-bar-wrapper">
    <el-progress
      :percentage="percentage"
      :stroke-width="strokeWidth"
      :color="customColor"
      :show-text="showText"
      :text-inside="textInside"
    />
    <div v-if="showCount && targetCount" class="count-label">
      {{ currentCount }}/{{ targetCount }} 人
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentCount: {
    type: Number,
    default: 0
  },
  targetCount: {
    type: Number,
    default: null
  },
  percentage: {
    type: Number,
    default: 0
  },
  strokeWidth: {
    type: Number,
    default: 12
  },
  showText: {
    type: Boolean,
    default: true
  },
  textInside: {
    type: Boolean,
    default: false
  },
  showCount: {
    type: Boolean,
    default: false
  }
})

const customColor = computed(() => {
  const pct = computedPercentage.value
  if (pct >= 100) return '#67c23a'
  if (pct >= 80) return '#409eff'
  if (pct >= 50) return '#e6a23c'
  return '#f56c6c'
})

const computedPercentage = computed(() => {
  if (props.percentage > 0) return props.percentage
  if (props.targetCount) {
    return Math.min(Math.round((props.currentCount / props.targetCount) * 100), 100)
  }
  return 0
})
</script>

<style scoped>
.progress-bar-wrapper {
  width: 100%;
}

.count-label {
  text-align: center;
  font-size: 13px;
  color: #606266;
  margin-top: 4px;
}
</style>
