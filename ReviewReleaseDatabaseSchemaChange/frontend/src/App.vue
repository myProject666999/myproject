<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-left">
        <el-icon size="24" color="#409EFF"><DataAnalysis /></el-icon>
        <span class="title">数据库Schema变更评审与发布平台</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><User /></el-icon>
            <span>管理员</span>
          </span>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <el-aside width="200px" class="app-aside">
        <el-menu
          :default-active="activeMenu"
          router
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页概览</span>
          </el-menu-item>

          <el-sub-menu index="/order">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>工单管理</span>
            </template>
            <el-menu-item index="/order/list">工单列表</el-menu-item>
            <el-menu-item index="/order/create">创建工单</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/review">
            <template #title>
              <el-icon><Check /></el-icon>
              <span>评审管理</span>
            </template>
            <el-menu-item index="/review/pending">待我评审</el-menu-item>
            <el-menu-item index="/review/history">评审历史</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/execution">
            <template #title>
              <el-icon><VideoPlay /></el-icon>
              <span>执行管理</span>
            </template>
            <el-menu-item index="/execution/list">执行列表</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/audit">
            <el-icon><Notebook /></el-icon>
            <span>审计日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="app-main">
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

const handleCommand = (command) => {
  console.log(command)
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.app-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.app-aside {
  background-color: #304156;
}

.el-menu-vertical {
  border-right: none;
}

.app-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
