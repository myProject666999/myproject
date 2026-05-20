<template>
  <div class="app-container">
    <el-container>
      <el-header class="header">
        <div class="logo">
          <el-icon :size="28" color="#409eff"><Reading /></el-icon>
          <span class="title">阅读笔记</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="nav-menu"
        >
          <el-menu-item index="/">
            <el-icon><Collection /></el-icon>
            <span>书架</span>
          </el-menu-item>
          <el-menu-item index="/notes">
            <el-icon><Document /></el-icon>
            <span>笔记</span>
          </el-menu-item>
          <el-menu-item index="/review">
            <el-icon><RefreshRight /></el-icon>
            <span>随机回顾</span>
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 40px;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin-left: 10px;
  color: #303133;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.main-content {
  padding: 24px 40px;
}
</style>
