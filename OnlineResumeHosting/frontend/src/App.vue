<template>
  <div class="app-container">
    <el-header class="header">
      <div class="logo">
        <el-icon :size="28" color="#409eff"><Document /></el-icon>
        <span class="title">在线简历管理系统</span>
      </div>
      <el-menu mode="horizontal" :router="true" :default-active="$route.path" class="menu">
        <el-menu-item index="/">
          <el-icon><List /></el-icon>
          <span>简历列表</span>
        </el-menu-item>
        <el-menu-item index="/templates">
          <el-icon><Picture /></el-icon>
          <span>模板选择</span>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  display: flex;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.menu {
  flex: 1;
  border-bottom: none;
}

.main-content {
  padding: 24px 40px;
}
</style>
