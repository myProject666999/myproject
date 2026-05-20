<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo" @click="$router.push('/')">
          <el-icon><Food /></el-icon>
          <span>美食打卡</span>
        </div>
        <el-menu 
          :default-active="$route.path" 
          mode="horizontal" 
          router
          class="header-menu"
        >
          <el-menu-item index="/">
            <el-icon><Location /></el-icon>
            <span>地图首页</span>
          </el-menu-item>
          <el-menu-item index="/restaurants">
            <el-icon><Shop /></el-icon>
            <span>餐厅列表</span>
          </el-menu-item>
          <el-menu-item index="/checkins">
            <el-icon><EditPen /></el-icon>
            <span>打卡记录</span>
          </el-menu-item>
          <el-menu-item index="/month-review">
            <el-icon><DataAnalysis /></el-icon>
            <span>月度回顾</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
}

.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: bold;
    color: #409eff;
    cursor: pointer;
    margin-right: 40px;
    padding: 0 20px;

    .el-icon {
      font-size: 28px;
    }
  }

  .header-menu {
    flex: 1;
    border-bottom: none;
  }
}

.app-main {
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
}
</style>
