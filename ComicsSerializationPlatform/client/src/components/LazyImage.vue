<template>
  <div class="lazy-image-wrapper">
    <img
      :src="src"
      :alt="alt"
      class="lazy-image"
      loading="lazy"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-if="!isLoaded && !hasError" class="image-placeholder">
      <el-icon class="loading-icon" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>
    <div v-if="hasError" class="image-error">
      <el-icon :size="48"><Picture /></el-icon>
      <p>图片加载失败</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  }
})

const isLoaded = ref(false)
const hasError = ref(false)

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
