<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="logo">
        <el-icon><Location /></el-icon>
        <span>旅行计划工具</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        router
        class="nav-menu"
      >
        <el-menu-item index="/">行程总览</el-menu-item>
        <el-menu-item index="/schedule">每日详情</el-menu-item>
        <el-menu-item index="/budget">预算管理</el-menu-item>
        <el-menu-item index="/hotel">住宿管理</el-menu-item>
        <el-menu-item index="/packing">物品清单</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
    <el-footer class="footer">
      <p>© 2024 旅行计划工具 - 让每次旅行都精彩</p>
    </el-footer>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = ref(route.path)
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 22px;
  font-weight: bold;
}

.logo .el-icon {
  font-size: 28px;
}

.nav-menu {
  background: transparent;
  border-bottom: none;
}

.nav-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.nav-menu .el-menu-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-menu .el-menu-item.is-active {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border-bottom: 2px solid white;
}

.main-content {
  padding: 30px;
  background-color: #f5f7fa;
}

.footer {
  background: #303133;
  color: #909399;
  text-align: center;
  padding: 20px;
  font-size: 14px;
}
</style>
