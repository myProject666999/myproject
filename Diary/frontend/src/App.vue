<template>
  <div class="app-container">
    <div class="main-card">
      <el-container>
        <el-header style="padding: 0;">
          <div class="header-inner">
            <div class="logo">
              <el-icon :size="28" style="margin-right: 12px; color: #667eea;"><Edit /></el-icon>
              <span class="title">日记本</span>
              <span class="subtitle">情绪追踪</span>
            </div>
            <el-menu
              :default-active="activeMenu"
              mode="horizontal"
              @select="handleMenuSelect"
              class="nav-menu"
            >
              <el-menu-item index="/today">
                <el-icon><EditPen /></el-icon>
                <span>今日日记</span>
              </el-menu-item>
              <el-menu-item index="/list">
                <el-icon><List /></el-icon>
                <span>日记列表</span>
              </el-menu-item>
              <el-menu-item index="/trend">
                <el-icon><TrendCharts /></el-icon>
                <span>情绪趋势</span>
              </el-menu-item>
            </el-menu>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeMenu = ref(route.path)

watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
})

const handleMenuSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 60px;
  border-bottom: 1px solid #e4e7ed;
}

.logo {
  display: flex;
  align-items: center;
}

.logo .title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-right: 8px;
}

.logo .subtitle {
  font-size: 14px;
  color: #909399;
}

.nav-menu {
  border-bottom: none;
}

:deep(.el-menu--horizontal) {
  border-bottom: none !important;
}
</style>
