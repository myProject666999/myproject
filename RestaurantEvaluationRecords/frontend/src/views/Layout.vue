<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="28" color="#fff">
            <Food />
          </el-icon>
          <span>餐厅评价记录</span>
        </div>
        <el-menu mode="horizontal" :default-active="activeMenu" class="nav-menu" @select="handleMenuSelect">
          <el-menu-item index="/restaurants">
            <el-icon><Shop /></el-icon>
            <span>餐厅列表</span>
          </el-menu-item>
          <el-menu-item index="/friend-reviews">
            <el-icon><UserFilled /></el-icon>
            <span>好友评价</span>
          </el-menu-item>
          <el-menu-item index="/my-reviews">
            <el-icon><Edit /></el-icon>
            <span>我的评价</span>
          </el-menu-item>
        </el-menu>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-name">
              <el-avatar :size="32" :icon="UserFilled" />
              <span>{{ userStore.userInfo?.nickname || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
  </el-container>
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
  if (path.startsWith('/restaurant/')) return '/restaurants'
  return path
})

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  min-height: 100vh;
}

.layout-header {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  height: 64px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  .header-content {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 20px;
    font-weight: 600;
  }

  .nav-menu {
    flex: 1;
    background: transparent;
    border-bottom: none;
    margin: 0 40px;

    :deep(.el-menu-item) {
      color: rgba(255, 255, 255, 0.85);
      border-bottom: 3px solid transparent;
      height: 64px;
      line-height: 64px;

      &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
      }

      &.is-active {
        color: #fff;
        border-bottom-color: #fff;
        background: rgba(255, 255, 255, 0.15);
      }
    }
  }

  .user-info {
    .user-name {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      cursor: pointer;

      .el-icon {
        font-size: 12px;
      }
    }
  }
}

.layout-main {
  background: #f5f7fa;
  padding: 24px;
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
