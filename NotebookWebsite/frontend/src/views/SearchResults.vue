<template>
  <div class="content-area">
    <h2 style="margin-bottom: 20px;">🔍 搜索结果: "{{ keyword }}"</h2>
    <div v-if="results.length === 0" class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <h3>未找到相关内容</h3>
      <p>试试其他关键词吧</p>
    </div>
    <div v-else>
      <p style="margin-bottom: 16px; color: #666;">找到 {{ results.length }} 条结果</p>
      <div 
        v-for="page in results" 
        :key="page.id"
        class="search-result-item"
        @click="$router.push(`/page/${page.id}`)"
      >
        <h3>{{ page.title }}</h3>
        <p>{{ getPreview(page.content) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { pageApi } from '../api'

const route = useRoute()
const keyword = ref('')
const results = ref([])

const getPreview = (content) => {
  if (!content) return ''
  const text = content.replace(/[#*`]/g, '').substring(0, 150)
  return text + (text.length > 150 ? '...' : '')
}

const doSearch = async () => {
  const q = route.query.q || ''
  keyword.value = q
  if (q) {
    try {
      const res = await pageApi.search(q)
      results.value = res.data
    } catch (e) {
      console.error('Search failed:', e)
      results.value = []
    }
  }
}

watch(() => route.query.q, () => {
  doSearch()
})

onMounted(() => {
  doSearch()
})
</script>
