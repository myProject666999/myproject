<template>
  <div>
    <div class="page-header">
      <h2>个人中心</h2>
    </div>
    
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="card-container" style="text-align: center;">
          <el-avatar :size="80" :src="user?.avatar">
            {{ user?.username?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <h3 style="margin: 16px 0 8px;">{{ user?.username }}</h3>
          <p style="color: #909399; margin-bottom: 16px;">{{ user?.email || '未设置邮箱' }}</p>
          
          <el-divider />
          
          <div style="text-align: left;">
            <p style="margin-bottom: 8px;">
              <el-icon><User /></el-icon>
              用户名：{{ user?.username }}
            </p>
            <p style="margin-bottom: 8px;">
              <el-icon><Message /></el-icon>
              邮箱：{{ user?.email || '未设置' }}
            </p>
            <p style="margin-bottom: 8px;">
              <el-icon><Phone /></el-icon>
              手机：{{ user?.phone || '未设置' }}
            </p>
            <p>
              <el-icon><Clock /></el-icon>
              注册时间：{{ formatDate(user?.created_at) }}
            </p>
          </div>
        </div>
      </el-col>
      
      <el-col :span="16">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="info">
            <div class="card-container">
              <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px" style="max-width: 500px;">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="saving" @click="handleSaveProfile">
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="修改密码" name="password">
            <div class="card-container">
              <el-form :model="passwordForm" label-width="100px" style="max-width: 500px;">
                <el-form-item label="原密码" required>
                  <el-input
                    v-model="passwordForm.old_password"
                    type="password"
                    show-password
                    placeholder="请输入原密码"
                  />
                </el-form-item>
                <el-form-item label="新密码" required>
                  <el-input
                    v-model="passwordForm.new_password"
                    type="password"
                    show-password
                    placeholder="请输入新密码"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="changingPassword" @click="handleChangePassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '@/api'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

const userStore = useUserStore()
const user = ref(null)
const activeTab = ref('info')
const saving = ref(false)
const changingPassword = ref(false)
const profileFormRef = ref(null)

const profileForm = ref({
  email: '',
  phone: ''
})

const profileRules = {
  email: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(value)) {
          callback(new Error('请输入正确的邮箱格式'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const phoneRegex = /^1[3-9]\d{9}$/
        if (!phoneRegex.test(value)) {
          callback(new Error('请输入正确的手机号格式'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const passwordForm = ref({
  old_password: '',
  new_password: ''
})

onMounted(() => {
  loadProfile()
})

const loadProfile = async () => {
  try {
    const res = await userApi.getProfile()
    user.value = res.data
    profileForm.value.email = res.data.email || ''
    profileForm.value.phone = res.data.phone || ''
  } catch (e) {
    console.error(e)
  }
}

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await userApi.updateProfile(profileForm.value)
        ElMessage.success('保存成功')
        loadProfile()
      } catch (e) {
        console.error(e)
      } finally {
        saving.value = false
      }
    }
  })
}

const handleChangePassword = async () => {
  if (!passwordForm.value.old_password) {
    ElMessage.warning('请输入原密码')
    return
  }
  if (!passwordForm.value.new_password || passwordForm.value.new_password.length < 6) {
    ElMessage.warning('新密码至少6位')
    return
  }
  
  changingPassword.value = true
  try {
    await userApi.changePassword(passwordForm.value)
    ElMessage.success('密码修改成功')
    passwordForm.value = {
      old_password: '',
      new_password: ''
    }
  } catch (e) {
    console.error(e)
  } finally {
    changingPassword.value = false
  }
}
</script>
