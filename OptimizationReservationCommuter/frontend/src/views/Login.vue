<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>🚍 通勤班车预约系统</h1>
        <p>Shuttle Booking System</p>
      </div>
      <el-form :model="form" class="login-form">
        <el-form-item>
          <el-input
            v-model="form.employeeNo"
            placeholder="请输入员工工号"
            size="large"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-tip">
        <p>示例工号：EMP001、EMP002、EMP003</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const form = ref({
  employeeNo: ''
})

async function handleLogin() {
  if (!form.value.employeeNo) {
    ElMessage.warning('请输入员工工号')
    return
  }
  loading.value = true
  const success = await userStore.login(form.value.employeeNo)
  loading.value = false
  if (success) {
    ElMessage.success('登录成功')
    router.push('/map')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.login-header p {
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-tip {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 12px;
}
</style>
