<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon><Grid /></el-icon>
        <span>微前端编排中心</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#b8c7ce"
        active-text-color="#409eff"
      >
        <el-menu-item index="/app">
          <el-icon><Menu /></el-icon>
          <span>应用注册</span>
        </el-menu-item>
        <el-menu-item index="/route">
          <el-icon><Share /></el-icon>
          <span>路由编排</span>
        </el-menu-item>
        <el-menu-item index="/config">
          <el-icon><Setting /></el-icon>
          <span>配置下发</span>
        </el-menu-item>
        <el-menu-item index="/gray">
          <el-icon><Histogram /></el-icon>
          <span>灰度发布</span>
        </el-menu-item>
        <el-menu-item index="/health">
          <el-icon><Monitor /></el-icon>
          <span>健康监控</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="WebSocket连接状态">
            <el-badge :value="wsConnected ? 1 : 0" :type="wsConnected ? 'success' : 'danger'" :hidden="!wsConnected">
              <el-icon :size="20"><Connection /></el-icon>
            </el-badge>
          </el-tooltip>
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
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

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { UserFilled } from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/configStore'
import { initWebSocket, disconnectWebSocket, isConnected } from '@/utils/websocket'

const route = useRoute()
const configStore = useConfigStore()

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => (route.meta.title as string) || '')
const wsConnected = computed(() => isConnected.value)

onMounted(() => {
  initWebSocket()
})

onUnmounted(() => {
  disconnectWebSocket()
})
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.aside {
  background-color: #001529;
  display: flex;
  flex-direction: column;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #1f2d3d;

    .el-icon {
      font-size: 24px;
      color: #409eff;
    }
  }

  .el-menu {
    border-right: none;
    flex: 1;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .username {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.main {
  background-color: #f0f2f5;
  overflow: auto;
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
