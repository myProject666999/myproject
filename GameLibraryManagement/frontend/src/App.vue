<template>
  <el-container class="app-container">
    <el-header class="header">
      <div class="logo">🎮 游戏库管理系统</div>
      <el-menu mode="horizontal" :default-active="activeMenu" router class="nav-menu">
        <el-menu-item index="/">游戏库</el-menu-item>
        <el-menu-item index="/games">游戏管理</el-menu-item>
        <el-menu-item index="/statistics">统计</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = ref(route.path)

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath
  }
)
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}
.header {
  display: flex;
  align-items: center;
  background-color: #1e293b;
  color: white;
  padding: 0 20px;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
}
.nav-menu {
  flex: 1;
  background-color: transparent;
  border-bottom: none;
}
.nav-menu :deep(.el-menu-item) {
  color: #cbd5e1;
}
.nav-menu :deep(.el-menu-item:hover) {
  color: white;
  background-color: #334155;
}
.nav-menu :deep(.el-menu-item.is-active) {
  color: #60a5fa;
  background-color: transparent;
  border-bottom: 2px solid #60a5fa;
}
.main {
  background-color: #f1f5f9;
  padding: 20px;
}
</style>
