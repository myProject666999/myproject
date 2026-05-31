<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <span>Create Account</span>
        </div>
      </template>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-width="100px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="registerForm.username" placeholder="Enter username" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="Enter password" />
        </el-form-item>
        <el-form-item label="Real Name" prop="realName">
          <el-input v-model="registerForm.realName" placeholder="Enter real name" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="Enter phone number" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="registerForm.email" placeholder="Enter email address" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%">Register</el-button>
        </el-form-item>
        <div class="login-link">
          <span>Already have an account? </span>
          <router-link to="/login">Login</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '@/api/auth'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = ref({
  username: '',
  password: '',
  realName: '',
  phone: '',
  email: ''
})

const rules = {
  username: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }, { min: 6, message: 'Minimum 6 characters', trigger: 'blur' }],
  realName: [{ required: true, message: 'Please enter real name', trigger: 'blur' }],
  phone: [{ required: true, message: 'Please enter phone number', trigger: 'blur' }],
  email: [{ required: true, message: 'Please enter email', trigger: 'blur' }, { type: 'email', message: 'Invalid email format', trigger: 'blur' }]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await register(registerForm.value)
        ElMessage.success('Registration successful')
        router.push('/login')
      } catch (err) {
        ElMessage.error(err.message || 'Registration failed')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 450px;
}

.card-header {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

.login-link {
  text-align: center;
  margin-top: 10px;
}
</style>
