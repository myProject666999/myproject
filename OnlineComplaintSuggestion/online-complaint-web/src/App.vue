<template>
  <div class="app-container">
    <el-container>
      <el-header class="app-header">
        <div class="header-inner">
          <div class="logo">
            <el-icon :size="28" color="#fff"><ChatDotRound /></el-icon>
            <span class="logo-text">在线投诉建议平台</span>
          </div>
          <el-menu
            class="app-menu"
            mode="horizontal"
            :default-active="activeMenu"
            :router="true"
            background-color="#409EFF"
            text-color="#fff"
            active-text-color="#fff"
            @select="handleSelect"
          >
            <el-menu-item index="/submit">
              <el-icon><Edit /></el-icon>
              <span>提交投诉</span>
            </el-menu-item>
            <el-menu-item index="/my">
              <el-icon><Document /></el-icon>
              <span>我的投诉</span>
            </el-menu-item>
            <el-menu-item index="/admin">
              <el-icon><Setting /></el-icon>
              <span>管理后台</span>
            </el-menu-item>
            <el-menu-item index="/statistics">
              <el-icon><DataAnalysis /></el-icon>
              <span>统计分析</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
      <el-footer class="app-footer">
        <span>© 2026 在线投诉建议平台 · Powered by Vue 3 + Element Plus</span>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => {
  if (route.path.startsWith('/detail')) return '/my'
  return route.path
})

const handleSelect = () => {}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #f5f7fa;
}
</style>

<style scoped>
.app-container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #409EFF;
  padding: 0;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin-left: 10px;
  letter-spacing: 1px;
}

.app-menu {
  border-bottom: none;
  flex: 1;
  background: #409EFF !important;
}

.app-menu .el-menu-item {
  height: 60px;
  line-height: 60px;
  border-bottom: none !important;
}

.app-menu .el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.15) !important;
  border-bottom: none !important;
}

.app-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.app-footer {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 20px 0;
  background: transparent;
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
