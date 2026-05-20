<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <div class="logo" @click="$router.push('/')">
          <i class="el-icon-film"></i>
          <span>观影记录</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="nav-menu"
          mode="horizontal"
          @select="handleMenuSelect">
          <el-menu-item index="library">影库</el-menu-item>
          <el-menu-item index="top">年度榜单</el-menu-item>
        </el-menu>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
      <el-footer class="footer">
        <span>© 2024 观影记录 - 记录每一次感动</span>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    activeMenu() {
      const path = this.$route.path
      if (path.startsWith('/top')) return 'top'
      return 'library'
    }
  },
  methods: {
    handleMenuSelect(index) {
      if (index === 'library') {
        this.$router.push('/')
      } else if (index === 'top') {
        this.$router.push('/top')
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 0 40px;
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .logo {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    margin-right: 50px;

    i {
      font-size: 24px;
      margin-right: 10px;
    }
  }

  .nav-menu {
    background: transparent;
    border: none;
    flex: 1;

    ::v-deep .el-menu-item {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      border-bottom: 2px solid transparent;

      &:hover, &.is-active {
        color: white;
        background: transparent;
        border-bottom-color: white;
      }
    }
  }
}

.main-content {
  background: #f5f7fa;
  padding: 30px 40px;
}

.footer {
  background: #303133;
  color: #909399;
  text-align: center;
  line-height: 60px;
  font-size: 14px;
}
</style>
