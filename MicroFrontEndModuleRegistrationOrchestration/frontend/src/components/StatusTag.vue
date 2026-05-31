<template>
  <el-tag
    :type="tagType"
    :effect="effect"
    :size="size"
    round
  >
    <el-icon v-if="showIcon" class="status-icon">
      <CircleCheck v-if="status === 1" />
      <CircleClose v-else-if="status === 0" />
      <Warning v-else />
    </el-icon>
    {{ statusText }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheck, CircleClose, Warning } from '@element-plus/icons-vue'
import { getStatusText, getStatusType } from '@/utils/format'

const props = withDefaults(defineProps<{
  status: number
  type?: string
  effect?: 'dark' | 'light' | 'plain'
  size?: 'large' | 'default' | 'small'
  showIcon?: boolean
}>(), {
  type: 'app',
  effect: 'light',
  size: 'default',
  showIcon: false
})

const statusText = computed(() => getStatusText(props.status, props.type))
const tagType = computed(() => getStatusType(props.status, props.type) as any)
</script>

<style lang="scss" scoped>
.status-icon {
  margin-right: 4px;
}
</style>
