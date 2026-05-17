<template>
  <div class="app-container">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <el-icon :size="24" color="#409EFF"><Calendar /></el-icon>
            <span class="title">收支日历可视化</span>
          </div>
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            router
            class="menu"
          >
            <el-menu-item index="/">
              <el-icon><Calendar /></el-icon>
              <span>日历主页</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 64px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.menu {
  border-bottom: none;
}

.main {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
</style>
