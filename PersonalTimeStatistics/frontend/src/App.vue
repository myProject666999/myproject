<template>
  <el-container class="app-container">
    <el-aside width="200px" class="aside">
      <div class="logo">
        <el-icon><Clock /></el-icon>
        <span>时间统计</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
      >
        <el-menu-item index="/record">
          <el-icon><EditPen /></el-icon>
          <span>时间录入</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><DataLine /></el-icon>
          <span>统计图</span>
        </el-menu-item>
        <el-menu-item index="/goal">
          <el-icon><Flag /></el-icon>
          <span>目标设置</span>
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
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || '个人时间统计')
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html, #app {
  height: 100%;
}

.app-container {
  height: 100%;
}

.aside {
  background-color: #001529;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  gap: 8px;
  border-bottom: 1px solid #1f2937;
}

.el-menu {
  border-right: none;
}

.el-container {
  margin-left: 200px;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 60px);
}
</style>
