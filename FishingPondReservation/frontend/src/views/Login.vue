<template>
  <div class="login-container">
    <div class="login-box">
      <h2 style="text-align: center; margin-bottom: 30px; color: #409EFF;">🎣 钓鱼场塘位预订系统</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="el-icon-lock" @keyup.enter="handleLogin"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%;" @click="handleLogin" :loading="loading">登录</el-button>
        </el-form-item>
        <div style="text-align: center;">
          <el-link type="primary" @click="$router.push('/register')">没有账号？去注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            const res = await request.post('/auth/login', this.loginForm)
            this.$store.commit('SET_TOKEN', res.data.token)
            this.$store.commit('SET_USER', res.data.user)
            this.$message.success('登录成功')
            if (res.data.user.role === 'ADMIN') {
              this.$router.push('/admin/dashboard')
            } else {
              this.$router.push('/ponds')
            }
          } catch (error) {
            console.error(error)
          } finally {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}
.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
