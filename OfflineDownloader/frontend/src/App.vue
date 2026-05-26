<template>
  <el-container class="app-container">
    <el-header class="header">
      <div class="logo">
        <el-icon><Download /></el-icon>
        <span>离线下载器</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        router
        class="nav-menu"
      >
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>下载任务</span>
        </el-menu-item>
        <el-menu-item index="/files">
          <el-icon><FolderOpened /></el-icon>
          <span>文件库</span>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = ref(route.path)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f7fa;
}

.app-container {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-right: 40px;
}

.logo .el-icon {
  margin-right: 8px;
  font-size: 24px;
}

.nav-menu {
  flex: 1;
  background: transparent;
  border: none;
}

.nav-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
}

.nav-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-menu .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.main-content {
  padding: 24px;
  background-color: #f5f7fa;
}
</style>
