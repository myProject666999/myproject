<template>
  <div id="app">
    <router-view v-if="isLoggedIn" />
    <Login v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import Login from './views/Login.vue'

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.token)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #303133;
  background: #f5f7fa;
  min-height: 100vh;
}
</style>
