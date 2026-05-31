<template>
  <div id="app">
    <el-container class="app-container">
      <el-header class="app-header">
        <div class="header-content">
          <router-link to="/" class="logo">
            <el-icon><Location /></el-icon>
            <span>旅游行程规划助手</span>
          </router-link>
          <nav class="nav-menu">
            <router-link to="/" class="nav-item">
              <el-icon><List /></el-icon>
              <span>行程列表</span>
            </router-link>
          </nav>
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
</script>

<style lang="scss">
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 60px;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #409eff;
    text-decoration: none;

    .el-icon {
      font-size: 24px;
    }
  }

  .nav-menu {
    display: flex;
    gap: 20px;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #606266;
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        color: #409eff;
        background: #ecf5ff;
      }

      &.router-link-active {
        color: #409eff;
        background: #ecf5ff;
      }
    }
  }
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
