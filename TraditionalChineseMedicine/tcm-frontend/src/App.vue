<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="logo">
        <el-icon><MedicineBox /></el-icon>
        <span>中医诊所辨证开方系统</span>
      </div>
    </el-header>
    <el-container>
      <el-aside width="220px" class="app-aside">
        <el-menu
          :default-active="activeMenu"
          router
          class="side-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/patients">
            <el-icon><User /></el-icon>
            <span>患者管理</span>
          </el-menu-item>
          <el-menu-item index="/diagnosis">
            <el-icon><EditPen /></el-icon>
            <span>四诊录入</span>
          </el-menu-item>
          <el-menu-item index="/prescription">
            <el-icon><Document /></el-icon>
            <span>开方管理</span>
          </el-menu-item>
          <el-menu-item index="/herbs">
            <el-icon><ShoppingBag /></el-icon>
            <span>药材管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><Box /></el-icon>
            <span>库存管理</span>
          </el-menu-item>
          <el-menu-item index="/templates">
            <el-icon><Collection /></el-icon>
            <span>方剂模板</span>
          </el-menu-item>
          <el-menu-item index="/decoction">
            <el-icon><HotWater /></el-icon>
            <span>代煎工单</span>
          </el-menu-item>
          <el-menu-item index="/followup">
            <el-icon><View /></el-icon>
            <span>复诊追踪</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.app-container {
  height: 100%;
}
.app-header {
  background: linear-gradient(90deg, #2b5876 0%, #4e4376 100%);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  gap: 10px;
}
.app-aside {
  background: #304156;
}
.side-menu {
  border-right: none;
}
.app-main {
  background: #f0f2f5;
  padding: 20px;
}
</style>
