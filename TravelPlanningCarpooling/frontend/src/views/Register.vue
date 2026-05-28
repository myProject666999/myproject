<template>
  <div class="register-container">
    <el-card class="register-card" shadow="hover">
      <div class="register-header">
        <h1 class="title">用户注册</h1>
        <p class="subtitle">创建账号，开启便捷拼车之旅</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="register-form"
        label-position="top"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="请输入昵称"
            :prefix-icon="User"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
            :prefix-icon="Phone"
            maxlength="11"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（至少6个字符）"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-button
          type="primary"
          class="register-btn"
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </el-button>
      </el-form>
      <div class="register-footer">
        <span>已有账号？</span>
        <el-button type="text" class="login-link" @click="goToLogin">
          立即登录
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Phone, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2到20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handleRegister() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userStore.register(form.phone, form.password, form.nickname)
        if (result) {
          ElMessage.success('注册成功，请登录')
          router.push('/login')
        } else {
          ElMessage.error('注册失败，请稍后重试')
        }
      } catch (error) {
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4F6EF7 0%, #667eea 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  overflow: hidden;
}

.register-card :deep(.el-card__body) {
  padding: 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #4F6EF7;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.register-form {
  margin-bottom: 24px;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 16px;
  background: linear-gradient(135deg, #4F6EF7 0%, #667eea 100%);
  border: none;
}

.register-btn:hover {
  background: linear-gradient(135deg, #3f58d1 0%, #5568c7 100%);
}

.register-footer {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.login-link {
  color: #4F6EF7;
  padding: 0 4px;
  font-size: 14px;
}

.login-link:hover {
  color: #667eea;
}
</style>
