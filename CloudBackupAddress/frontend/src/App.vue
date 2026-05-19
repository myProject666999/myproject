<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="logo">
        <el-icon><FolderOpened /></el-icon>
        <span>通讯录云备份</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        router
        class="nav-menu"
      >
        <el-menu-item index="/upload">
          <el-icon><Upload /></el-icon>
          <span>上传备份</span>
        </el-menu-item>
        <el-menu-item index="/versions">
          <el-icon><Clock /></el-icon>
          <span>版本历史</span>
        </el-menu-item>
        <el-menu-item index="/compare">
          <el-icon><Scale /></el-icon>
          <span>版本对比</span>
        </el-menu-item>
        <el-menu-item index="/download">
          <el-icon><Download /></el-icon>
          <span>下载还原</span>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 0 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-right: 60px;
  gap: 10px;
}

.nav-menu {
  flex: 1;
  background: transparent;
  border: none;
}

.nav-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
}

.nav-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.main-content {
  padding: 30px 40px;
  background-color: #f5f7fa;
}
</style>
