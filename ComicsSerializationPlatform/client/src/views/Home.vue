<template>
  <div>
    <AppHeader />
    <div class="app-container">
      <div class="hero-section">
        <div class="hero-content">
          <h1>发现精彩漫画</h1>
          <p>海量优质漫画，随时随地畅快阅读</p>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-row">
          <span class="filter-label">分类:</span>
          <div class="filter-tags">
            <el-tag
              v-for="cat in categories"
              :key="cat.value"
              :type="activeCategory === cat.value ? 'primary' : 'info'"
              :effect="activeCategory === cat.value ? 'dark' : 'plain'"
              class="filter-tag"
              @click="handleCategoryChange(cat.value)"
            >
              {{ cat.label }}
            </el-tag>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-label">排序:</span>
          <el-radio-group v-model="sortBy" size="default" @change="fetchComics">
            <el-radio-button value="latest">最新</el-radio-button>
            <el-radio-button value="popular">热门</el-radio-button>
            <el-radio-button value="likes">收藏</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div v-loading="loading" class="comics-grid">
        <ComicCard
          v-for="comic in comics"
          :key="comic.id"
          :comic="comic"
        />
      </div>

      <div v-if="comics.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无漫画" />
      </div>

      <div v-if="pagination.totalPages > 1" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pagination.limit"
          :total="pagination.total"
          layout="prev, pager, next"
          @current-change="fetchComics"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { comicApi } from '@/api'
import AppHeader from '@/components/AppHeader.vue'
import ComicCard from '@/components/ComicCard.vue'

const route = useRoute()

const categories = [
  { label: '全部', value: '' },
  { label: '热血', value: '热血' },
  { label: '日常', value: '日常' },
  { label: '校园', value: '校园' },
  { label: '奇幻', value: '奇幻' },
  { label: '悬疑', value: '悬疑' },
  { label: '科幻', value: '科幻' },
  { label: '恋爱', value: '恋爱' }
]

const comics = ref([])
const loading = ref(false)
const currentPage = ref(1)
const activeCategory = ref('')
const sortBy = ref('latest')
const keyword = ref(route.query.keyword || '')

const pagination = ref({
  total: 0,
  limit: 12,
  totalPages: 0
})

watch(() => route.query.keyword, (newKeyword) => {
  keyword.value = newKeyword || ''
  currentPage.value = 1
  fetchComics()
})

onMounted(() => {
  fetchComics()
})

function handleCategoryChange(category) {
  activeCategory.value = category
  currentPage.value = 1
  fetchComics()
}

async function fetchComics() {
  loading.value = true
  try {
    const res = await comicApi.getList({
      page: currentPage.value,
      limit: pagination.value.limit,
      category: activeCategory.value || undefined,
      keyword: keyword.value || undefined,
      sort: sortBy.value
    })
    comics.value = res.comics || []
    pagination.value = res.pagination || { total: 0, limit: 12, totalPages: 0 }
  } catch (error) {
    console.error('获取漫画列表失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 48px 32px;
  margin-bottom: 32px;
  color: white;
}

.hero-content h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
}

.hero-content p {
  font-size: 18px;
  opacity: 0.9;
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-row + .filter-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 40px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  cursor: pointer;
}

.comics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
