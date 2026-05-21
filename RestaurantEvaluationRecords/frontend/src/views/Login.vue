<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
    <el-card style="width: 400px; border-radius: 12px">
      <template #header>
        <div style="text-align: center; font-size: 20px; font-weight: bold; color: #409eff">
          <el-icon><Food /></el-icon>
          餐厅评价记录系统
        </div>
      </template>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="handleLogin" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
      <div style="text-align: center; color: #999; font-size: 12px">
        测试账号：zhangsan / 123456
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api'

const router = useRouter()

const loginForm = ref({
  username: 'zhangsan',
  password: '123456'
})

const loading = ref(false)

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const user = await login(loginForm.value)
    localStorage.setItem('currentUser', JSON.stringify(user))
    ElMessage.success('登录成功')
    router.push('/restaurants')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
