<template>
  <div class="user-profile">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never">
          <div class="profile-header">
            <el-avatar :size="80" :src="userInfo.avatar">
              {{ userInfo.realName?.charAt(0) || 'U' }}
            </el-avatar>
            <h2>{{ userInfo.realName }}</h2>
            <p>{{ userInfo.username }}</p>
            <el-tag :type="userInfo.role === 3 ? 'danger' : userInfo.role === 2 ? 'primary' : 'info'">
              {{ userInfo.role === 3 ? '管理员' : userInfo.role === 2 ? '客服' : '客户' }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </div>
          </template>
          <el-form :model="profileForm" label-width="100px" style="max-width: 500px">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="profileForm.realName" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="profileForm.phone" />
            </el-form-item>
            <el-form-item label="部门" v-if="userInfo.role >= 2">
              <el-input v-model="profileForm.department" />
            </el-form-item>
            <el-form-item label="技能标签" v-if="userInfo.role === 2">
              <el-input v-model="profileForm.skillTags" placeholder="多个标签用逗号分隔" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdate">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </div>
          </template>
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px" style="max-width: 500px">
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { getUserInfo, updateUser } from '@/api/user'

const userStore = useUserStore()
const passwordFormRef = ref(null)

const userInfo = ref({})
const profileForm = reactive({
  username: '',
  realName: '',
  email: '',
  phone: '',
  department: '',
  skillTags: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function loadUserInfo() {
  const res = await getUserInfo()
  if (res.code === 0) {
    userInfo.value = res.data
    Object.assign(profileForm, {
      username: res.data.username,
      realName: res.data.realName,
      email: res.data.email,
      phone: res.data.phone,
      department: res.data.department,
      skillTags: res.data.skillTags
    })
  }
}

async function handleUpdate() {
  const res = await updateUser({
    id: userInfo.value.id,
    ...profileForm,
    status: 1
  })
  if (res.code === 0) {
    ElMessage.success('保存成功')
    loadUserInfo()
    userStore.fetchUserInfo()
  } else {
    ElMessage.error(res.message || '保存失败')
  }
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      ElMessage.success('密码修改成功')
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
  })
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.profile-header {
  text-align: center;
  padding: 20px;

  h2 {
    margin: 16px 0 8px;
  }

  p {
    color: #909399;
    margin-bottom: 12px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
