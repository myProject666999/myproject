<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="logo">🎣 钓鱼场塘位预订系统</div>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        class="menu"
        router
        background-color="#2c3e50"
        text-color="#ecf0f1"
        active-text-color="#38ef7d">
        <el-menu-item index="/ponds">塘位预订</el-menu-item>
        <el-menu-item index="/equipment">渔具商城</el-menu-item>
        <el-menu-item index="/my-reservations">我的预订</el-menu-item>
        <el-menu-item index="/my-orders">我的订单</el-menu-item>
        <el-menu-item index="/leaderboard">钓友排行</el-menu-item>
        <el-menu-item index="/live">现场直播</el-menu-item>
      </el-menu>
      <div class="user-info">
        <el-dropdown @command="handleCommand">
          <span class="user-name">
            <el-avatar :size="32" icon="el-icon-user-solid"></el-avatar>
            {{ user.nickname || user.username }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'Layout',
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
      }
    }
  }
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}
.header {
  background-color: #2c3e50;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: white;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  margin-right: 30px;
  white-space: nowrap;
}
.menu {
  flex: 1;
  border-bottom: none;
}
.menu >>> .el-menu-item {
  border-bottom: none;
}
.user-info {
  margin-left: 20px;
}
.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}
.main {
  padding: 20px;
}
</style>
