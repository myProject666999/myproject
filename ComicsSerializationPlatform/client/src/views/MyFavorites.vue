<template>
  <div>
    <AppHeader />
    <div class="app-container">
      <div class="page-header">
        <h1 class="page-title">我的收藏</h1>
      </div>

      <div v-loading="loading" class="comics-grid">
        <ComicCard
          v-for="item in favorites"
          :key="item.id"
          :comic="item"
        />
      </div>
      <div v-if="favorites.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无收藏">
          <el-button type="primary" @click="$router.push('/')">发现漫画</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { favoriteApi } from '@/api'
import AppHeader from '@/components/AppHeader.vue'
import ComicCard from '@/components/ComicCard.vue'

const favorites = ref([])
const loading = ref(false)

onMounted(() => {
  fetchFavorites()
})

async function fetchFavorites() {
  loading.value = true
  try {
    const res = await favoriteApi.getList()
    favorites.value = (res.favorites || []).map(item => ({
      ...item,
      id: item.comic_id
    }))
  } catch (error) {
    console.error('获取收藏列表失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.comics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}
</style>
