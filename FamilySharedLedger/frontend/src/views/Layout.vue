<template>
  <el-container style="height: 100vh">
    <el-aside width="200px" style="background-color: #304156">
      <div class="logo">家庭共享账本</div>
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#ffd04b"
        router>
        <el-menu-item index="/dashboard">
          <i class="el-icon-s-home"></i>
          <span slot="title">首页概览</span>
        </el-menu-item>
        <el-menu-item index="/family">
          <i class="el-icon-user-solid"></i>
          <span slot="title">家庭设置</span>
        </el-menu-item>
        <el-menu-item index="/bills">
          <i class="el-icon-document"></i>
          <span slot="title">共享账单</span>
        </el-menu-item>
        <el-menu-item index="/settlement">
          <i class="el-icon-s-finance"></i>
          <span slot="title">结算中心</span>
        </el-menu-item>
        <el-menu-item index="/balance">
          <i class="el-icon-wallet"></i>
          <span slot="title">个人欠款</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="text-align: right; font-size: 12px; background: #fff; border-bottom: 1px solid #e6e6e6">
        <span>{{ user ? user.nickname : '用户' }}</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  computed: {
    user() {
      return this.$store.state.user
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

<style scoped>
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #2b2f3a;
}
.el-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
</style>
