<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
    <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ subtitle }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <slot name="extra"></slot>
        <el-dropdown trigger="click" v-if="showActions">
          <button class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MoreVertical class="w-4 h-4" />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="refresh">
                <RefreshCw class="w-4 h-4 mr-2 inline" />
                刷新数据
              </el-dropdown-item>
              <el-dropdown-item command="export">
                <Download class="w-4 h-4 mr-2 inline" />
                导出图表
              </el-dropdown-item>
              <el-dropdown-item command="fullscreen">
                <Maximize2 class="w-4 h-4 mr-2 inline" />
                全屏查看
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="p-5">
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="flex flex-col items-center">
          <el-icon class="animate-spin text-3xl text-blue-500 mb-2">
            <Loader2 />
          </el-icon>
          <span class="text-sm text-gray-500 dark:text-gray-400">数据加载中...</span>
        </div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-64">
        <div class="flex flex-col items-center text-center">
          <AlertCircle class="w-10 h-10 text-red-400 mb-2" />
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ error }}</span>
          <button
            @click="$emit('retry')"
            class="mt-3 px-4 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            重新加载
          </button>
        </div>
      </div>
      <div v-else :style="{ height: height + 'px' }">
        <slot></slot>
      </div>
    </div>
    <div v-if="$slots.footer" class="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MoreVertical, RefreshCw, Download, Maximize2, AlertCircle, Loader2 } from 'lucide-vue-next'

interface Props {
  title: string
  subtitle?: string
  loading?: boolean
  error?: string
  height?: number
  showActions?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
  height: 300,
  showActions: true
})

defineEmits<{
  retry: []
}>()
</script>
