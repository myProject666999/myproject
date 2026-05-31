<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Store } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { auth } from '@/utils/auth'
import type { LoginRequest } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive<LoginRequest>({
  username: '',
  password: '',
  remember: false
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const { token, user } = await auth.login({
          username: formData.username,
          password: formData.password,
          remember: formData.remember
        })
        userStore.login(user, token)
        ElMessage.success('登录成功')
        auth.redirectAfterLogin()
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
    </div>

    <div class="header">
      <div class="logo">
        <Store class="logo-icon" />
        <span class="logo-text">连锁门店巡检系统</span>
      </div>
    </div>

    <div class="login-wrapper">
      <div class="login-card">
        <div class="card-header">
          <h1 class="title">欢迎登录</h1>
          <p class="subtitle">请输入您的账号信息</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="formData"
          :rules="rules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              size="large"
              class="input-item"
            >
              <template #prefix>
                <User class="input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              class="input-item"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <Lock class="input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="formData.remember">
              记住密码
            </el-checkbox>
          </div>

          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 连锁门店巡检系统 版权所有</p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #0c1929 0%, #1a365d 50%, #2c5282 100%);
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.shape-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: 10%;
  left: -50px;
  background: linear-gradient(135deg, #34d399, #10b981);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}

.shape-3 {
  width: 200px;
  height: 200px;
  top: 30%;
  right: 15%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50% 20% 50% 20%;
}

.shape-4 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  right: 20%;
  background: linear-gradient(135deg, #f472b6, #ec4899);
}

.shape-5 {
  width: 100px;
  height: 100px;
  top: 15%;
  left: 20%;
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  border-radius: 20% 80% 50% 50%;
}

.header {
  position: absolute;
  top: 40px;
  left: 60px;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: #60a5fa;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 5;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 36px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.login-form {
  margin-top: 24px;
}

.input-item {
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.5);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.8);
}

.input-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
}

.form-options {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
}

:deep(.el-checkbox__label) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-checkbox__inner) {
  background: rgba(255, 255, 255, 0.9);
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.login-btn:active {
  transform: translateY(0);
}

.footer {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  z-index: 10;
}

.footer p {
  margin: 0;
}
</style>
