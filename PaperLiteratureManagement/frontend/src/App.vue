<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="28" color="#409eff"><Document /></el-icon>
          <span class="title">论文文献管理系统</span>
        </div>
        <el-menu 
          mode="horizontal" 
          :default-active="activeMenu"
          router
          class="nav-menu"
        >
          <el-menu-item index="/">
            <el-icon><Collection /></el-icon>
            <span>文献库</span>
          </el-menu-item>
          <el-menu-item index="/tags">
            <el-icon><PriceTag /></el-icon>
            <span>标签管理</span>
          </el-menu-item>
          <el-menu-item index="/notes">
            <el-icon><EditPen /></el-icon>
            <span>所有笔记</span>
          </el-menu-item>
        </el-menu>
      </div>
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
  background: #fff;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.nav-menu {
  border-bottom: none;
}

.main-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}
</style>
