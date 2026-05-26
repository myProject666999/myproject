<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1 class="title">
          <el-icon><Link /></el-icon>
          Webhook 接收服务
        </h1>
        <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect" class="header-menu">
          <el-menu-item index="endpoints">
            <el-icon><Connection /></el-icon>
            <span>Endpoint 列表</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = ref('endpoints')

const handleMenuSelect = (index) => {
  if (index === 'endpoints') {
    router.push('/')
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  height: auto;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.title {
  color: white;
  margin: 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-menu {
  background: transparent;
  border: none;
}

.header-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.8);
}

.header-menu .el-menu-item:hover,
.header-menu .el-menu-item.is-active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.app-main {
  background: #f5f7fa;
  padding: 24px;
}
</style>
