<template>
  <el-menu
    mode="horizontal"
    :default-active="activeMenu"
    class="header-menu"
    @select="handleSelect"
  >
    <div class="header-menu__left">
      <el-menu-item index="home" class="header-menu__logo" @click="goHome">
        <span class="header-menu__logo-text">知识付费专栏</span>
      </el-menu-item>
    </div>

    <div class="header-menu__right">
      <el-menu-item index="home" @click="goHome">首页</el-menu-item>
      <el-menu-item index="columns" @click="goColumns">专栏</el-menu-item>
      <el-menu-item v-if="userStore.isAuthor" index="my-columns" @click="goMyColumns">我的专栏</el-menu-item>

      <template v-if="userStore.isLoggedIn">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="header-menu__user">
            <el-avatar :size="32" :src="userStore.user?.avatar">
              {{ (userStore.user?.username || 'U').charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="header-menu__username">{{ userStore.user?.username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item v-if="userStore.isAuthor" command="dashboard">作者后台</el-dropdown-item>
              <el-dropdown-item v-if="userStore.isAuthor" command="stats">数据统计</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>

      <template v-else>
        <el-button type="primary" @click="goLogin">登录</el-button>
        <el-button @click="goRegister">注册</el-button>
      </template>
    </div>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/columns/my')) return 'my-columns'
  if (path.startsWith('/columns')) return 'columns'
  return ''
})

function goHome() {
  router.push('/')
}

function goColumns() {
  router.push('/columns')
}

function goMyColumns() {
  router.push('/columns/my')
}

function goLogin() {
  router.push('/login')
}

function goRegister() {
  router.push('/register')
}

function handleSelect() {}

async function handleCommand(command) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'dashboard':
      router.push('/author/dashboard')
      break
    case 'stats':
      router.push('/author/stats')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/')
      } catch (e) {}
      break
  }
}
</script>

<style scoped>
.header-menu {
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-menu__left {
  display: flex;
  align-items: center;
}

.header-menu__logo {
  font-weight: bold;
  font-size: 18px;
}

.header-menu__logo-text {
  background: linear-gradient(90deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-menu__right {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 8px;
}

.header-menu__user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 12px;
  line-height: 60px;
}

.header-menu__username {
  font-size: 14px;
  color: var(--el-text-color-primary);
}
</style>
