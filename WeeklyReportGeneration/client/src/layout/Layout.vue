<template>
    <el-container class="layout-container">
        <el-aside width="220px" class="aside">
            <div class="logo">
                <el-icon><Document /></el-icon>
                <span>周报生成系统</span>
            </div>
            <el-menu
                :default-active="activeMenu"
                router
                class="menu"
                background-color="#304156"
                text-color="#bfcbd9"
                active-text-color="#409EFF"
            >
                <el-menu-item index="/current-week">
                    <el-icon><Calendar /></el-icon>
                    <span>本周</span>
                </el-menu-item>
                <el-menu-item index="/templates">
                    <el-icon><Document /></el-icon>
                    <span>模板</span>
                </el-menu-item>
                <el-menu-item index="/history">
                    <el-icon><Clock /></el-icon>
                    <span>历史</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-container>
            <el-header class="header">
                <div class="header-left">
                    <span class="page-title">{{ currentPageTitle }}</span>
                </div>
                <div class="header-right">
                    <el-dropdown>
                        <span class="user-info">
                            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
                            <span class="username">admin</span>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>个人中心</el-dropdown-item>
                                <el-dropdown-item divided>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>
            <el-main class="main">
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
const currentPageTitle = computed(() => route.meta.title || '周报生成系统')
</script>

<style scoped>
.layout-container {
    height: 100vh;
}

.aside {
    background-color: #304156;
    display: flex;
    flex-direction: column;
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    gap: 8px;
    border-bottom: 1px solid #1f2d3d;
}

.menu {
    flex: 1;
    border-right: none;
}

.menu :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
}

.menu :deep(.el-menu-item.is-active) {
    background-color: #263445 !important;
}

.header {
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.username {
    color: #606266;
}

.main {
    background-color: #f0f2f5;
    padding: 20px;
}
</style>
