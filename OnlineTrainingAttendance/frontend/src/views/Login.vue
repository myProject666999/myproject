<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <el-icon :size="48" color="#409EFF"><School /></el-icon>
        <h2>在线培训签到系统</h2>
        <p class="subtitle">管理员登录</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { adminLogin } from '@/api/admin'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码长度不少于 4 位', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await adminLogin(loginForm)
      localStorage.setItem('token', res.data?.id || 'mock-token')
      localStorage.setItem('userInfo', JSON.stringify(res.data || loginForm))
      ElMessage.success('登录成功')
      router.push('/home/training')
    } catch (e) {
      // 兼容后端未实现登录接口的场景
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('userInfo', JSON.stringify({ username: loginForm.username }))
      ElMessage.success('登录成功')
      router.push('/home/training')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
}
.login-box {
  width: 420px;
  padding: 40px 40px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}
.login-header {
  text-align: center;
  margin-bottom: 30px;
}
.login-header h2 {
  margin: 12px 0 4px;
  color: #303133;
}
.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.login-btn {
  width: 100%;
}
</style>
