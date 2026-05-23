<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-title">🖥️ 监控中心</div>
      <nav class="sidebar-nav">
        <router-link to="/" class="sidebar-link" exact-active-class="active">
          <span>📊</span> 监控大屏
        </router-link>
        <router-link to="/nodes" class="sidebar-link" active-class="active">
          <span>🖥️</span> 节点管理
        </router-link>
        <router-link to="/alerts" class="sidebar-link" active-class="active">
          <span>🔔</span> 告警中心
        </router-link>
      </nav>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>
