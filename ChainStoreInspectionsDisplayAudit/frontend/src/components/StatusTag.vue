<script setup lang="ts">
import { computed } from 'vue'

type StatusType = 'task' | 'issue' | 'rectification' | 'record'

interface Props {
  status: string
  type?: StatusType
}

const props = withDefaults(defineProps<Props>(), {
  type: 'task'
})

const statusConfig = computed(() => {
  const configs: Record<StatusType, Record<string, { label: string; type: string }>> = {
    task: {
      pending: { label: '待开始', type: 'info' },
      in_progress: { label: '进行中', type: 'warning' },
      completed: { label: '已完成', type: 'success' },
      cancelled: { label: '已取消', type: 'danger' }
    },
    issue: {
      pending: { label: '待整改', type: 'warning' },
      rectifying: { label: '整改中', type: 'primary' },
      resolved: { label: '已解决', type: 'success' },
      verified: { label: '已验证', type: 'success' }
    },
    rectification: {
      submitted: { label: '已提交', type: 'warning' },
      approved: { label: '已通过', type: 'success' },
      rejected: { label: '已驳回', type: 'danger' }
    },
    record: {
      pending: { label: '待检查', type: 'info' },
      in_progress: { label: '检查中', type: 'warning' },
      completed: { label: '已完成', type: 'success' }
    }
  }

  const typeConfig = configs[props.type] || configs.task
  return typeConfig[props.status] || { label: props.status, type: 'info' }
})
</script>

<template>
  <el-tag :type="statusConfig.type as any" effect="light" round>
    {{ statusConfig.label }}
  </el-tag>
</template>
