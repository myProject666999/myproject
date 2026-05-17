<template>
  <div class="login-container">
    <div class="login-box">
      <h2>家庭共享账本</h2>
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" style="width: 100%">登录</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="showRegister = true">没有账号？去注册</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog title="注册" :visible.sync="showRegister" width="400px">
      <el-form :model="registerForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="registerForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="registerForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="registerForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="registerForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showRegister = false">取消</el-button>
        <el-button type="primary" @click="register">注册</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        password: '',
        nickname: '',
        email: ''
      },
      showRegister: false
    }
  },
  methods: {
    async login() {
      try {
        const res = await this.$http.post('/auth/login', this.form)
        if (res.data.code === 200) {
          this.$store.dispatch('login', res.data.data)
          this.$router.push('/dashboard')
          this.$message.success('登录成功')
        } else {
          this.$message.error(res.data.message)
        }
      } catch (e) {
        this.$message.error('登录失败，请检查服务是否启动')
      }
    },
    async register() {
      try {
        const res = await this.$http.post('/auth/register', this.registerForm)
        if (res.data.code === 200) {
          this.$message.success('注册成功')
          this.showRegister = false
        } else {
          this.$message.error(res.data.message)
        }
      } catch (e) {
        this.$message.error('注册失败')
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 350px;
}
h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>
