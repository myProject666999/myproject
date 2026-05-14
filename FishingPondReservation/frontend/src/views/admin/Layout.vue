<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="aside">
      <div class="logo">🎣 管理后台</div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF">
        <el-menu-item index="/admin/dashboard">
          <i class="el-icon-s-data"></i>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/ponds">
          <i class="el-icon-location"></i>
          <span>塘位管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/equipment">
          <i class="el-icon-goods"></i>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/reservations">
          <i class="el-icon-date"></i>
          <span>预订管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/catch">
          <i class="el-icon-balance-scale"></i>
          <span>渔获称重</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <i class="el-icon-user"></i>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/live">
          <i class="el-icon-video-camera"></i>
          <span>直播管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div style="flex: 1;"></div>
        <el-dropdown @command="handleCommand">
          <span class="user-name">
            <el-avatar :size="32" icon="el-icon-user-solid"></el-avatar>
            {{ user.nickname || user.username }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="home">返回前台</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'AdminLayout',
  computed: {
    user() {
      return this.$store.state.user || {}
    },
    activeMenu() {
      return this.$route.path
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.$store.commit('LOGOUT')
        this.$message.success('已退出登录')
        this.$router.push('/login')
      } else if (command === 'home') {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}
.aside {
  background-color: #304156;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  background-color: #2b2f3a;
}
.menu {
  border-right: none;
}
.header {
  background-color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-left: 220px;
  border-bottom: 1px solid #e6e6e6;
}
.main {
  margin-left: 220px;
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
}
.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
