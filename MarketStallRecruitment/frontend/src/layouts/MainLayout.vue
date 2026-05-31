<template>
  <div class="layout">
    <el-container>
      <el-aside width="200px" class="sidebar">
        <div class="logo">市集摊位管理</div>
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/event/list">
            <el-icon><Tickets /></el-icon>
            <span>活动管理</span>
          </el-menu-item>
          <el-menu-item index="/registration/list">
            <el-icon><Document /></el-icon>
            <span>报名管理</span>
          </el-menu-item>
          <el-menu-item index="/payment/list">
            <el-icon><Wallet /></el-icon>
            <span>缴费管理</span>
          </el-menu-item>
          <el-menu-item index="/announcement/list">
            <el-icon><Bell /></el-icon>
            <span>公告管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <span class="page-title">{{ pageTitle }}</span>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                {{ userStore.realName || userStore.username }}
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Odometer, Tickets, Document, Wallet, Bell, User } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  const titles = {
    '/dashboard': '仪表盘',
    '/event/list': '活动列表',
    '/event/create': '创建活动',
    '/registration/list': '报名列表',
    '/payment/list': '缴费列表',
    '/announcement/list': '公告列表'
  }
  return titles[route.path] || '市集摊位管理'
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      ElMessage.success('退出成功')
      router.push('/login')
    } catch (e) {
    }
  }
}
</script>

<style scoped lang="scss">
.layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  .logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid #1f2d3d;
  }
  .el-menu {
    border-right: none;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .header-left {
    .page-title {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
    }
  }

  .header-right {
    .user-info {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      color: #606266;
    }
  }
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
