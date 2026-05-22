<template>
  <div>
    <AppHeader />
    <div class="app-container">
      <div class="page-header">
        <h1 class="page-title">个人中心</h1>
      </div>

      <div class="profile-content">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="80" :src="userStore.userInfo?.avatar">
              {{ userStore.userInfo?.username?.[0]?.toUpperCase() }}
            </el-avatar>
            <div class="user-basic">
              <h2>{{ userStore.userInfo?.username }}</h2>
              <el-tag :type="userStore.userInfo?.role === 'author' ? 'warning' : 'info'" size="small">
                {{ userStore.userInfo?.role === 'author' ? '作者' : userStore.userInfo?.role === 'admin' ? '管理员' : '读者' }}
              </el-tag>
            </div>
            <el-upload
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
              accept="image/*"
              class="avatar-uploader"
            >
              <el-button size="small">更换头像</el-button>
            </el-upload>
          </div>

          <el-form 
            ref="profileFormRef" 
            :model="profileForm" 
            label-width="80px"
            class="profile-form"
          >
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" />
            </el-form-item>
            <el-form-item label="简介" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="3"
                placeholder="介绍一下自己吧"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSave">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'

const userStore = useUserStore()

const profileForm = reactive({
  email: '',
  bio: '',
  avatar: ''
})

const saving = ref(false)
const profileFormRef = ref(null)

onMounted(() => {
  if (userStore.userInfo) {
    profileForm.email = userStore.userInfo.email || ''
    profileForm.bio = userStore.userInfo.bio || ''
  }
})

function beforeAvatarUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
  }
  return isImage && isLt2M
}

function handleAvatarUpload(options) {
  const formData = new FormData()
  formData.append('avatar', options.file)
  
  userApi.updateProfile(formData).then((res) => {
    userStore.userInfo = res.user
    ElMessage.success('头像更新成功')
  }).catch((error) => {
    console.error('上传头像失败', error)
  })
}

async function handleSave() {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('email', profileForm.email)
    formData.append('bio', profileForm.bio)
    
    const res = await userApi.updateProfile(formData)
    userStore.userInfo = res.user
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-content {
  max-width: 800px;
}

.profile-card {
  border-radius: 12px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.user-basic {
  flex: 1;
}

.user-basic h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.profile-form {
  max-width: 500px;
}
</style>
