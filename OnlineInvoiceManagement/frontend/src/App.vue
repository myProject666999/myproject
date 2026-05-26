<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon size="28"><Document /></el-icon>
        <span>发票管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        class="menu"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/applications">
          <el-icon><List /></el-icon>
          <span>申请列表</span>
        </el-menu-item>
        <el-menu-item index="/applications/create">
          <el-icon><Edit /></el-icon>
          <span>新建申请</span>
        </el-menu-item>
        <el-menu-item index="/review">
          <el-icon><CircleCheck /></el-icon>
          <span>审核管理</span>
        </el-menu-item>
        <el-menu-item index="/invoices">
          <el-icon><Tickets /></el-icon>
          <span>发票记录</span>
        </el-menu-item>
        <el-menu-item index="/titles">
          <el-icon><OfficeBuilding /></el-icon>
          <span>抬头管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="title">{{ pageTitle }}</span>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/applications/create')) return '/applications/create'
  if (path.startsWith('/review')) return '/review'
  if (path.startsWith('/applications')) return '/applications'
  return path
})

const pageTitle = computed(() => route.meta.title || '发票管理系统')
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.layout-container {
  height: 100vh;
}

.aside {
  background-color: #001529;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  gap: 8px;
  border-bottom: 1px solid #1f3a5c;
}

.menu {
  border-right: none;
}

.menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header .title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>