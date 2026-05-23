<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>在线问卷调查系统</h1>
        <p>快速创建问卷，实时统计分析</p>
      </div>
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" @submit.prevent="handleLogin">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" placeholder="密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">登录</el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" @submit.prevent="handleRegister">
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" placeholder="用户名" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="nickname">
              <el-input v-model="registerForm.nickname" placeholder="昵称" prefix-icon="Avatar" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="registerForm.password" placeholder="密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-form-item prop="email">
              <el-input v-model="registerForm.email" placeholder="邮箱（选填）" prefix-icon="Message" />
            </el-form-item>
            <el-button type="primary" :loading="loading" @click="handleRegister" style="width: 100%">注册</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('login')
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  nickname: '',
  password: '',
  email: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await userStore.loginAction(loginForm)
        ElMessage.success('登录成功')
        router.push('/surveys')
      } catch (e) {
        // error handled in interceptor
      } finally {
        loading.value = false
      }
    }
  })
}

async function handleRegister() {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await userStore.registerAction(registerForm)
        ElMessage.success('注册成功')
        router.push('/surveys')
      } catch (e) {
        // error handled in interceptor
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.login-header {
  text-align: center;
  margin-bottom: 30px;
  h1 {
    font-size: 24px;
    color: #303133;
    margin-bottom: 8px;
  }
  p {
    color: #909399;
    font-size: 14px;
  }
}
.login-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}
</style>
