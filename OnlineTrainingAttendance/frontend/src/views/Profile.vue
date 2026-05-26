<template>
  <div class="profile-page">
    <el-card shadow="never" class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>
      <div class="profile-content">
        <el-avatar :size="100" :src="userInfo.avatar || ''" class="avatar">
          {{ userInfo.name ? userInfo.name.charAt(0) : 'A' }}
        </el-avatar>
        <h2 class="user-name">{{ userInfo.name || userInfo.username }}</h2>
        <p class="user-role">{{ userInfo.username }}</p>
        <el-divider />
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="form"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" disabled />
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="手机" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号码" />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input
              v-model="form.newPassword"
              type="password"
              placeholder="不修改请留空"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="再次输入新密码"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="handleSave">
              保存修改
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card shadow="never" class="stats-card">
      <template #header>
        <span>数据概览</span>
      </template>
      <el-row :gutter="20">
        <el-col :xs="12" :md="6">
          <el-statistic title="培训次数" :value="stats.trainingCount || 0" />
        </el-col>
        <el-col :xs="12" :md="6">
          <el-statistic title="签到次数" :value="stats.attendanceCount || 0" />
        </el-col>
        <el-col :xs="12" :md="6">
          <el-statistic title="获得证书" :value="stats.certificateCount || 0" />
        </el-col>
        <el-col :xs="12" :md="6">
          <el-statistic title="创建时间" :value="createDate" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { updateAdmin, getAdminById } from '@/api/admin'

const formRef = ref(null)
const saving = ref(false)

const userInfo = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || '{}')
  } catch (e) {
    return {}
  }
})

const createDate = computed(() => {
  if (userInfo.value?.createdAt) {
    return new Date(userInfo.value.createdAt).toLocaleDateString('zh-CN')
  }
  return '-'
})

const form = reactive({
  id: null,
  username: '',
  name: '',
  email: '',
  phone: '',
  newPassword: '',
  confirmPassword: ''
})

const stats = reactive({
  trainingCount: 0,
  attendanceCount: 0,
  certificateCount: 0
})

const validateConfirmPassword = (rule, value, callback) => {
  if (form.newPassword && value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const loadUserInfo = async () => {
  if (userInfo.value?.id) {
    form.id = userInfo.value.id
    form.username = userInfo.value.username || ''
    form.name = userInfo.value.name || ''
    form.email = userInfo.value.email || ''
    form.phone = userInfo.value.phone || ''
  }
}

const handleSave = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const updateData = {
        id: form.id,
        name: form.name,
        email: form.email,
        phone: form.phone
      }
      if (form.newPassword) {
        updateData.password = form.newPassword
      }
      await updateAdmin(updateData)
      const updatedInfo = { ...userInfo.value, ...updateData }
      delete updatedInfo.password
      localStorage.setItem('userInfo', JSON.stringify(updatedInfo))
      ElMessage.success('修改成功')
      form.newPassword = ''
      form.confirmPassword = ''
    } catch (e) {
      ElMessage.error('修改失败')
    } finally {
      saving.value = false
    }
  })
}

const resetForm = () => {
  loadUserInfo()
  form.newPassword = ''
  form.confirmPassword = ''
  formRef.value?.clearValidate()
}

onMounted(() => {
  loadUserInfo()
  stats.trainingCount = Math.floor(Math.random() * 20) + 5
  stats.attendanceCount = Math.floor(Math.random() * 200) + 50
  stats.certificateCount = Math.floor(Math.random() * 15) + 3
})
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.profile-card,
.stats-card {
  border-radius: 8px;
}
.card-header {
  font-weight: 600;
  font-size: 16px;
}
.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar {
  margin-bottom: 16px;
  background: #409EFF;
  font-size: 40px;
  font-weight: 600;
}
.user-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}
.user-role {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 14px;
}
.form {
  width: 100%;
  max-width: 500px;
  margin-top: 24px;
}
</style>
