<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1 class="title" @click="$router.push('/')">
          <el-icon><Cookbook /></el-icon>
          家庭食谱本
        </h1>
        <el-menu mode="horizontal" :default-active="$route.path" class="nav-menu" router>
          <el-menu-item index="/">
            <el-icon><List /></el-icon>
            菜谱列表
          </el-menu-item>
          <el-menu-item index="/search">
            <el-icon><Search /></el-icon>
            今天做什么
          </el-menu-item>
          <el-menu-item index="/favorites">
            <el-icon><StarFilled /></el-icon>
            我的收藏
          </el-menu-item>
          <el-menu-item index="/add">
            <el-icon><Plus /></el-icon>
            录入菜谱
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
    <el-footer class="app-footer">
      <p>家庭食谱本 &copy; 2026</p>
    </el-footer>
  </el-container>
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
  background: #f5f5f5;
}

.app-container {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.title {
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.nav-menu {
  background: transparent;
  border: none;
}

.nav-menu .el-menu-item {
  color: white !important;
  font-size: 16px;
  font-weight: 500;
}

.nav-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.nav-menu .el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.3) !important;
  border-bottom: 3px solid white;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 30px 20px;
}

.app-footer {
  background: #333;
  color: #999;
  text-align: center;
  padding: 20px 0;
  font-size: 14px;
}
</style>
