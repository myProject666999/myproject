<template>
  <el-container class="layout-container">
    <el-aside width="200px" style="background-color: #304156;">
      <div style="padding: 20px; text-align: center; color: white; font-size: 18px; font-weight: bold;">
        健身房管理系统
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <el-menu-item index="/users" v-if="isAdminOrReception">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/membership-cards" v-if="isAdminOrReception">
          <el-icon><CreditCard /></el-icon>
          <span>会员卡管理</span>
        </el-menu-item>
        
        <el-menu-item index="/group-classes">
          <el-icon><Calendar /></el-icon>
          <span>团体课管理</span>
        </el-menu-item>
        
        <el-menu-item index="/private-courses" v-if="isAdminOrReceptionOrCoach">
          <el-icon><Clock /></el-icon>
          <span>私教课程</span>
        </el-menu-item>
        
        <el-menu-item index="/performance" v-if="isAdminOrReception">
          <el-icon><DataAnalysis /></el-icon>
          <span>业绩管理</span>
        </el-menu-item>
        
        <el-menu-item index="/gate-records" v-if="isAdminOrReception">
          <el-icon><Monitor /></el-icon>
          <span>闸机记录</span>
        </el-menu-item>
        
        <el-menu-item index="/renewal-reminders" v-if="isAdminOrReception">
          <el-icon><Bell /></el-icon>
          <span>续卡提醒</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header style="background-color: white; display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
        <span style="font-size: 16px; font-weight: 500;">{{ currentTitle }}</span>
        <div style="display: flex; align-items: center; gap: 20px;">
          <span>{{ userInfo.realName }} ({{ userInfo.roleName }})</span>
          <el-button type="primary" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

const userInfo = computed(() => JSON.parse(localStorage.getItem('userInfo') || '{}'))

const activeMenu = computed(() => route.path)

const currentTitle = computed(() => route.meta.title || '首页')

const isAdminOrReception = computed(() => 
  ['ADMIN', 'RECEPTION'].includes(userInfo.value.role)
)

const isAdminOrReceptionOrCoach = computed(() => 
  ['ADMIN', 'RECEPTION', 'COACH'].includes(userInfo.value.role)
)

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>
