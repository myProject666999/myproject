<template>
  <el-container class="app-container">
    <el-header>
      <div class="header-inner">
        <div class="brand" @click="$router.push('/')">
          <el-icon><Collection /></el-icon>
          <span>在线书签收藏</span>
        </div>
        <el-menu mode="horizontal" :router="true" :default-active="activeMenu" class="header-menu">
          <el-menu-item index="/">书签</el-menu-item>
          <el-menu-item index="/add">添加</el-menu-item>
          <el-menu-item index="/folders">文件夹</el-menu-item>
          <el-menu-item index="/search">搜索</el-menu-item>
          <el-menu-item index="/settings">设置</el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.app-container { min-height: 100vh; }
.el-header { background: #fff; border-bottom: 1px solid #eee; padding: 0; }
.header-inner { display: flex; align-items: center; padding: 0 24px; height: 60px; }
.brand { display: flex; align-items: center; font-size: 18px; font-weight: 600; cursor: pointer; margin-right: 24px; gap: 6px; color: #409eff; }
.header-menu { flex: 1; border-bottom: none; }
.el-main { background: #f5f7fa; padding: 24px; }
</style>
