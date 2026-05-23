<template>
  <div id="app">
    <header class="nav">
      <router-link to="/">网络列表</router-link>
      <router-link to="/scan">扫码</router-link>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>
