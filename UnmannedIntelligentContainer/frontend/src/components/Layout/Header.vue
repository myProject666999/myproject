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

      <el-popover
        v-model:visible="notificationVisible"
        placement="bottom"
        :width="380"
        trigger="click"
        popper-class="notification-popover"
      >
        <template #reference>
          <button
            @click="loadNotifications"
            class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors relative"
          >
            <Bell class="w-5 h-5" />
            <span
              v-if="unreadCount > 0"
              class="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center px-1"
            >
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </button>
        </template>

        <div class="notification-panel">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">消息通知</h3>
            <div class="flex items-center space-x-2">
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                全部已读
              </button>
            </div>
          </div>

          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="item in notifications"
              :key="item.id"
              :class="[
                'p-3 rounded-lg cursor-pointer transition-colors border',
                item.isRead
                  ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50'
              ]"
              @click="handleNotificationClick(item)"
            >
              <div class="flex items-start space-x-3">
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    item.type === 'low-stock' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    item.type === 'task' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                    item.type === 'stock-check' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    item.type === 'damage' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  ]"
                >
                  <AlertTriangle v-if="item.type === 'low-stock'" class="w-4 h-4" />
                  <ClipboardList v-else-if="item.type === 'task'" class="w-4 h-4" />
                  <CheckSquare v-else-if="item.type === 'stock-check'" class="w-4 h-4" />
                  <Package v-else-if="item.type === 'damage'" class="w-4 h-4" />
                  <Bell v-else class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p :class="['text-sm font-medium', item.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white']">
                    {{ item.title }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {{ item.content }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {{ item.time }}
                  </p>
                </div>
                <div
                  v-if="!item.isRead"
                  class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"
                ></div>
              </div>
            </div>

            <div
              v-if="notifications.length === 0"
              class="text-center py-8 text-gray-500 dark:text-gray-400"
            >
              <Bell class="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p class="text-sm">暂无消息通知</p>
            </div>
          </div>
        </div>
      </el-popover>

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
  LogOut,
  AlertTriangle,
  ClipboardList,
  CheckSquare,
  Package
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const isDark = ref(false)

const userName = ref('管理员')
const userRole = ref('系统管理员')

const notificationVisible = ref(false)

interface Notification {
  id: number
  type: 'low-stock' | 'task' | 'stock-check' | 'damage' | 'system'
  title: string
  content: string
  time: string
  isRead: boolean
  url?: string
}

const notifications = ref<Notification[]>([])
const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

function loadNotifications() {
  if (notifications.value.length === 0) {
    notifications.value = [
      {
        id: 1,
        type: 'low-stock',
        title: '低库存预警',
        content: '科技园A区货柜商品可口可乐库存已低于阈值，请及时补货',
        time: '10分钟前',
        isRead: false,
        url: '/low-stock'
      },
      {
        id: 2,
        type: 'task',
        title: '新补货任务',
        content: '系统为您分配了新的补货任务，共3个货柜待补货',
        time: '30分钟前',
        isRead: false,
        url: '/replenishment'
      },
      {
        id: 3,
        type: 'stock-check',
        title: '盘点任务提醒',
        content: '阳光花园货柜盘点任务已完成，请及时处理差异',
        time: '1小时前',
        isRead: true,
        url: '/stock-check'
      },
      {
        id: 4,
        type: 'damage',
        title: '货损报告',
        content: '科技园B区货柜发现2瓶过期商品，已上报货损',
        time: '2小时前',
        isRead: true,
        url: '/stock-check'
      },
      {
        id: 5,
        type: 'system',
        title: '系统通知',
        content: '系统将于今晚22:00进行维护升级，预计持续30分钟',
        time: '3小时前',
        isRead: true
      }
    ]
  }
}

function handleNotificationClick(item: Notification) {
  item.isRead = true
  notificationVisible.value = false
  if (item.url) {
    router.push(item.url)
  } else {
    ElMessage.info(item.title)
  }
}

function markAllAsRead() {
  notifications.value.forEach(n => n.isRead = true)
  ElMessage.success('已全部标记为已读')
}

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
