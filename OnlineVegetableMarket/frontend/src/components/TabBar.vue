<template>
  <div class="tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: activePath === tab.path }"
      @click="goTo(tab.path)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { path: '/', label: '首页', icon: '🏪' },
  { path: '/cart', label: '购物车', icon: '🛒' },
  { path: '/orders', label: '订单', icon: '📦' },
  { path: '/profile', label: '我的', icon: '👤' },
]

const activePath = computed(() => {
  const path = route.path
  for (const tab of tabs) {
    if (path === tab.path || (tab.path !== '/' && path.startsWith(tab.path))) {
      return tab.path
    }
  }
  return ''
})

function goTo(path) {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>
