<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="sidebar">
      <div class="logo">
        <h2>短剧分账平台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/drama">
          <el-icon><VideoPlay /></el-icon>
          <span>剧集管理</span>
        </el-menu-item>
        <el-menu-item index="/stakeholder">
          <el-icon><User /></el-icon>
          <span>权益方管理</span>
        </el-menu-item>
        <el-menu-item index="/rule">
          <el-icon><Setting /></el-icon>
          <span>分账规则</span>
        </el-menu-item>
        <el-sub-menu index="data">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>数据接入</span>
          </template>
          <el-menu-item index="/data/play">播放数据</el-menu-item>
          <el-menu-item index="/data/payment">付费数据</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="share">
          <template #title>
            <el-icon><Calculator /></el-icon>
            <span>分账计算</span>
          </template>
          <el-menu-item index="/share/tasks">分账任务</el-menu-item>
          <el-menu-item index="/share/details">分账明细</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/settlement">
          <el-icon><Document /></el-icon>
          <span>结算单</span>
        </el-menu-item>
        <el-menu-item index="/reconciliation">
          <el-icon><Check /></el-icon>
          <span>对账管理</span>
        </el-menu-item>
        <el-menu-item index="/copyright">
          <el-icon><Key /></el-icon>
          <span>版权授权</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userInfo?.real_name || '用户' }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta?.title || '')

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.sidebar {
  background: #304156;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2b2f3a;

    h2 {
      color: #fff;
      font-size: 18px;
      margin: 0;
    }
  }

  .el-menu {
    border-right: none;
  }
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  .header-left {
    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #606266;
      gap: 5px;
    }
  }
}

.main-content {
  background: #f0f2f5;
  padding: 0;
}
</style>
