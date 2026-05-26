<template>
  <div id="app">
    <el-container class="layout-container">
      <el-header class="header">
        <div class="logo">
          <h1>📄 网页转PDF</h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="nav-menu"
        >
          <el-menu-item index="/convert">转换</el-menu-item>
          <el-menu-item index="/history">历史</el-menu-item>
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

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  min-height: 100vh;
  background: #f5f7fa;
}

.layout-container {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 0 40px;
  height: 70px;
}

.logo h1 {
  color: white;
  font-size: 22px;
  font-weight: 600;
}

.nav-menu {
  margin-left: 50px;
  background: transparent;
  border-bottom: none;
}

.nav-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-menu-item.is-active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.main-content {
  padding: 30px 40px;
}
</style>
