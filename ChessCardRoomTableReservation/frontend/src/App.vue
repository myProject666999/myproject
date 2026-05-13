<template>
  <el-container style="height: 100vh">
    <el-header style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px">
      <div style="display: flex; align-items: center; gap: 15px">
        <el-icon :size="28"><Coffee /></el-icon>
        <h2 style="margin: 0; font-size: 22px; font-weight: 600">棋牌室棋桌预订与计费系统</h2>
      </div>
      <div style="font-size: 14px">
        {{ currentTime }}
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" style="background-color: #304156; padding-top: 20px">
        <el-menu
          router
          style="border-right: none"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :default-active="activeMenu"
        >
          <el-menu-item index="/">
            <el-icon><Monitor /></el-icon>
            <span>桌台总览</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><Tickets /></el-icon>
            <span>当前订单</span>
          </el-menu-item>
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/members">
            <el-icon><User /></el-icon>
            <span>会员管理</span>
          </el-menu-item>
          <el-menu-item index="/report">
            <el-icon><DataAnalysis /></el-icon>
            <span>营业报表</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="background-color: #f0f2f5; padding: 20px; overflow: auto">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" @refresh="loadTables" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTime = ref('')
const activeMenu = ref('/')

let timer = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  activeMenu.value = route.path
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style>
* { margin: 0; padding: 0; }
body { font-family: 'Microsoft YaHei', sans-serif; }
.el-container { height: 100vh; }
</style>
