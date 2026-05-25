<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <el-icon :size="28"><Van /></el-icon>
          <span>物流快递跟踪系统</span>
        </div>
        <nav class="nav-menu">
          <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect">
            <el-menu-item index="query">运单查询</el-menu-item>
            <el-menu-item index="admin">运单管理</el-menu-item>
            <el-menu-item index="statistics">数据统计</el-menu-item>
          </el-menu>
        </nav>
        <div class="user-info">
          <el-dropdown v-if="isLoggedIn" @command="handleUserCommand">
            <span class="user-name">
              {{ userInfo.realName || userInfo.username }}
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-else type="primary" @click="showLogin = true">登录</el-button>
        </div>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <el-dialog v-model="showLogin" title="管理员登录" width="400px" :close-on-click-modal="false">
      <el-form :model="loginForm" label-width="80px" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLogin = false">取消</el-button>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login as loginApi } from './api/user'

const router = useRouter()
const route = useRoute()

const showLogin = ref(false)
const userInfo = ref({})
const loginForm = ref({
  username: '',
  password: ''
})

const isLoggedIn = computed(() => userInfo.value && userInfo.value.userId)

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/admin') || path.startsWith('/create')) return 'admin'
  if (path.startsWith('/statistics')) return 'statistics'
  return 'query'
})

const goHome = () => {
  router.push('/')
}

const handleMenuSelect = (index) => {
  switch (index) {
    case 'query':
      router.push('/')
      break
    case 'admin':
      if (!isLoggedIn.value) {
        showLogin.value = true
      } else {
        router.push('/admin')
      }
      break
    case 'statistics':
      if (!isLoggedIn.value) {
        showLogin.value = true
      } else {
        router.push('/statistics')
      }
      break
  }
}

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  try {
    const res = await loginApi(loginForm.value.username, loginForm.value.password)
    if (res.code === 200) {
      userInfo.value = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      showLogin.value = false
      ElMessage.success('登录成功')
      router.push('/admin')
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    ElMessage.error('登录失败')
  }
}

const handleUserCommand = (command) => {
  if (command === 'logout') {
    userInfo.value = {}
    localStorage.removeItem('userInfo')
    router.push('/')
    ElMessage.success('已退出登录')
  }
}

onMounted(() => {
  const saved = localStorage.getItem('userInfo')
  if (saved) {
    userInfo.value = JSON.parse(saved)
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
}

.logo .el-icon {
  color: #409eff;
}

.nav-menu {
  flex: 1;
  margin-left: 40px;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #606266;
}

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}
</style>
