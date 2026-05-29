<template>
  <header class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
    <div class="flex items-center space-x-2 text-sm">
      <Home class="w-4 h-4 text-gray-500" />
      <ChevronRight class="w-4 h-4 text-gray-400" />
      <template v-for="(item, index) in breadcrumbs" :key="index">
        <span
          :class="[
            index === breadcrumbs.length - 1
              ? 'text-gray-900 dark:text-white font-medium'
              : 'text-gray-500 dark:text-gray-400'
          ]"
        >
          {{ item }}
        </span>
        <ChevronRight
          v-if="index < breadcrumbs.length - 1"
          class="w-4 h-4 text-gray-400"
        />
      </template>
    </div>

    <div class="flex items-center space-x-4">
      <button
        @click="toggleTheme"
        class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Sun v-if="isDark" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
      </button>

      <button
        class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors relative"
      >
        <Bell class="w-5 h-5" />
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <el-dropdown trigger="click" @command="handleCommand">
        <div class="flex items-center space-x-3 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
            {{ userName.charAt(0) }}
          </div>
          <div class="hidden md:block">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ userName }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ userRole }}</p>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400 hidden md:block" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <User class="w-4 h-4 mr-2 inline" />
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <Settings class="w-4 h-4 mr-2 inline" />
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <LogOut class="w-4 h-4 mr-2 inline" />
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Home,
  ChevronRight,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const isDark = ref(false)

const userName = ref('管理员')
const userRole = ref('系统管理员')

const breadcrumbMap: Record<string, string> = {
  '/': '货柜地图监控',
  '/low-stock': '缺货预警',
  '/replenishment': '补货任务',
  '/stock-check': '盘点核对',
  '/sales': '销售分析',
  '/containers': '货柜管理',
  '/products': '商品管理',
  '/replenishers': '补货员管理',
  '/profile': '个人中心',
  '/settings': '系统设置'
}

const breadcrumbs = computed(() => {
  const path = route.path
  const title = breadcrumbMap[path] || '首页'
  return [title]
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      ElMessage.success('已退出登录')
      break
  }
}
</script>
