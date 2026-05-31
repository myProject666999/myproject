<template>
  <el-container class="layout-container">
    <el-header>
      <div class="header-content">
        <h1 class="logo">
          <el-icon><Goods /></el-icon>
          在线借还物品系统
        </h1>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="nav-menu"
        >
          <el-menu-item index="/">
            <el-icon><List /></el-icon>
            <span>物品列表</span>
          </el-menu-item>
          <el-menu-item index="/borrow">
            <el-icon><Connection /></el-icon>
            <span>借还操作</span>
          </el-menu-item>
          <el-menu-item index="/records">
            <el-icon><Document /></el-icon>
            <span>借用记录</span>
          </el-menu-item>
          <el-menu-item index="/reservation">
            <el-icon><Clock /></el-icon>
            <span>预约排队</span>
          </el-menu-item>
          <el-menu-item index="/admin">
            <el-icon><Setting /></el-icon>
            <span>后台管理</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
    <el-footer>
      <p class="footer-text">© 2026 在线借还物品系统 - 共享工具管理平台</p>
    </el-footer>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  margin: 0 40px 0 0;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.footer-text {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 0;
}

.el-header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  padding: 0;
}

.el-main {
  background: #f5f7fa;
  padding: 20px;
}

.el-footer {
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 20px 0;
}
</style>
