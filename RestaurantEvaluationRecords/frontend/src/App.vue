<template>
  <el-container style="height: 100vh">
    <el-header style="background: #fff; border-bottom: 1px solid #eee">
      <div style="display: flex; align-items: center; justify-content: space-between">
        <div style="font-size: 20px; font-weight: bold; color: #409eff">
          <el-icon><Food /></el-icon>
          餐厅评价记录
        </div>
        <div v-if="currentUser">
          <span style="margin-right: 20px">欢迎，{{ currentUser.nickname }}</span>
          <el-button type="text" @click="logout">退出登录</el-button>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" style="background: #fff; border-right: 1px solid #eee" v-if="currentUser">
        <el-menu
          :default-active="activeMenu"
          router
          style="border: none"
        >
          <el-menu-item index="/restaurants">
            <el-icon><Shop /></el-icon>
            <span>餐厅列表</span>
          </el-menu-item>
          <el-menu-item index="/friends-reviews">
            <el-icon><UserFilled /></el-icon>
            <span>好友评价</span>
          </el-menu-item>
          <el-menu-item index="/my-reviews">
            <el-icon><Edit /></el-icon>
            <span>我的评价</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="background: #f5f7fa">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const currentUser = ref(null)

const activeMenu = computed(() => route.path)

onMounted(() => {
  const user = localStorage.getItem('currentUser')
  if (user) {
    currentUser.value = JSON.parse(user)
  } else if (route.path !== '/login') {
    router.push('/login')
  }
})

const logout = () => {
  localStorage.removeItem('currentUser')
  currentUser.value = null
  router.push('/login')
  ElMessage.success('已退出登录')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}
</style>
