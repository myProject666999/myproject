<template>
  <el-container class="layout-container">
    <el-aside width="220px">
      <div style="height: 60px; display: flex; align-items: center; justify-content: center; background: #001529; color: #fff; font-size: 16px; font-weight: 600;">
        巡检ChatOps
      </div>
      <el-menu
        class="sidebar-menu"
        :default-active="$route.path"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>巡检任务</span>
        </el-menu-item>
        <el-menu-item index="/results">
          <el-icon><Document /></el-icon>
          <span>执行结果</span>
        </el-menu-item>
        <el-menu-item index="/robots">
          <el-icon><ChatDotRound /></el-icon>
          <span>机器人配置</span>
        </el-menu-item>
        <el-menu-item index="/plans">
          <el-icon><Setting /></el-icon>
          <span>预案管理</span>
        </el-menu-item>
        <el-menu-item index="/audit">
          <el-icon><Monitor /></el-icon>
          <span>指令审计</span>
        </el-menu-item>
        <el-menu-item index="/reports">
          <el-icon><DataLine /></el-icon>
          <span>巡检报告</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background: #fff; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; box-shadow: 0 1px 4px rgba(0,21,41,.08);">
        <div style="font-size: 18px; font-weight: 600;">{{ $route.meta.title }}</div>
        <div style="display: flex; align-items: center; gap: 20px;">
          <span>{{ userStore.userInfo?.real_name || userStore.userInfo?.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (!userStore.userInfo) {
    userStore.fetchProfile()
  }
})

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.el-aside {
  background-color: #001529;
}
</style>
