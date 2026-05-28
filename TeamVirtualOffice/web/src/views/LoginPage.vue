<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <div class="login-header">
        <div class="logo">
          <el-icon :size="48" color="#409eff"><OfficeBuilding /></el-icon>
        </div>
        <h2>Team Virtual Office</h2>
        <p class="subtitle">Connect with your team in the virtual workspace</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="0"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="Username"
            size="large"
            :prefix-icon="User"
            autocomplete="username"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Password"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            Sign In
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <span class="register-link" @click="showRegisterModal = true">
          Don't have an account? Register now
        </span>
      </div>
    </el-card>
    <el-dialog
      v-model="showRegisterModal"
      title="Create Account"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="80px"
      >
        <el-form-item label="Username" prop="username">
          <el-input v-model="registerForm.username" placeholder="Enter username" />
        </el-form-item>
        <el-form-item label="Nickname" prop="nickname">
          <el-input v-model="registerForm.nickname" placeholder="Enter nickname" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="registerForm.email" placeholder="Enter email" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="Enter password"
            show-password
          />
        </el-form-item>
        <el-form-item label="Confirm" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="Confirm password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRegisterModal = false">Cancel</el-button>
        <el-button type="primary" :loading="registerLoading" @click="handleRegister">
          Register
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { OfficeBuilding, User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useWsStore } from '@/stores/ws'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const wsStore = useWsStore()

const formRef = ref(null)
const form = reactive({
  username: '',
  password: ''
})
const loading = ref(false)

const rules = {
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length should be 3 to 20 characters', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password should be at least 6 characters', trigger: 'blur' }
  ]
}

const showRegisterModal = ref(false)
const registerFormRef = ref(null)
const registerForm = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const registerLoading = ref(false)

const registerRules = {
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length should be 3 to 20 characters', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: 'Please enter nickname', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password should be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(form)
        wsStore.connect()
        ElMessage.success('Login successful!')
        router.push('/office')
      } catch (e) {
        ElMessage.error(e.response?.data?.message || 'Login failed. Please try again.')
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
      registerLoading.value = true
      try {
        await request.post('/api/user/register', {
          username: registerForm.username,
          nickname: registerForm.nickname,
          email: registerForm.email,
          password: registerForm.password
        })
        ElMessage.success('Registration successful! Please login.')
        showRegisterModal.value = false
        registerFormRef.value?.resetFields()
      } catch (e) {
        ElMessage.error(e.response?.data?.message || 'Registration failed. Please try again.')
      } finally {
        registerLoading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 50px 50px;
  }

  .login-card {
    width: 420px;
    border-radius: 16px;
    position: relative;
    z-index: 1;

    .login-header {
      text-align: center;
      margin-bottom: 32px;

      .logo {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;

        .el-icon {
          color: #fff;
        }
      }

      h2 {
        margin: 0 0 8px 0;
        color: #303133;
        font-size: 24px;
        font-weight: 600;
      }

      .subtitle {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }

    .login-form {
      .login-btn {
        width: 100%;
        font-weight: 500;
      }
    }

    .login-footer {
      text-align: center;
      margin-top: 16px;

      .register-link {
        color: #409eff;
        cursor: pointer;
        font-size: 14px;
        transition: color 0.3s;

        &:hover {
          color: #66b1ff;
        }
      }
    }
  }
}
</style>
