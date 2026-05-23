<template>
  <div class="login-container">
    <div class="login-card">
      <h2>注册账号</h2>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" @submit.prevent>
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="用户名(3-50字符,字母数字下划线)" :prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" placeholder="密码(6-100字符)" :prefix-icon="Lock" size="large" show-password />
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input v-model="registerForm.nickname" placeholder="昵称(可选)" :prefix-icon="UserFilled" size="large" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="registerForm.email" placeholder="邮箱(可选)" :prefix-icon="Message" size="large" />
        </el-form-item>
        <el-button type="primary" size="large" style="width: 100%" @click="handleRegister" :loading="loading">
          注册
        </el-button>
        <div style="text-align: center; margin-top: 15px;">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = ref({
  username: '',
  password: '',
  nickname: '',
  email: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为3-50个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度为6-100个字符', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.register(registerForm.value)
        ElMessage.success('注册成功')
        router.push('/')
      } catch (e) {
        // error handled by interceptor
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
