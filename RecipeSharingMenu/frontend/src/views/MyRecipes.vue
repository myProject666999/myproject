<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">我的菜谱</h1>
      <el-button type="primary" :icon="Plus" @click="$router.push('/recipe/create')">
        发布菜谱
      </el-button>
    </div>

    <div v-loading="loading" class="card-grid">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="recipe-card"
        @click="$router.push(`/recipe/${recipe.id}`)"
      >
        <div class="recipe-card-image">
          <el-image
            v-if="recipe.cover_image"
            :src="recipe.cover_image"
            fit="cover"
            style="width: 100%; height: 100%"
          />
          <span v-else>🍳</span>
        </div>
        <div class="recipe-card-body">
          <h3 class="recipe-card-title">{{ recipe.title }}</h3>
          <div class="recipe-card-meta">
            <span>{{ recipe.category }}</span>
            <span>{{ recipe.flavor }}</span>
            <span>{{ recipe.difficulty }}</span>
          </div>
          <div class="recipe-card-stats">
            <span class="stat-item">
              <el-icon><Star /></el-icon>
              {{ recipe.likes_count }}
            </span>
            <span class="stat-item">
              <el-icon><Collection /></el-icon>
              {{ recipe.favorites_count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && recipes.length === 0" class="empty-state">
      <div class="empty-state-icon">📝</div>
      <p>还没有发布菜谱</p>
      <el-button type="primary" style="margin-top: 16px" @click="$router.push('/recipe/create')">
        去发布
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { recipeAPI } from '../api'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const recipes = ref([])

const fetchRecipes = async () => {
  loading.value = true
  try {
    const res = await recipeAPI.getMyRecipes({ pageSize: 50 })
    recipes.value = res.data.list
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecipes()
})
</script>
