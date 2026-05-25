<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <div class="logo">
        <el-icon><Monitor /></el-icon>
        商品价格监控系统
      </div>
      <div class="user-info">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge-icon">
          <el-icon :size="20" @click="showAlerts = true">
            <Bell />
          </el-icon>
        </el-badge>
        <el-dropdown>
          <span class="user-dropdown">
            <el-avatar :size="32" :src="userStore.userInfo?.avatar">
              {{ userStore.userInfo?.username?.charAt(0)?.toUpperCase() }}
            </el-avatar>
            <span class="username">{{ userStore.userInfo?.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/profile')">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="layout-aside">
        <el-menu
          :default-active="$route.path"
          router
          class="side-menu"
        >
          <el-menu-item index="/products">
            <el-icon><Monitor /></el-icon>
            <span>监控列表</span>
          </el-menu-item>
          <el-menu-item index="/products/add">
            <el-icon><Plus /></el-icon>
            <span>添加商品</span>
          </el-menu-item>
          <el-menu-item index="/alerts">
            <el-icon><Bell /></el-icon>
            <span>提醒设置</span>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
    
    <el-drawer v-model="showAlerts" title="提醒消息" size="400px">
      <AlertList @close="showAlerts = false" @update-count="unreadCount = $event" />
    </el-drawer>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { alertApi } from '@/api'
import AlertList from '@/components/AlertList.vue'

const router = useRouter()
const userStore = useUserStore()
const showAlerts = ref(false)
const unreadCount = ref(0)

onMounted(() => {
  fetchUnreadCount()
})

const fetchUnreadCount = async () => {
  try {
    const res = await alertApi.getUnreadCount()
    unreadCount.value = res.data?.count || 0
  } catch (e) {
    console.error(e)
  }
}

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

<style scoped lang="scss">
.layout-header {
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: bold;
    color: #409eff;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .user-dropdown {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    
    .username {
      font-size: 14px;
      color: #606266;
    }
  }
}

.side-menu {
  border-right: none;
  
  .el-menu-item {
    height: 50px;
    line-height: 50px;
    
    &.is-active {
      background: #ecf5ff;
      color: #409eff;
    }
  }
}

.badge-icon {
  :deep(.el-badge__content) {
    border: none;
  }
}
</style>
