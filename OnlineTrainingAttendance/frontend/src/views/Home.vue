<template>
  <el-container class="home-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo">
        <el-icon :size="24" color="#fff"><School /></el-icon>
        <span v-show="!isCollapse" class="logo-text">培训签到系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/home/training">
          <el-icon><Reading /></el-icon>
          <template #title>培训班</template>
        </el-menu-item>
        <el-menu-item index="/home/certificates">
          <el-icon><Medal /></el-icon>
          <template #title>我的证书</template>
        </el-menu-item>
        <el-menu-item index="/home/verify">
          <el-icon><Search /></el-icon>
          <template #title>证书查验</template>
        </el-menu-item>
        <el-menu-item index="/home/admin">
          <el-icon><Setting /></el-icon>
          <template #title>管理后台</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" :size="20" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home/training' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentMenuTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="30" :icon="UserFilled" />
              <span class="username">{{ username }}</span>
              <el-icon><CaretBottom /></el-icon>
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

      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

const menuTitleMap = {
  '/home/training': '培训班',
  '/home/certificates': '我的证书',
  '/home/verify': '证书查验',
  '/home/admin': '管理后台'
}

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/home/training')) return '/home/training'
  return path
})

const currentMenuTitle = computed(() => menuTitleMap[activeMenu.value] || '')

const userInfo = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || '{}')
  } catch (e) {
    return {}
  }
})

const username = computed(() => userInfo.value?.username || userInfo.value?.name || '管理员')

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确认退出登录？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      ElMessage.success('已退出登录')
      router.push('/login')
    }).catch(() => {})
  } else if (cmd === 'profile') {
    ElMessage.info('个人中心开发中')
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh;
}
.aside {
  background-color: #001529;
  transition: width 0.25s;
  overflow: hidden;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #1f2d3d;
}
.logo-text {
  white-space: nowrap;
}
.aside .el-menu {
  border-right: none;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.collapse-btn {
  cursor: pointer;
  color: #606266;
}
.header-right .user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}
.username {
  font-size: 14px;
}
.main {
  background: #f5f7fa;
  padding: 20px;
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
