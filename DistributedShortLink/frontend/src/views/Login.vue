<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon>
          <span>用户登录</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable>
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleSubmit"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleSubmit">
            登录
          </el-button>
        </el-form-item>
        <div class="link-row">
          还没有账号？
          <el-link type="primary" :underline="false" @click="goRegister">立即注册</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await request.post('/user/login', form)
      const data = res.data || {}
      if (data.token) localStorage.setItem('token', data.token)
      if (data.userId) localStorage.setItem('userId', data.userId)
      if (data.username) localStorage.setItem('username', data.username)
      ElMessage.success('登录成功')
      router.push('/manage')
    } catch (e) {
    } finally {
      loading.value = false
    }
  })
}

const goRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 40px 20px;
}
.login-card {
  width: 100%;
  max-width: 420px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  justify-content: center;
}
.link-row {
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
