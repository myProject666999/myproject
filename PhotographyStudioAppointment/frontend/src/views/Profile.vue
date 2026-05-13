<template>
  <div class="page-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>

      <div class="profile-info">
        <el-avatar :size="80" style="margin-bottom: 20px;">{{ userStore.name?.[0] }}</el-avatar>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">{{ userStore.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ userStore.name }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="roleTagType">{{ roleLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userStore.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userStore.email || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-button type="primary" @click="openPasswordDialog">
          <el-icon><Lock /></el-icon>
          修改密码
        </el-button>
      </div>
    </el-card>

    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/auth'

const userStore = useUserStore()
const passwordDialogVisible = ref(false)
const passwordFormRef = ref(null)
const passwordLoading = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const roleMap = {
  admin: '管理员',
  photographer: '摄影师',
  stylist: '化妆师',
  staff: '员工'
}

const roleLabel = computed(() => roleMap[userStore.role] || userStore.role)

const roleTagType = computed(() => {
  const typeMap = {
    admin: 'danger',
    photographer: 'primary',
    stylist: 'success',
    staff: 'info'
  }
  return typeMap[userStore.role] || 'info'
})

const openPasswordDialog = () => {
  passwordDialogVisible.value = true
}

const handleChangePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error(error)
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped>
.profile-card {
  max-width: 600px;
  margin: 0 auto;
}

.profile-info {
  text-align: center;
}
</style>
