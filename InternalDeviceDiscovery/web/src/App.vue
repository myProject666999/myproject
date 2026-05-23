<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => {
  if (route.path === '/scan') return '网络扫描'
  if (route.path === '/devices') return '设备列表'
  return '内网设备发现'
})
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo">
        <el-icon :size="28" color="#22d3ee"><Monitor /></el-icon>
        <span>设备发现</span>
      </div>
      <nav class="nav">
        <router-link to="/scan" class="nav-item">
          <el-icon><Connection /></el-icon>
          <span>扫描</span>
        </router-link>
        <router-link to="/devices" class="nav-item">
          <el-icon><List /></el-icon>
          <span>设备列表</span>
        </router-link>
      </nav>
    </aside>
    <main class="content">
      <header class="topbar">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="status">
          <span class="status-dot online"></span>
          <span>系统就绪</span>
        </div>
      </header>
      <div class="page">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.sidebar {
  width: 220px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
}

.nav {
  flex: 1;
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.2s;
  text-decoration: none;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.router-link-active {
  background: var(--bg-tertiary);
  color: var(--accent);
  border-left: 3px solid var(--accent);
  padding-left: 17px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 56px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.status-dot.online {
  background: var(--success);
  box-shadow: 0 0 6px var(--success);
}

.page {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
