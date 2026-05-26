<template>
  <div class="merchant-layout">
    <div class="merchant-sidebar">
      <div style="padding: 20px; text-align: center; border-bottom: 1px solid #1f3a5c;">
        <div style="font-size: 24px;">🏪</div>
        <div style="color: white; font-weight: bold; margin-top: 8px;">鲜时达后台</div>
      </div>
      <div
        v-for="menu in menus"
        :key="menu.path"
        class="merchant-menu-item"
        :class="{ active: activeMenu === menu.path }"
        @click="goTo(menu.path)"
      >
        {{ menu.icon }} {{ menu.label }}
      </div>
      <div style="position: absolute; bottom: 20px; left: 0; right: 0; padding: 0 24px;">
        <div
          class="merchant-menu-item"
          @click="goHome"
        >
          ← 返回前台
        </div>
      </div>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column;">
      <div class="merchant-header">
        <span class="merchant-title">{{ currentTitle }}</span>
        <span style="color: #666;">{{ userStore.userInfo?.username }}</span>
      </div>
      <div class="merchant-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const menus = [
  { path: '/merchant/products', label: '商品管理', icon: '🥬' },
  { path: '/merchant/orders', label: '订单管理', icon: '📦' },
  { path: '/merchant/inventory', label: '库存管理', icon: '📊' },
  { path: '/merchant/slots', label: '配送时段', icon: '🕐' },
]

const activeMenu = computed(() => {
  return route.path
})

const currentTitle = computed(() => {
  const menu = menus.find(m => route.path.startsWith(m.path))
  return menu?.label || '商家后台'
})

function goTo(path) {
  if (route.path !== path) {
    router.push(path)
  }
}

function goHome() {
  router.push('/')
}
</script>
