
<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">🎤 KTV包厢预订与点歌系统</h2>
      <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-width="0px">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%;" @click="handleLogin">登 录</el-button>
        </el-form-item>
        <div class="tips">
          <p>测试账号：</p>
          <p>管理员：admin / 123456</p>
          <p>员工：staff01 / 123456</p>
          <p>会员：member01 / 123456</p>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.$message.success('登录成功！')
          const userData = {
            user: { username: this.loginForm.username, realName: '测试用户' },
            token: 'mock-token-' + Date.now(),
            role: this.loginForm.username === 'admin' ? 'ADMIN' : this.loginForm.username.startsWith('staff') ? 'STAFF' : 'MEMBER'
          }
          this.$store.dispatch('login', userData)
          if (userData.role === 'ADMIN' || userData.role === 'STAFF') {
            this.$router.push('/admin/dashboard')
          } else {
            this.$router.push('/')
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.tips {
  margin-top: 20px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.tips p {
  margin: 5px 0;
}
</style>
