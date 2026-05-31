<template>
  <div class="login">
    <el-card class="login__card" shadow="hover">
      <h2 class="login__title">欢迎登录</h2>
      <p class="login__subtitle">知识付费专栏平台</p>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        @keyup.enter="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login__submit"
            :loading="submitting"
            @click="handleSubmit"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login__footer">
        <span>还没有账号？</span>
        <el-link type="primary" @click="goRegister">立即注册</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const submitting = ref(false)

const formData = ref({
  username: '',
  password: ''
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' }
  ]
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    await userStore.login(formData.value)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

function goRegister() {
  router.push('/register')
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 24px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ee 100%);
}

.login__card {
  width: 100%;
  max-width: 400px;
}

.login__title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  text-align: center;
  color: var(--el-text-color-primary);
}

.login__subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: center;
  margin: 0 0 24px;
}

.login__submit {
  width: 100%;
}

.login__footer {
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 16px;
}
</style>
