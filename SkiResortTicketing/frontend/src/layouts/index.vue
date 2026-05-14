<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo">
        <span v-if="!isCollapse">滑雪场票务系统</span>
        <span v-else>滑雪场</span>
      </div>
      <el-menu :default-active="$route.path" router :collapse="isCollapse" background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF" unique-opened>
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><Avatar /></el-icon>
              admin
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

const isCollapse = ref(false)

const menuItems = [
  { path: '/dashboard', title: '工作台', icon: 'HomeFilled' },
  { path: '/ticket', title: '票种管理', icon: 'Ticket' },
  { path: '/equipment', title: '雪具租赁', icon: 'Goods' },
  { path: '/coach', title: '教练预约', icon: 'User' },
  { path: '/locker', title: '储物柜管理', icon: 'Box' },
  { path: '/gate', title: '闸机管理', icon: 'Switch' },
  { path: '/lost', title: '失物招领', icon: 'Warning' },
  { path: '/order', title: '订单管理', icon: 'Document' }
]

const handleCommand = (command) => {
  if (command === 'profile') {
    ElMessageBox.alert(
      '用户名: admin\n真实姓名: 系统管理员\n手机号: 13800000000\n角色: 超级管理员\n状态: 正常',
      '个人中心',
      { confirmButtonText: '关闭' }
    )
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #263445;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 5px;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
