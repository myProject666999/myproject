<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <h1 class="title">
          <el-icon><Monitor /></el-icon>
          设备资产管理系统
        </h1>
      </div>
    </el-header>
    <el-container>
      <el-aside width="220px" class="aside">
        <el-menu
          :default-active="activeMenu"
          router
          class="menu"
        >
          <el-menu-item index="/">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/assets">
            <el-icon><Box /></el-icon>
            <span>资产列表</span>
          </el-menu-item>
          <el-menu-item index="/borrows">
            <el-icon><Wallet /></el-icon>
            <span>领用管理</span>
          </el-menu-item>
          <el-menu-item index="/maintenance">
            <el-icon><Tools /></el-icon>
            <span>维修管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><DocumentChecked /></el-icon>
            <span>盘点管理</span>
          </el-menu-item>
          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/categories">资产分类</el-menu-item>
            <el-menu-item index="/departments">部门管理</el-menu-item>
            <el-menu-item index="/users">用户管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
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
const activeMenu = computed(() => route.path)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
}

.layout-container {
  height: 100%;
}

.header {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  color: white;
  padding: 0 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
}

.title {
  color: white;
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.aside {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.menu {
  border-right: none;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
