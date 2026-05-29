<template>
  <aside
    :class="[
      'h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <div class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800 px-4">
      <template v-if="!collapsed">
        <Package class="w-8 h-8 text-blue-600 mr-2" />
        <span class="text-lg font-bold text-gray-900 dark:text-white">智能货柜管理</span>
      </template>
      <Package v-else class="w-8 h-8 text-blue-600" />
    </div>

    <nav class="flex-1 py-4 overflow-y-auto">
      <ul class="space-y-1 px-3">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            :class="[
              'flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group',
              isActive(item.path)
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            <component
              :is="item.icon"
              :class="[
                'w-5 h-5 flex-shrink-0 transition-colors',
                isActive(item.path)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              ]"
            />
            <span
              v-if="!collapsed"
              class="ml-3 text-sm font-medium whitespace-nowrap"
            >
              {{ item.title }}
            </span>
            <el-badge
              v-if="item.badge && !collapsed"
              :value="item.badge"
              class="ml-auto"
              :type="item.badgeType || 'danger'"
            />
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="p-3 border-t border-gray-200 dark:border-gray-800">
      <button
        @click="toggleCollapse"
        class="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft v-if="!collapsed" class="w-5 h-5" />
        <ChevronRight v-else class="w-5 h-5" />
        <span v-if="!collapsed" class="ml-2 text-sm">收起菜单</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Map,
  AlertTriangle,
  ClipboardList,
  FileCheck,
  BarChart3,
  Box,
  ShoppingBag,
  Users,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const route = useRoute()
const collapsed = ref(false)

const menuItems = [
  {
    path: '/',
    title: '货柜地图监控',
    icon: Map
  },
  {
    path: '/low-stock',
    title: '缺货预警',
    icon: AlertTriangle,
    badge: 5,
    badgeType: 'danger'
  },
  {
    path: '/replenishment',
    title: '补货任务',
    icon: ClipboardList,
    badge: 12,
    badgeType: 'warning'
  },
  {
    path: '/stock-check',
    title: '盘点核对',
    icon: FileCheck
  },
  {
    path: '/sales',
    title: '销售分析',
    icon: BarChart3
  },
  {
    path: '/containers',
    title: '货柜管理',
    icon: Box
  },
  {
    path: '/products',
    title: '商品管理',
    icon: ShoppingBag
  },
  {
    path: '/replenishers',
    title: '补货员管理',
    icon: Users
  }
]

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
