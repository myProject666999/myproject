<template>
  <div class="lazy-image-wrapper">
    <img
      ref="imgRef"
      :src="visible ? src : ''"
      :alt="alt"
      :class="['lazy-image', { loaded: isLoaded }]"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-if="!visible || (!isLoaded && !hasError)" class="image-placeholder" ref="placeholderRef">
      <el-icon class="loading-icon" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>
    <div v-if="visible && hasError" class="image-error">
      <el-icon :size="48"><Picture /></el-icon>
      <p>图片加载失败</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  rootMargin: {
    type: String,
    default: '100px'
  }
})

const visible = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)
const placeholderRef = ref(null)
const imgRef = ref(null)

let observer = null

onMounted(() => {
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.value = true
            observer.disconnect()
          }
        })
      },
      { rootMargin: props.rootMargin }
    )
    
    if (placeholderRef.value) {
      observer.observe(placeholderRef.value)
    }
  } else {
    visible.value = true
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

function handleLoad() {
  isLoaded.value = true
}

function handleError() {
  hasError.value = true
}
</script>

<style scoped>
.lazy-image-wrapper {
  width: 100%;
  position: relative;
}

.lazy-image {
  width: 100%;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image.loaded {
  opacity: 1;
}

.image-placeholder,
.image-error {
  width: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 14px;
  gap: 8px;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
