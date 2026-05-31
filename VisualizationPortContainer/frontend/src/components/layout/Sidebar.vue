<template>
  <div class="sidebar">
    <div class="logo">
      <el-icon :size="32" color="#409eff">
        <Odometer />
      </el-icon>
      <span class="logo-text">集装箱堆场</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      router
      background-color="transparent"
      text-color="#a8b2c1"
      active-text-color="#409eff"
    >
      <el-menu-item index="/dashboard">
        <el-icon><DataAnalysis /></el-icon>
        <span>可视化大屏</span>
      </el-menu-item>
      <el-menu-item index="/container/inbound">
        <el-icon><Upload /></el-icon>
        <span>进场登记</span>
      </el-menu-item>
      <el-menu-item index="/container/outbound">
        <el-icon><Download /></el-icon>
        <span>出场登记</span>
      </el-menu-item>
      <el-menu-item index="/container/list">
        <el-icon><List /></el-icon>
        <span>集装箱列表</span>
      </el-menu-item>
      <el-menu-item index="/allocation">
        <el-icon><Location /></el-icon>
        <span>堆位分配</span>
      </el-menu-item>
      <el-menu-item index="/task">
        <el-icon><Tickets /></el-icon>
        <span>任务调度</span>
      </el-menu-item>
      <el-menu-item index="/statistics">
        <el-icon><TrendCharts /></el-icon>
        <span>统计分析</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Odometer,
  DataAnalysis,
  Upload,
  Download,
  List,
  Location,
  Tickets,
  TrendCharts
} from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100%;
  background: rgba(10, 14, 26, 0.95);
  border-right: 1px solid rgba(64, 158, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #409eff;
}

.el-menu {
  flex: 1;
  padding: 10px 0;
}
</style>
