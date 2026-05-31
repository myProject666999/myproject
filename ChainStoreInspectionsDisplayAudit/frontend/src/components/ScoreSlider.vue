<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  maxScore?: number
  modelValue: number
  passScore?: number
  showInput?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxScore: 100,
  passScore: 60,
  showInput: true,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const currentScore = computed({
  get: () => props.modelValue,
  set: (value: number) => emit('update:modelValue', value)
})

const isPassed = computed(() => currentScore.value >= props.passScore)

const scoreColor = computed(() => {
  if (currentScore.value >= props.passScore) return '#10B981'
  if (currentScore.value >= props.passScore * 0.6) return '#F59E0B'
  return '#EF4444'
})

function formatTooltip(value: number) {
  return `${value} 分`
}
</script>

<template>
  <div class="score-slider">
    <div class="score-header">
      <div class="score-display">
        <span class="score-value" :style="{ color: scoreColor }">{{ currentScore }}</span>
        <span class="score-max"> / {{ maxScore }}</span>
      </div>
      <div class="score-status" :class="{ passed: isPassed, failed: !isPassed }">
        {{ isPassed ? '合格' : '不合格' }}
      </div>
    </div>
    <div class="slider-container">
      <el-slider
        v-model="currentScore"
        :min="0"
        :max="maxScore"
        :disabled="disabled"
        :show-tooltip="true"
        :format-tooltip="formatTooltip"
        :marks="{ [passScore]: `合格线 ${passScore}` }"
        :step="1"
        class="slider"
      />
    </div>
    <div class="score-footer" v-if="showInput">
      <el-input-number
        v-model="currentScore"
        :min="0"
        :max="maxScore"
        :disabled="disabled"
        size="small"
      />
      <span class="pass-line">合格线: {{ passScore }} 分</span>
    </div>
  </div>
</template>

<style scoped>
.score-slider {
  padding: 16px;
  background-color: #FAFAFA;
  border-radius: 8px;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.score-display {
  display: flex;
  align-items: baseline;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  transition: color 0.3s;
}

.score-max {
  font-size: 16px;
  color: #98A2B3;
  margin-left: 4px;
}

.score-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.score-status.passed {
  background-color: #D1FAE5;
  color: #065F46;
}

.score-status.failed {
  background-color: #FEE2E2;
  color: #991B1B;
}

.slider-container {
  margin-bottom: 16px;
}

.slider {
  margin: 0 8px;
}

.score-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pass-line {
  font-size: 12px;
  color: #667085;
}
</style>
