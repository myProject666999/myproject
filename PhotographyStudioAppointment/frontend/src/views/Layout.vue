<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: bold;">
        📷 摄影工作室
      </div>
      <el-menu
        class="sidebar-menu"
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#fff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/appointments">
          <el-icon><Calendar /></el-icon>
          <span>预约管理</span>
        </el-menu-item>
        <el-menu-item index="/schedule">
          <el-icon><Clock /></el-icon>
          <span>档期管理</span>
        </el-menu-item>
        <el-menu-item index="/packages">
          <el-icon><ShoppingBag /></el-icon>
          <span>套餐管理</span>
        </el-menu-item>
        <el-menu-item index="/costumes">
          <el-icon><ShoppingCart /></el-icon>
          <span>服装管理</span>
        </el-menu-item>
        <el-menu-item index="/customers">
          <el-icon><User /></el-icon>
          <span>客户管理</span>
        </el-menu-item>
        <el-menu-item index="/photos">
          <el-icon><Picture /></el-icon>
          <span>客片管理</span>
        </el-menu-item>
        <el-menu-item index="/work-orders">
          <el-icon><Tickets /></el-icon>
          <span>工单管理</span>
        </el-menu-item>
        <el-menu-item index="/deliveries">
          <el-icon><Goods /></el-icon>
          <span>交付管理</span>
        </el-menu-item>
        <el-menu-item v-if="userStore.role === 'admin'" index="/users">
          <el-icon><UserFilled /></el-icon>
          <span>员工管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header" height="60px">
        <span class="header-title">{{ currentTitle }}</span>
        <el-dropdown @command="handleCommand">
          <span style="display: flex; align-items: center; cursor: pointer;">
            <el-avatar :size="32" style="margin-right: 10px;">{{ userStore.name?.[0] }}</el-avatar>
            <span>{{ userStore.name }}</span>
            <el-icon style="margin-left: 5px;"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="password">修改密码</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>

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
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/auth'

const route = useRoute()
const router = useRouter()
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

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title || '摄影工作室管理系统')

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      router.push('/login')
    } catch {
    }
  } else if (command === 'password') {
    passwordDialogVisible.value = true
  }
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
