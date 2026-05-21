<template>
  <nav class="navbar">
    <router-link to="/" class="nav-item" exact-active-class="active">
      <span class="nav-icon">📝</span>
      <span class="nav-text">录入</span>
    </router-link>
    <router-link to="/stats" class="nav-item" active-class="active">
      <span class="nav-icon">📊</span>
      <span class="nav-text">统计</span>
    </router-link>
    <router-link to="/goal" class="nav-item" active-class="active">
      <span class="nav-icon">🎯</span>
      <span class="nav-text">目标</span>
    </router-link>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-size: 13px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-weight: 600;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
}
</style>
