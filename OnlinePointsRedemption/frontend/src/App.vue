<template>
  <el-container class="layout-container">
    <el-header v-if="!isAdminPage" class="app-header">
      <div class="header-content">
        <div class="logo" @click="$router.push('/')">
          <el-icon :size="28"><Gift /></el-icon>
          <span>积分商城</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="nav-menu"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/points/detail">积分明细</el-menu-item>
          <el-menu-item index="/ranking">积分排行</el-menu-item>
          <el-menu-item index="/admin">后台管理</el-menu-item>
        </el-menu>
        <div class="user-info">
          <span class="user-points" @click="$router.push('/points/detail')">
            <el-icon><Coin /></el-icon>
            {{ userPoints }} 积分
          </span>
          <el-dropdown>
            <span class="user-name">
              {{ currentUser }} <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="switchUser(1)">管理员 (10000分)</el-dropdown-item>
                <el-dropdown-item @click="switchUser(2)">张三 (5000分)</el-dropdown-item>
                <el-dropdown-item @click="switchUser(3)">李四 (3000分)</el-dropdown-item>
                <el-dropdown-item @click="switchUser(4)">王五 (8000分)</el-dropdown-item>
                <el-dropdown-item @click="switchUser(5)">赵六 (1500分)</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <el-footer v-if="!isAdminPage" class="app-footer">
      <p>© 2026 在线积分商城 - 积分兑换系统</p>
    </el-footer>
  </el-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const isAdminPage = computed(() => route.path.startsWith('/admin'))
const currentUser = computed(() => userStore.currentUser?.nickname || '游客')
const userPoints = computed(() => userStore.currentUser?.points || 0)

function switchUser(userId) {
  userStore.switchUser(userId)
}

onMounted(() => {
  userStore.loadUserInfo()
})
</script>

<style lang="scss" scoped>
.layout-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 24px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 700;
    color: #409eff;
    cursor: pointer;
  }

  .nav-menu {
    flex: 1;
    margin-left: 48px;
    border-bottom: none;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .user-points {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #f59e0b;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 12px;
    background: #fef3c7;
    border-radius: 16px;
    transition: background 0.2s;

    &:hover {
      background: #fde68a;
    }
  }

  .user-name {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #606266;
  }
}

.app-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

.app-footer {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
