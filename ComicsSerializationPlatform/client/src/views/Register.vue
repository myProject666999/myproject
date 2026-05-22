<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>创建账号</h1>
        <p>加入我们，开启漫画阅读之旅</p>
      </div>
      <el-form 
        ref="registerForm" 
        :model="registerForm" 
        :rules="rules"
        class="auth-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username" 
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="email">
          <el-input 
            v-model="registerForm.email" 
            placeholder="邮箱"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="确认密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        <el-form-item prop="role">
          <el-radio-group v-model="registerForm.role" class="role-selector">
            <el-radio value="reader">
              <div class="role-option">
                <el-icon :size="20" class="role-icon"><Reading /></el-icon>
                <div class="role-text">
                  <div class="role-name">读者</div>
                  <div class="role-desc">阅读漫画</div>
                </div>
              </div>
            </el-radio>
            <el-radio value="author">
              <div class="role-option">
                <el-icon :size="20" class="role-icon"><Edit /></el-icon>
                <div class="role-text">
                  <div class="role-name">作者</div>
                  <div class="role-desc">上传作品</div>
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-button 
          type="primary" 
          size="large" 
          class="submit-btn"
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </el-button>
      </el-form>
      <div class="auth-footer">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Reading, Edit } from '@element-plus/icons-vue'
import { userApi } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'reader'
})

const loading = ref(false)
const registerFormRef = ref(null)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

async function handleRegister() {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
  } catch (error) {
    return
  }

  loading.value = true
  try {
    const { confirmPassword, ...data } = registerForm
    const res = await userApi.register(data)
    userStore.setAuth(res.token, res.user)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error) {
    console.error('注册失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.auth-header p {
  font-size: 14px;
  color: #909399;
}

.auth-form {
  margin-bottom: 24px;
}

.role-selector {
  display: flex;
  gap: 16px;
  width: 100%;
}

.role-selector :deep(.el-radio) {
  flex: 1;
  margin: 0;
}

.role-selector :deep(.el-radio__input) {
  display: none;
}

.role-selector :deep(.el-radio__label) {
  padding: 0;
  width: 100%;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.role-selector :deep(.el-radio.is-checked) .role-option {
  border-color: #409eff;
  background: #ecf5ff;
}

.role-icon {
  color: #606266;
  flex-shrink: 0;
}

.role-text {
  flex: 1;
}

.role-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.role-desc {
  font-size: 12px;
  color: #909399;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: #909399;
}

.auth-footer a {
  color: #409eff;
  text-decoration: none;
  margin-left: 4px;
}
</style>
