<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="layout-aside">
      <div class="logo">
        <el-icon :size="28"><Document /></el-icon>
        <span>问卷系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="transparent"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/surveys">
          <el-icon><List /></el-icon>
          <span>问卷管理</span>
        </el-menu-item>
        <el-menu-item index="/my-surveys">
          <el-icon><FolderOpened /></el-icon>
          <span>我的问卷</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon :size="20" class="menu-toggle" @click="toggleCollapse"><Fold /></el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo?.avatar">
                {{ userInfo?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ userInfo?.nickname || '用户' }}</span>
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
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const userInfo = computed(() => userStore.userInfo)

onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.getCurrentUserAction()
    } catch (e) {
      // error handled
    }
  }
})

function toggleCollapse() {
  // collapse toggle logic
}

function handleCommand(command) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}
.layout-aside {
  background: linear-gradient(180deg, #304156 0%, #1f2d3d 100%);
  transition: width 0.3s;
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    gap: 8px;
  }
  :deep(.el-menu) {
    border-right: none;
  }
}
.layout-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  .header-left {
    .menu-toggle {
      cursor: pointer;
      color: #606266;
    }
  }
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      .username {
        color: #303133;
      }
    }
  }
}
.layout-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
