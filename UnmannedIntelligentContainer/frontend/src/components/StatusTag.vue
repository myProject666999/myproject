<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      statusClasses[status] || statusClasses.default
    ]"
  >
    <span
      :class="[
        'w-1.5 h-1.5 rounded-full mr-1.5',
        dotClasses[status] || dotClasses.default
      ]"
    ></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">

interface Props {
  status: 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'default'
  label: string
}

const props = defineProps<Props>()

const statusClasses: Record<string, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}

const dotClasses: Record<string, string> = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  pending: 'bg-gray-400',
  'in-progress': 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-400',
  default: 'bg-gray-400'
}
</script>
