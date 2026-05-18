<template>
  <el-container class="app-container">
    <el-header class="header">
      <h1>🎂 联系人生日提醒</h1>
      <el-menu mode="horizontal" :router="true" :default-active="$route.path" class="nav-menu">
        <el-menu-item index="/reminders">今日提醒</el-menu-item>
        <el-menu-item index="/contacts">联系人</el-menu-item>
        <el-menu-item index="/calendar">日历</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.app-container {
  min-height: 100vh;
}
.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}
.header h1 {
  margin: 0;
  font-size: 24px;
  color: #ff6b6b;
}
.nav-menu {
  border-bottom: none;
}
.main-content {
  background-color: #f5f7fa;
  padding: 24px;
}
</style>
