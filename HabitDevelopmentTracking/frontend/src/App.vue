<template>
  <div class="app-container">
    <el-container>
      <el-aside width="220px" class="sidebar">
        <div class="logo">
          <h2>🎯 习惯追踪</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/today">
            <el-icon><Calendar /></el-icon>
            <span>今日打卡</span>
          </el-menu-item>
          <el-menu-item index="/habits">
            <el-icon><List /></el-icon>
            <span>习惯列表</span>
          </el-menu-item>
          <el-menu-item index="/heatmap">
            <el-icon><DataAnalysis /></el-icon>
            <span>热力图</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeMenu = ref(route.path)

onMounted(() => {
  activeMenu.value = route.path
})

const handleMenuSelect = (index) => {
  router.push(index)
  activeMenu.value = index
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
}

.logo {
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.logo h2 {
  color: white;
  font-size: 20px;
  margin: 0;
}

.menu {
  background: transparent;
  border-right: none;
  margin-top: 20px;
}

.menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8);
}

.menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.main-content {
  margin-left: 220px;
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
</style>
