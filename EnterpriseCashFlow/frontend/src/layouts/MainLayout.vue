<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores'
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const menuItems = [
  { path: '/dashboard', name: '资金总览', icon: LayoutDashboard },
  { path: '/receivable-payable', name: '应收应付', icon: Receipt },
  { path: '/cashflow-forecast', name: '现金流预测', icon: TrendingUp },
  { path: '/gap-warning', name: '缺口预警', icon: AlertTriangle },
  { path: '/daily-report', name: '日报管理', icon: FileText }
]

const sidebarWidth = computed(() => appStore.sidebarCollapsed ? 'w-16' : 'w-64')
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <aside
      :class="[sidebarWidth, 'bg-primary-dark text-white transition-all duration-300 flex flex-col']"
    >
      <div class="h-16 flex items-center justify-center border-b border-gray-700">
        <div class="flex items-center gap-3">
          <Building2 class="w-8 h-8 text-primary-blue" />
          <span v-if="!appStore.sidebarCollapsed" class="font-bold text-lg">现金流管理</span>
        </div>
      </div>
      
      <nav class="flex-1 py-4">
        <ul class="space-y-1 px-3">
          <li v-for="item in menuItems" :key="item.path">
            <router-link
              :to="item.path"
              :class="[
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                route.path === item.path
                  ? 'bg-primary-blue text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span v-if="!appStore.sidebarCollapsed">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="p-3 border-t border-gray-700">
        <button
          @click="appStore.toggleSidebar()"
          class="w-full flex items-center justify-center py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <ChevronLeft v-if="!appStore.sidebarCollapsed" class="w-5 h-5" />
          <ChevronRight v-else class="w-5 h-5" />
        </button>
      </div>
    </aside>
    
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
        <h1 class="text-xl font-semibold text-gray-800">
          {{ route.meta.title || '企业现金流管理系统' }}
        </h1>
      </header>
      
      <div class="flex-1 overflow-auto p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>
