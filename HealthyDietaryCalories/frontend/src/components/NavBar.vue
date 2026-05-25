<template>
  <nav class="nav-bar">
    <div class="nav-content">
      <router-link to="/today" class="logo">🥗 饮食记录</router-link>
      <div class="nav-links">
        <router-link to="/today" class="nav-link">今日饮食</router-link>
        <router-link to="/foods" class="nav-link">食物库</router-link>
        <router-link to="/stats" class="nav-link">统计</router-link>
        <router-link to="/settings" class="nav-link">设置</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.nav-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

@media (max-width: 640px) {
  .nav-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>
