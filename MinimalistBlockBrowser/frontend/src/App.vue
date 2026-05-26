<template>
  <div id="app">
    <header class="header">
      <div class="container header-inner">
        <router-link to="/" class="logo">
          <span class="logo-icon">B</span>
          <span>极简区块浏览器</span>
        </router-link>
        <nav class="nav">
          <router-link to="/" class="nav-link" exact-active-class="active">首页</router-link>
          <router-link to="/gas" class="nav-link" active-class="active">Gas 追踪</router-link>
        </nav>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
    <footer class="footer">
      <div class="container">
        <p>极简区块浏览器 &copy; {{ currentYear }} | Powered by Ethereum JSON-RPC</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.main {
  flex: 1;
}
</style>