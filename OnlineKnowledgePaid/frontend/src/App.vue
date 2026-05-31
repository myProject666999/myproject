<template>
  <div id="app">
    <Header />
    <div class="container">
      <router-view />
    </div>
    <el-backtop :bottom="30" />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
</script>

<style scoped>
#app {
  padding-bottom: 40px;
}
</style>
