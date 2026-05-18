<template>
    <el-container class="app-container">
        <el-header class="header">
            <h1 class="title">GTD待办事项</h1>
        </el-header>
        <el-container>
            <el-aside width="200px" class="aside">
                <el-menu
                    :default-active="activeMenu"
                    router
                    class="menu"
                >
                    <el-menu-item index="/inbox">
                        <el-icon><Inbox /></el-icon>
                        <span>收件箱</span>
                    </el-menu-item>
                    <el-menu-item index="/today">
                        <el-icon><Calendar /></el-icon>
                        <span>今日</span>
                    </el-menu-item>
                    <el-menu-item index="/projects">
                        <el-icon><Folder /></el-icon>
                        <span>项目</span>
                    </el-menu-item>
                    <el-menu-item index="/review">
                        <el-icon><Document /></el-icon>
                        <span>回顾</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>
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
</script>

<style>
html, body, #app {
    margin: 0;
    padding: 0;
    height: 100%;
}
.app-container {
    height: 100vh;
}
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    padding: 0 30px;
}
.title {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
}
.aside {
    background-color: #f5f5f5;
    border-right: 1px solid #e0e0e0;
}
.menu {
    border-right: none;
}
.main {
    background-color: #fafafa;
    padding: 20px;
}
</style>
