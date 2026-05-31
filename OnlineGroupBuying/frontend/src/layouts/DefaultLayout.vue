<template>
  <el-container class="default-layout">
    <el-header class="header">
      <div class="header-inner">
        <div class="logo" @click="goHome">
          <el-icon :size="28"><ShoppingCart /></el-icon>
          <span class="logo-text">社区拼团</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="nav-menu"
          mode="horizontal"
          :ellipsis="false"
          router
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item v-if="userStore.isLoggedIn" index="/my/groups">我的拼团</el-menu-item>
          <el-menu-item v-if="userStore.isLoggedIn" index="/my/orders">我的订单</el-menu-item>
          <el-menu-item v-if="userStore.isLoggedIn" index="/create">发起拼团</el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/admin">管理后台</el-menu-item>
        </el-menu>
        <div class="user-area">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown trigger="click" @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                  {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
                </el-avatar>
                <span class="nickname">{{ userStore.userInfo?.nickname || '用户' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="goLogin">登录</el-button>
            <el-button @click="goRegister">注册</el-button>
          </template>
        </div>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
    <el-footer class="footer">
      <p>© 2024 社区拼团平台 版权所有</p>
    </el-footer>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

function goHome() {
  router.push('/')
}

function goLogin() {
  router.push('/login')
}

function goRegister() {
  router.push('/register')
}

async function handleCommand(command) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
      // 用户取消
    }
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
}

.header {
  background-color: #fff;
  padding: 0;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 40px;
  color: #409eff;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  margin-left: 8px;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
  height: 60px;
}

.nav-menu :deep(.el-menu-item) {
  height: 60px;
  line-height: 60px;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.nickname {
  font-size: 14px;
  color: #606266;
}

.main-content {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.footer {
  text-align: center;
  color: #909399;
  font-size: 13px;
  border-top: 1px solid #e4e7ed;
  padding: 20px;
  background-color: #fff;
}

.footer p {
  margin: 0;
}
</style>
