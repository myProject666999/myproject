<template>
  <div class="app-layout">
    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo">⚡</span>
        <span class="brand-text">网站速度测试</span>
      </div>
      <div class="nav-links">
        <router-link to="/test" class="nav-link">速度测试</router-link>
        <router-link to="/report" class="nav-link">测试报告</router-link>
        <router-link to="/monitor" class="nav-link">定时监测</router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  font-size: 28px;
}

.brand-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 20px;
  border-radius: 8px;
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #667eea;
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.main-content {
  flex: 1;
  padding: 30px 40px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}
</style>
