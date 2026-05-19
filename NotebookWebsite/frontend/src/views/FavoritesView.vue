<template>
  <div class="content-area">
    <h2 style="margin-bottom: 20px;">⭐ 收藏夹</h2>
    <div v-if="pages.length === 0" class="empty-state">
      <div class="empty-state-icon">⭐</div>
      <h3>暂无收藏</h3>
      <p>打开笔记，点击"收藏"按钮添加到收藏夹</p>
    </div>
    <div v-else>
      <div 
        v-for="page in pages" 
        :key="page.id"
        class="search-result-item"
        @click="$router.push(`/page/${page.id}`)"
      >
        <h3>{{ page.title }}</h3>
        <p>{{ getPreview(page.content) }}</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          更新时间: {{ formatDate(page.updatedAt) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pageApi } from '../api'

const pages = ref([])

const getPreview = (content) => {
  if (!content) return ''
  const text = content.replace(/[#*`]/g, '').substring(0, 150)
  return text + (text.length > 150 ? '...' : '')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(async () => {
  try {
    const res = await pageApi.getFavorites()
    pages.value = res.data
  } catch (e) {
    console.error('Failed to load favorites:', e)
  }
})
</script>
