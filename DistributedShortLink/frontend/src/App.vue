<template>
  <el-container class="layout">
    <el-header v-if="showHeader" class="header">
      <div class="logo" @click="goHome">
        <el-icon><Link /></el-icon>
        <span>分布式短链接</span>
      </div>
      <el-menu mode="horizontal" :default-active="activeMenu" @select="onMenuSelect" class="menu">
        <el-menu-item index="home">
          <el-icon><House /></el-icon> 生成短链
        </el-menu-item>
        <el-menu-item index="manage" v-if="isLoggedIn">
          <el-icon><List /></el-icon> 我的链接
        </el-menu-item>
        <el-menu-item index="login" v-if="!isLoggedIn">
          <el-icon><User /></el-icon> 登录
        </el-menu-item>
        <el-menu-item index="register" v-if="!isLoggedIn">
          <el-icon><UserFilled /></el-icon> 注册
        </el-menu-item>
        <el-menu-item index="logout" v-if="isLoggedIn">
          <el-icon><SwitchButton /></el-icon> 退出
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const showHeader = computed(() => route.name !== 'redirect')
const activeMenu = computed(() => {
  if (route.path === '/') return 'home'
  if (route.path.startsWith('/manage')) return 'manage'
  if (route.path.startsWith('/login')) return 'login'
  if (route.path.startsWith('/register')) return 'register'
  return ''
})

const isLoggedIn = ref(false)

onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('token')
})

function goHome() {
  router.push('/')
}

function onMenuSelect(index) {
  switch (index) {
    case 'home':
      router.push('/')
      break
    case 'manage':
      router.push('/manage')
      break
    case 'login':
      router.push('/login')
      break
    case 'register':
      router.push('/register')
      break
    case 'logout':
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      isLoggedIn.value = false
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
.layout {
  height: 100vh;
}
.header {
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 24px;
}
.logo {
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 40px;
  color: #409eff;
}
.menu {
  flex: 1;
  border-bottom: none;
}
.main {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}
</style>
