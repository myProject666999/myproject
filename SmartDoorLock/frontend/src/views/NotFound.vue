<template>
  <div class="not-found">
    <div class="content">
      <div class="code">404</div>
      <div class="title">页面不存在</div>
      <div class="desc">抱歉，您访问的页面不存在或已被删除</div>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: #fff;
}

.code {
  font-size: 120px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 32px;
  font-weight: 600;
  margin-top: 20px;
}

.desc {
  font-size: 16px;
  opacity: 0.8;
  margin-top: 12px;
  margin-bottom: 32px;
}
</style>
