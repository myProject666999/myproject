<template>
  <el-container class="main-container">
    <el-header class="main-header">
      <div class="header-left">
        <div class="logo">
          <el-icon :size="28" class="logo-icon">
            <Van />
          </el-icon>
          <span class="logo-text">拼车出行</span>
        </div>
      </div>
      <div class="header-center">
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          class="nav-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/">
            <el-icon><List /></el-icon>
            <span>行程列表</span>
          </el-menu-item>
          <el-menu-item index="/ride/publish">
            <el-icon><Promotion /></el-icon>
            <span>发布行程</span>
          </el-menu-item>
          <el-menu-item index="/request/publish">
            <el-icon><Edit /></el-icon>
            <span>发布需求</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><Tickets /></el-icon>
            <span>我的订单</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleDropdownCommand">
          <div class="user-info">
            <el-avatar :size="36" :src="userStore.user?.avatar">
              {{ userStore.user?.nickname?.charAt(0) || 'U' }}
            </el-avatar>
            <span class="user-name">{{ userStore.user?.nickname || '用户' }}</span>
            <el-icon :size="14" class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="credit">
                <el-icon><Star /></el-icon>
                信用评价
              </el-dropdown-item>
              <el-dropdown-item command="vehicles">
                <el-icon><Van /></el-icon>
                车辆管理
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Van,
  List,
  Promotion,
  Edit,
  Tickets,
  User,
  Star,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/ride/publish')) return '/ride/publish'
  if (path.startsWith('/request/publish')) return '/request/publish'
  if (path.startsWith('/orders')) return '/orders'
  if (path.startsWith('/order/')) return '/orders'
  return '/'
})

function handleMenuSelect(index: string) {
  router.push(index)
}

function handleDropdownCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'credit':
      router.push('/profile/credit')
      break
    case 'vehicles':
      router.push('/profile/vehicles')
      break
    case 'logout':
      handleLogout()
      break
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
  }
}
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-header {
  height: 60px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #4F6EF7 0%, #667eea 100%);
  box-shadow: 0 2px 8px rgba(79, 110, 247, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  flex: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  color: #ffffff;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.nav-menu {
  background: transparent;
  border-bottom: none;
  display: flex;
  gap: 8px;
}

.nav-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 2px solid transparent;
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.nav-menu :deep(.el-menu-item:hover) {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: #ffffff;
  border-bottom-color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  font-weight: 600;
}

.nav-menu :deep(.el-menu-item .el-icon) {
  margin-right: 6px;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.15);
}

.user-name {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.dropdown-icon {
  color: rgba(255, 255, 255, 0.85);
  transition: transform 0.3s ease;
}

.main-content {
  padding: 24px;
  min-height: calc(100vh - 60px);
}
</style>
