<template>
  <div id="app">
    <el-container v-if="isLoggedIn" style="height: 100vh;">
      <el-header style="background: #409EFF; color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">
        <div style="display: flex; align-items: center;">
          <span style="font-size: 20px; font-weight: bold;">球馆场地预约系统</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 20px;">欢迎，{{ userInfo.nickname || userInfo.username }}</span>
          <el-button type="text" style="color: white;" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" style="background: #545c64;">
          <el-menu
            router
            default-active="$route.path"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b">
            <el-menu-item index="/reservation">
              <i class="el-icon-time"></i>
              <span>在线预约</span>
            </el-menu-item>
            <el-menu-item index="/my-reservations">
              <i class="el-icon-document"></i>
              <span>我的预约</span>
            </el-menu-item>
            <el-menu-item index="/cards">
              <i class="el-icon-credit-card"></i>
              <span>我的卡包</span>
            </el-menu-item>
            <el-menu-item index="/match">
              <i class="el-icon-s-custom"></i>
              <span>拼场约球</span>
            </el-menu-item>
            <el-menu-item index="/coach">
              <i class="el-icon-user"></i>
              <span>教练课程</span>
            </el-menu-item>
            <el-menu-item v-if="isAdmin" index="/admin">
              <i class="el-icon-setting"></i>
              <span>管理后台</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <router-view v-else />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    isLoggedIn() {
      return !!this.$store.state.token
    },
    userInfo() {
      return this.$store.state.userInfo || {}
    },
    isAdmin() {
      return this.userInfo.role === 'ADMIN'
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style>
#app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}
</style>