<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  ClipboardList,
  SearchCheck,
  AlertTriangle,
  Trophy,
  FileBarChart,
  Settings,
  Store,
  FileText,
  Users,
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import type { Component } from 'vue'

interface MenuItem {
  path: string
  title: string
  icon: Component
  children?: MenuItem[]
}
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const searchText = ref('')

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    {
      path: '/',
      title: '仪表盘',
      icon: LayoutDashboard
    },
    {
      path: '/tasks',
      title: '巡店任务',
      icon: ClipboardList
    },
    {
      path: '/inspection',
      title: '现场检查',
      icon: SearchCheck
    },
    {
      path: '/issues',
      title: '问题整改',
      icon: AlertTriangle
    },
    {
      path: '/ranking',
      title: '门店排行',
      icon: Trophy
    },
    {
      path: '/reports',
      title: '巡店报告',
      icon: FileBarChart
    }
  ]

  if (userStore.isAdmin) {
    items.push({
      path: '/system',
      title: '系统管理',
      icon: Settings,
      children: [
        {
          path: '/stores',
          title: '门店管理',
          icon: Store
        },
        {
          path: '/templates',
          title: '模板管理',
          icon: FileText
        },
        {
          path: '/users',
          title: '用户管理',
          icon: Users
        }
      ]
    })
  }

  return items
})

const breadcrumbItems = computed(() => {
  const pathMap: Record<string, string> = {
    '/': '仪表盘',
    '/tasks': '巡店任务',
    '/inspection': '现场检查',
    '/issues': '问题整改',
    '/ranking': '门店排行',
    '/reports': '巡店报告',
    '/stores': '门店管理',
    '/templates': '模板管理',
    '/users': '用户管理'
  }
  const items: { label: string }[] = [{ label: '首页' }]
  if (route.path !== '/' && pathMap[route.path]) {
    items.push({ label: pathMap[route.path] })
  }
  return items
})

function handleMenuSelect(index: string) {
  router.push(index)
}

function handleLogout() {
  userStore.logout()
  ElMessage.success('退出登录成功')
  router.push('/login')
}

function handleProfile() {
  ElMessage.info('个人中心功能开发中')
}

function toggleSidebar() {
  appStore.toggleSidebar()
}

function handleSearch() {
  if (searchText.value) {
    ElMessage.info(`搜索：${searchText.value}`)
  }
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <span v-if="!appStore.sidebarCollapsed" class="logo-text">连锁巡店系统</span>
        <span v-else class="logo-text-collapsed">巡店</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        class="sidebar-menu"
        background-color="#1D2939"
        text-color="#D0D5DD"
        active-text-color="#FFFFFF"
        @select="handleMenuSelect"
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-sub-menu v-if="item.children" :index="item.path">
            <template #title>
              <component :is="item.icon" class="menu-icon" :size="20" />
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              <component :is="child.icon" class="menu-icon" :size="18" />
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <component :is="item.icon" class="menu-icon" :size="20" />
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
      <div class="sidebar-toggle" @click="toggleSidebar">
        <component :is="appStore.sidebarCollapsed ? ChevronRight : ChevronLeft" :size="18" />
        <span v-if="!appStore.sidebarCollapsed">{{ appStore.sidebarCollapsed ? '展开' : '收起' }}</span>
      </div>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <div class="toggle-btn" @click="toggleSidebar">
            <Menu :size="20" />
          </div>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
              {{ item.label }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <div class="search-box">
            <el-input
              v-model="searchText"
              placeholder="搜索任务、门店、问题..."
              :prefix-icon="Search"
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>
          <el-badge :value="3" class="notification-badge">
            <Bell :size="20" class="header-icon" />
          </el-badge>
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                <User :size="20" />
              </el-avatar>
              <span class="user-name">{{ userStore.userInfo?.realName || '用户' }}</span>
              <ChevronDown :size="16" class="dropdown-icon" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">
                  <User :size="16" class="dropdown-item-icon" />
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <LogOut :size="16" class="dropdown-item-icon" />
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #1D2939;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
}

.logo-text-collapsed {
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #165DFF !important;
}

.menu-icon {
  margin-right: 12px;
}

.sidebar-toggle {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #98A2B3;
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: color 0.2s;
}

.sidebar-toggle:hover {
  color: #FFFFFF;
}

.header {
  background-color: #FFFFFF;
  border-bottom: 1px solid #EAECF0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  cursor: pointer;
  color: #667085;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background-color: #F2F4F7;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  width: 320px;
}

.search-input {
  width: 100%;
}

.header-icon {
  color: #667085;
  cursor: pointer;
  transition: color 0.2s;
}

.header-icon:hover {
  color: #165DFF;
}

.notification-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #F2F4F7;
}

.user-avatar {
  background-color: #165DFF;
  color: #FFFFFF;
}

.user-name {
  font-size: 14px;
  color: #344054;
  font-weight: 500;
}

.dropdown-icon {
  color: #98A2B3;
}

.dropdown-item-icon {
  margin-right: 8px;
}

.main-content {
  background-color: #F9FAFB;
  padding: 24px;
  overflow-y: auto;
}
</style>
