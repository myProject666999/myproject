<template>
  <div class="register">
    <el-card class="register__card" shadow="hover">
      <h2 class="register__title">欢迎注册</h2>
      <p class="register__subtitle">加入知识付费专栏平台</p>

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

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            size="large"
            :prefix-icon="Message"
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

        <el-form-item label="确认密码" prop="confirm_password">
          <el-input
            v-model="formData.confirm_password"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item label="选择角色" prop="role">
          <el-radio-group v-model="formData.role">
            <el-radio :label="1">
              <el-icon><Reading /></el-icon>
              读者
            </el-radio>
            <el-radio :label="2">
              <el-icon><Edit /></el-icon>
              作者
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register__submit"
            :loading="submitting"
            @click="handleSubmit"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register__footer">
        <span>已有账号？</span>
        <el-link type="primary" @click="goLogin">立即登录</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Reading, Edit } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const submitting = ref(false)

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  role: 1
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
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
    await userStore.register(formData.value)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 24px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ee 100%);
}

.register__card {
  width: 100%;
  max-width: 440px;
}

.register__title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  text-align: center;
  color: var(--el-text-color-primary);
}

.register__subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: center;
  margin: 0 0 24px;
}

.register__submit {
  width: 100%;
}

.register__footer {
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 16px;
}
</style>
