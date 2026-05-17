<template>
    <el-container class="layout-container">
        <el-aside width="220px" class="sidebar">
            <div class="logo">
                <el-icon :size="32" color="#409eff"><Wallet /></el-icon>
                <span class="logo-text">订阅管理</span>
            </div>
            <el-menu
                :default-active="activeMenu"
                class="sidebar-menu"
                background-color="#304156"
                text-color="#bfcbd9"
                active-text-color="#409eff"
                router
            >
                <el-menu-item index="/dashboard">
                    <el-icon><Odometer /></el-icon>
                    <span>看板</span>
                </el-menu-item>
                <el-menu-item index="/subscriptions">
                    <el-icon><List /></el-icon>
                    <span>订阅列表</span>
                </el-menu-item>
                <el-menu-item index="/subscriptions/add">
                    <el-icon><Plus /></el-icon>
                    <span>添加订阅</span>
                </el-menu-item>
                <el-menu-item index="/reminders">
                    <el-icon><Bell /></el-icon>
                    <span>提醒中心</span>
                </el-menu-item>
                <el-menu-item index="/statistics">
                    <el-icon><DataAnalysis /></el-icon>
                    <span>统计分析</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-container>
            <el-header class="header">
                <div class="header-title">{{ pageTitle }}</div>
            </el-header>
            <el-main class="main-content">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
    const titles = {
        '/dashboard': '即将到期看板',
        '/subscriptions': '订阅列表',
        '/subscriptions/add': '添加订阅',
        '/reminders': '提醒中心',
        '/statistics': '统计分析'
    }
    if (route.path.startsWith('/subscriptions/edit/')) {
        return '编辑订阅'
    }
    return titles[route.path] || '订阅服务管理系统'
})
</script>

<style scoped>
.layout-container {
    height: 100vh;
}

.sidebar {
    background-color: #304156;
    overflow: hidden;
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background-color: #2b2f3a;
}

.logo-text {
    color: #fff;
    font-size: 18px;
    font-weight: bold;
}

.sidebar-menu {
    border-right: none;
}

.header {
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    padding: 0 20px;
}

.header-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
}

.main-content {
    background-color: #f5f7fa;
    padding: 20px;
    overflow-y: auto;
}
</style>
