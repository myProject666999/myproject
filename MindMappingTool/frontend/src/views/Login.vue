<template>
  <div class="login-container">
    <div class="login-box card">
      <h1 class="title">思维导图工具</h1>
      <div class="form-group">
        <label>用户名</label>
        <input v-model="form.username" placeholder="请输入用户名" />
      </div>
      <div class="form-group">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="请输入密码" />
      </div>
      <button class="btn btn-primary" @click="login">登录</button>
      <button class="btn btn-success" @click="register">注册</button>
      <p class="tip">演示账号：demo / 123456</p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../api'

const router = useRouter()
const form = reactive({
  username: '',
  password: ''
})

const login = async () => {
  try {
    const res = await userApi.login(form)
    if (res.data.code === 200) {
      localStorage.setItem('user', JSON.stringify(res.data.data))
      router.push('/list')
    } else {
      alert(res.data.message)
    }
  } catch (e) {
    alert('登录失败，请检查后端服务是否启动')
  }
}

const register = async () => {
  try {
    const res = await userApi.register(form)
    if (res.data.code === 200) {
      alert('注册成功，请登录')
    } else {
      alert(res.data.message)
    }
  } catch (e) {
    alert('注册失败')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-box {
  width: 400px;
  padding: 40px;
}
.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
}
.form-group input {
  width: 100%;
}
button {
  width: 100%;
  margin-bottom: 10px;
  padding: 12px;
  font-size: 16px;
}
.tip {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}
</style>
