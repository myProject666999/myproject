<template>
  <el-card class="comic-card card-hover" shadow="hover" @click="handleClick">
    <div class="card-cover">
      <img :src="comic.cover" :alt="comic.title" loading="lazy" />
      <div class="card-status" v-if="comic.status">
        <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
      </div>
    </div>
    <div class="card-info">
      <h3 class="card-title ellipsis-1">{{ comic.title }}</h3>
      <p class="card-author">{{ comic.author_name }}</p>
      <div class="card-meta">
        <span class="meta-item">
          <el-icon><View /></el-icon>
          {{ formatNumber(comic.views) }}
        </span>
        <span class="meta-item">
          <el-icon><Star /></el-icon>
          {{ formatNumber(comic.likes) }}
        </span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  comic: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const statusType = computed(() => {
  const map = {
    ongoing: 'success',
    completed: 'info',
    hiatus: 'warning'
  }
  return map[props.comic.status] || 'info'
})

const statusText = computed(() => {
  const map = {
    ongoing: '连载中',
    completed: '已完结',
    hiatus: '暂停更新'
  }
  return map[props.comic.status] || '未知'
})

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num || 0
}

function handleClick() {
  router.push(`/comic/${props.comic.id}`)
}
</script>

<style scoped>
.comic-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 133%;
  overflow: hidden;
}

.card-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-status {
  position: absolute;
  top: 8px;
  left: 8px;
}

.card-info {
  padding: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.card-author {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.card-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
