<template>
  <div v-if="!$route.meta.hideLayout" class="layout-container">
    <el-header class="layout-header" height="60px">
      <div class="header-inner">
        <div class="logo" @click="$router.push('/')">
          <el-icon :size="28"><Edit /></el-icon>
          <span>在线编程评测系统</span>
        </div>
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          class="header-menu"
          router
          background-color="transparent"
          text-color="#303133"
          active-text-color="#409eff"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/problem/list">
            <el-icon><Collection /></el-icon>
            <span>题库</span>
          </el-menu-item>
          <el-menu-item index="/contest/list">
            <el-icon><Trophy /></el-icon>
            <span>竞赛</span>
          </el-menu-item>
          <el-menu-item index="/submission/list">
            <el-icon><Document /></el-icon>
            <span>提交记录</span>
          </el-menu-item>
          <el-menu-item index="/ranklist">
            <el-icon><Medal /></el-icon>
            <span>排行榜</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/admin/problem/list">
            <el-icon><Setting /></el-icon>
            <span>管理后台</span>
          </el-menu-item>
        </el-menu>
        <div class="header-right">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                  {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
                </el-avatar>
                <span class="username">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/user/profile')">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/submission/mine')">
                    <el-icon><Document /></el-icon>我的提交
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
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
    <el-main class="layout-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
    <el-footer class="layout-footer" height="40px">
      <span>© 2024 在线编程评测系统 | Online Judge</span>
    </el-footer>
  </div>
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/problem')) return '/problem/list'
  if (path.startsWith('/contest')) return '/contest/list'
  if (path.startsWith('/submission')) return '/submission/list'
  if (path.startsWith('/ranklist')) return '/ranklist'
  if (path.startsWith('/admin')) return '/admin/problem/list'
  return path
})

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (e) {
    // cancelled
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  cursor: pointer;
  margin-right: 30px;
  white-space: nowrap;
}

.header-menu {
  flex: 1;
  border-bottom: none !important;
}

.header-right {
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
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;
  }

  .username {
    font-size: 14px;
    color: #303133;
  }
}

.layout-main {
  flex: 1;
  background: #f5f7fa;
}

.layout-footer {
  background: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
