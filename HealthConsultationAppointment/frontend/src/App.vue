<template>
  <div class="app-container">
    <el-header class="header">
      <div class="logo">🏥 健康问诊预约系统</div>
      <el-menu mode="horizontal" :router="true" class="menu">
        <el-menu-item index="/">科室列表</el-menu-item>
        <el-menu-item index="/my-appointments">我的预约</el-menu-item>
        <el-menu-item index="/queue-admin">叫号后台</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main">
      <router-view />
    </el-main>
  </div>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f5f7fa;
}

.app-container {
  min-height: 100vh;
}

.header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
}

.menu {
  flex: 1;
  background-color: transparent;
  border-bottom: none;
}

.menu :deep(.el-menu-item) {
  color: white;
}

.menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}

.menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.3);
}

.main {
  padding: 20px;
}
</style>
