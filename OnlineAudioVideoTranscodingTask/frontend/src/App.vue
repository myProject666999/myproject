<template>
  <div id="app">
    <el-container class="layout-container">
      <el-header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <el-icon :size="28"><VideoPlay /></el-icon>
            在线音视频转码系统
          </h1>
          <el-menu
            mode="horizontal"
            :default-active="activeMenu"
            class="app-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="upload">
              <el-icon><Upload /></el-icon>
              <span>文件上传</span>
            </el-menu-item>
            <el-menu-item index="tasks">
              <el-icon><List /></el-icon>
              <span>任务列表</span>
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
        <span>© 2026 在线音视频转码系统 | Powered by Vue3 + Gin + FFmpeg</span>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeMenu = ref('upload')

watch(() => route.path, (newPath) => {
  if (newPath === '/') activeMenu.value = 'upload'
  else if (newPath.startsWith('/tasks')) activeMenu.value = 'tasks'
})

function handleMenuSelect(index) {
  if (index === 'upload') router.push('/')
  else if (index === 'tasks') router.push('/tasks')
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  height: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  height: 64px;
}
.app-title {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 40px;
}
.app-menu {
  border-bottom: none;
  background: transparent;
  flex: 1;
}
.app-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.85) !important;
  border-bottom: none !important;
  font-weight: 500;
}
.app-menu .el-menu-item:hover,
.app-menu .el-menu-item.is-active {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1) !important;
}
.app-main {
  background: #f5f7fa;
  padding: 24px;
}
.app-footer {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #ebeef5;
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
