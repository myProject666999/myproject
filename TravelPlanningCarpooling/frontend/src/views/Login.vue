<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <div class="login-header">
        <h1 class="title">拼车出行</h1>
        <p class="subtitle">便捷、安全、经济的出行方式</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        label-position="top"
      >
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
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-button
          type="primary"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
      <div class="login-footer">
        <span>还没有账号？</span>
        <el-button type="text" class="register-link" @click="goToRegister">
          立即注册
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Phone, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  phone: '',
  password: ''
})

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userStore.login(form.phone, form.password)
        if (result) {
          ElMessage.success('登录成功')
          const redirect = route.query.redirect as string || '/'
          router.push(redirect)
        } else {
          ElMessage.error('登录失败，请检查手机号和密码')
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4F6EF7 0%, #667eea 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  overflow: hidden;
}

.login-card :deep(.el-card__body) {
  padding: 40px;
}

.login-header {
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

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 16px;
  background: linear-gradient(135deg, #4F6EF7 0%, #667eea 100%);
  border: none;
}

.login-btn:hover {
  background: linear-gradient(135deg, #3f58d1 0%, #5568c7 100%);
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.register-link {
  color: #4F6EF7;
  padding: 0 4px;
  font-size: 14px;
}

.register-link:hover {
  color: #667eea;
}
</style>
