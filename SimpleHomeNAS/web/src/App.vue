<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="logo">📁 SimpleHomeNAS</div>
      <nav>
        <router-link to="/" class="nav-item">
          <span>📂</span> 文件管理
        </router-link>
        <router-link to="/shares" class="nav-item">
          <span>🔗</span> 共享链接
        </router-link>
        <router-link to="/status" class="nav-item">
          <span>📊</span> 系统状态
        </router-link>
      </nav>
      <div class="sidebar-foot">
        <small>v1.0 · Raspberry Pi NAS</small>
      </div>
    </aside>
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100%;
}
.sidebar {
  width: 220px;
  background: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
}
.logo {
  padding: 8px 20px 24px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #34495e;
  margin-bottom: 12px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: #bdc3c7;
  transition: all .2s;
}
.nav-item:hover {
  background: #34495e;
  color: #fff;
}
.nav-item.router-link-active {
  background: #3498db;
  color: #fff;
}
.sidebar-foot {
  margin-top: auto;
  padding: 16px 20px 4px;
  color: #7f8c8d;
}
.main {
  flex: 1;
  overflow: auto;
  padding: 24px 32px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
