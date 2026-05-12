<template>
  <el-container style="height: 100vh; border: 1px solid #eee">
    <el-aside width="220px" style="background-color: rgb(238, 241, 246)">
      <el-menu
        :default-active="activeMenu"
        router
        background-color="rgb(238, 241, 246)"
        text-color="#545c64"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/pets">
          <el-icon><Dog /></el-icon>
          <span>宠物档案</span>
        </el-menu-item>
        <el-menu-item index="/services">
          <el-icon><Service /></el-icon>
          <span>服务套餐</span>
        </el-menu-item>
        <el-menu-item index="/appointments">
          <el-icon><Calendar /></el-icon>
          <span>预约管理</span>
        </el-menu-item>
        <el-menu-item index="/vehicles">
          <el-icon><Van /></el-icon>
          <span>车辆调度</span>
        </el-menu-item>
        <el-menu-item index="/consumptions">
          <el-icon><Wallet /></el-icon>
          <span>消费记录</span>
        </el-menu-item>
        <el-menu-item index="/reminders">
          <el-icon><Bell /></el-icon>
          <span>客户提醒</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <el-dropdown>
          <span class="el-dropdown-link">
            宠物店管理系统
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
        </el-dropdown>
      </el-header>
      <el-main>
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
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
</style>
