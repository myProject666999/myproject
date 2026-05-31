<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

interface Props {
  text?: string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '加载中...',
  fullscreen: false
})

const appStore = useAppStore()
const { loading } = storeToRefs(appStore)
</script>

<template>
  <Transition name="loading-fade">
    <div v-if="loading || !fullscreen" class="loading-wrapper" :class="{ fullscreen }">
      <div class="loading-content">
        <div class="loading-spinner">
          <Loader2 :size="40" class="spinner-icon" />
        </div>
        <p class="loading-text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.loading-wrapper.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  color: #165DFF;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #667085;
  margin: 0;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
