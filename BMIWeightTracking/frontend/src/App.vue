<template>
  <div id="app">
    <el-container>
      <el-header v-if="isLogin">
        <div class="header-inner">
          <span class="logo">💪 BMI 体重追踪</span>
          <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect" class="el-menu">
            <el-menu-item index="/entry">录入</el-menu-item>
            <el-menu-item index="/trend">趋势</el-menu-item>
            <el-menu-item index="/goal">目标</el-menu-item>
            <el-menu-item index="/reminder">提醒</el-menu-item>
          </el-menu>
          <div class="user-info">
            <el-dropdown @command="handleUserCommand">
              <span class="el-dropdown-link">{{ nickname || '用户' }}<i class="el-icon-arrow-down el-icon--right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    isLogin() {
      return !!localStorage.getItem('token')
    },
    nickname() {
      return localStorage.getItem('nickname')
    },
    activeMenu() {
      return this.$route.path
    }
  },
  methods: {
    handleMenuSelect(index) {
      this.$router.push(index)
    },
    handleUserCommand(cmd) {
      if (cmd === 'logout') {
        localStorage.clear()
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style>
html, body, #app { height: 100%; margin: 0; padding: 0; }
.el-header { padding: 0; border-bottom: 1px solid #e4e7ed; }
.header-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; height: 60px; }
.logo { font-size: 18px; font-weight: bold; margin-right: 30px; color: #409EFF; }
.el-menu { flex: 1; border-bottom: none; }
.user-info { margin-left: auto; margin-right: 20px; }
.el-dropdown-link { cursor: pointer; color: #606266; }
</style>
