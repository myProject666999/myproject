<template>
  <div class="login-page">
    <el-card class="login-card">
      <div class="login-title">💪 BMI 体重追踪</div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" @submit.native.prevent>
            <el-form-item>
              <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="el-icon-user"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="loginForm.password" placeholder="密码" prefix-icon="el-icon-lock" show-password @keyup.enter.native="doLogin"></el-input>
            </el-form-item>
            <el-button type="primary" style="width:100%" @click="doLogin">登录</el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form :model="regForm">
            <el-form-item>
              <el-input v-model="regForm.username" placeholder="用户名"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="regForm.nickname" placeholder="昵称（可选）"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="regForm.password" placeholder="密码" show-password></el-input>
            </el-form-item>
            <el-button type="primary" style="width:100%" @click="doRegister">注册</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { login, register } from '../api'

export default {
  data() {
    return {
      activeTab: 'login',
      loginForm: { username: 'admin', password: '123456' },
      regForm: { username: '', nickname: '', password: '' }
    }
  },
  methods: {
    async doLogin() {
      if (!this.loginForm.username || !this.loginForm.password) {
        this.$message.warning('请输入用户名和密码')
        return
      }
      const res = await login(this.loginForm.username, this.loginForm.password)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userId', res.data.userId)
      localStorage.setItem('nickname', res.data.nickname)
      this.$message.success('登录成功')
      this.$router.push('/entry')
    },
    async doRegister() {
      if (!this.regForm.username || !this.regForm.password) {
        this.$message.warning('请填写完整')
        return
      }
      await register(this.regForm.username, this.regForm.password, this.regForm.nickname)
      this.$message.success('注册成功，请登录')
      this.activeTab = 'login'
      this.loginForm.username = this.regForm.username
    }
  }
}
</script>

<style scoped>
.login-page { display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); }
.login-card { width: 400px; }
.login-title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 20px; color: #409EFF; }
</style>
