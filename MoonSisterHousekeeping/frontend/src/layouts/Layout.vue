<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h2>月姐家政</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>

        <el-menu-item index="/nannies">
          <el-icon><User /></el-icon>
          <span>月嫂列表</span>
        </el-menu-item>

        <el-menu-item index="/demands" v-if="role === 'customer' || role === 'admin'">
          <el-icon><Document /></el-icon>
          <span>需求管理</span>
        </el-menu-item>

        <el-menu-item index="/orders">
          <el-icon><ShoppingBag /></el-icon>
          <span>订单管理</span>
        </el-menu-item>

        <el-menu-item index="/attendance" v-if="role === 'nanny' || role === 'admin'">
          <el-icon><Clock /></el-icon>
          <span>打卡签到</span>
        </el-menu-item>

        <el-menu-item index="/daily-records">
          <el-icon><Notebook /></el-icon>
          <span>工作记录</span>
        </el-menu-item>

        <el-menu-item index="/reviews" v-if="role === 'customer' || role === 'admin'">
          <el-icon><ChatDotRound /></el-icon>
          <span>评价管理</span>
        </el-menu-item>

        <el-menu-item index="/disputes">
          <el-icon><Warning /></el-icon>
          <span>纠纷处理</span>
        </el-menu-item>

        <el-menu-item index="/courses">
          <el-icon><Reading /></el-icon>
          <span>培训课程</span>
        </el-menu-item>

        <el-sub-menu index="admin" v-if="role === 'admin'">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/admin/nannies">月嫂管理</el-menu-item>
          <el-menu-item index="/admin/courses">课程管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="welcome-text">欢迎，{{ user?.name || '用户' }}</div>
          <el-dropdown @command="handleCommand" placement="bottom-end">
            <span class="user-dropdown">
              <el-avatar :size="32">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="user-name">{{ user?.name }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
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
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const user = computed(() => userStore.user)
const role = computed(() => userStore.role)
const activeMenu = computed(() => route.path)

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text {
  color: #606266;
  font-size: 14px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.user-name {
  color: #303133;
  font-size: 14px;
}

.arrow-icon {
  color: #909399;
  font-size: 12px;
}

.main {
  background-color: #f0f2f5;
  overflow: auto;
}
</style>
