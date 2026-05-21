<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">🍎 营养计算器</h1>
      <p class="app-subtitle">科学饮食，健康生活</p>
    </header>
    <NavBar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  text-align: center;
  padding: 24px 20px 8px;
  color: white;
}

.app-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.app-subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.app-main {
  padding: 16px;
  max-width: 960px;
  margin: 0 auto;
}
</style>
