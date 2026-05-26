<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
    <div class="flex justify-around items-center h-16 max-w-lg mx-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center w-full h-full"
        :class="{ 'text-primary-500': isActive(item.path) }"
      >
        <span class="text-xl">{{ item.icon }}</span>
        <span class="text-xs mt-1">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/today', icon: '📋', label: '今日' },
  { path: '/calendar', icon: '📅', label: '日历' },
  { path: '/stats', icon: '📊', label: '数据' }
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.router-link-active {
  color: #22c55e;
}
</style>
