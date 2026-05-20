<template>
  <div class="min-h-screen">
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center">
              <Wallet class="w-6 h-6 text-white" />
            </div>
            <h1 class="text-xl font-bold text-gray-800">旅行费用分摊</h1>
          </div>
          <nav class="flex space-x-1">
            <div 
              :class="['nav-item', { active: route.path === '/bills' }]"
              @click="router.push('/bills')"
            >
              <span class="flex items-center space-x-2">
                <Document class="w-4 h-4" />
                <span>账单管理</span>
              </span>
            </div>
            <div 
              :class="['nav-item', { active: route.path === '/settlement' }]"
              @click="router.push('/settlement')"
            >
              <span class="flex items-center space-x-2">
                <Money class="w-4 h-4" />
                <span>一键结算</span>
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Wallet, Document, Money } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
