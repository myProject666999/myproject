<template>
  <div class="redirect-container">
    <el-card class="redirect-card" shadow="hover">
      <div class="redirect-content">
        <el-icon class="loading-icon" :size="48">
          <Loading />
        </el-icon>
        <div class="redirect-title">正在跳转...</div>
        <div class="redirect-subtitle">短码：{{ code }}</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const code = ref(route.params.code || '')

onMounted(() => {
  setTimeout(() => {
    window.location.href = `/${code.value}`
  }, 1000)
})
</script>

<style scoped>
.redirect-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 40px 20px;
}
.redirect-card {
  width: 100%;
  max-width: 360px;
  text-align: center;
}
.redirect-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}
.loading-icon {
  color: #409EFF;
  animation: spin 1s linear infinite;
}
.redirect-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.redirect-subtitle {
  font-size: 14px;
  color: #909399;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
