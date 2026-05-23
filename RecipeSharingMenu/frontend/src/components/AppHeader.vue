<template>
  <el-header class="app-header">
    <div class="header-content">
      <div class="logo" @click="$router.push('/')">
        <el-icon :size="28"><Food /></el-icon>
        <span>食谱分享</span>
      </div>
      <nav class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link v-if="userStore.isLoggedIn" to="/menu" class="nav-link">菜单规划</router-link>
        <router-link v-if="userStore.isLoggedIn" to="/shopping-list" class="nav-link">购物清单</router-link>
      </nav>
      <div class="user-actions">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                {{ userStore.userInfo?.username?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userStore.userInfo?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="create">
                  <el-icon><Edit /></el-icon>发布菜谱
                </el-dropdown-item>
                <el-dropdown-item command="my-recipes">
                  <el-icon><Document /></el-icon>我的菜谱
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><Star /></el-icon>我的收藏
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="$router.push('/login')">登录</el-button>
          <el-button @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()

const handleCommand = (command) => {
  switch (command) {
    case 'create':
      router.push('/recipe/create')
      break
    case 'my-recipes':
      router.push('/my-recipes')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        router.push('/')
      }).catch(() => {})
      break
  }
}
</script>

<style scoped>
.app-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
  height: 64px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #ff6b6b;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: #606266;
  font-size: 15px;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #ff6b6b;
}

.user-actions {
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
  border-radius: 6px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}
</style>
