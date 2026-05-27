<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <div class="logo">
        <el-icon :size="28" color="#409eff"><Bell /></el-icon>
        <span class="title">企业内部公告系统</span>
      </div>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        class="nav-menu"
        router
      >
        <el-menu-item index="/announcements">
          <el-icon><Document /></el-icon>
          <span>公告列表</span>
        </el-menu-item>
        <el-menu-item index="/publish" v-if="userStore.isAdmin">
          <el-icon><Edit /></el-icon>
          <span>发布公告</span>
        </el-menu-item>
        <el-menu-item index="/statistics" v-if="userStore.isAdmin">
          <el-icon><DataAnalysis /></el-icon>
          <span>已读统计</span>
        </el-menu-item>
        <el-menu-item index="/admin" v-if="userStore.isAdmin">
          <el-icon><Setting /></el-icon>
          <span>后台管理</span>
        </el-menu-item>
      </el-menu>
      <div class="user-section">
        <el-badge :value="userStore.unreadCount" :hidden="userStore.unreadCount === 0" class="mr-20">
          <el-button type="primary" link @click="$router.push('/announcements')">
            <el-icon><Bell /></el-icon>
            未读
          </el-button>
        </el-badge>
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32">
              {{ userStore.userInfo.realName?.charAt(0) || 'U' }}
            </el-avatar>
            <span class="username">{{ userStore.userInfo.realName || '用户' }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getUnreadCount, logout as apiLogout } from '@/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

onMounted(() => {
  loadUnreadCount()
})

async function loadUnreadCount() {
  try {
    const res = await getUnreadCount()
    userStore.setUnreadCount(res.data)
  } catch (e) {
    console.error(e)
  }
}

function handleCommand(command) {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await apiLogout()
      } catch (e) {}
      userStore.logout()
      ElMessage.success('退出成功')
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.layout-container {
  height: 100%;
}

.layout-header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-left: 8px;
  color: #303133;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.user-section {
  display: flex;
  align-items: center;
}

.mr-20 {
  margin-right: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  color: #606266;
}

.layout-main {
  padding: 0;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
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
