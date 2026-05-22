<template>
  <el-container class="layout-container">
    <el-header>
      <div class="header-inner">
        <div class="logo">
          <el-icon :size="28"><FirstAidKit /></el-icon>
          <span>家庭医疗记录管理系统</span>
        </div>
        <el-menu mode="horizontal" :router="true" :default-active="activeMenu" class="nav-menu">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/members">成员档案</el-menu-item>
          <el-menu-item index="/reminders">复诊提醒</el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main>
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
.el-header {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  padding: 0;
  display: flex;
  align-items: center;
}
.header-inner {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
}
.nav-menu {
  background: transparent;
  border-bottom: none;
  flex: 1;
}
.nav-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.85);
  border-bottom: none !important;
}
.nav-menu .el-menu-item.is-active {
  color: white;
  font-weight: bold;
}
.el-main {
  background: #f5f7fa;
  padding: 24px;
}
</style>
