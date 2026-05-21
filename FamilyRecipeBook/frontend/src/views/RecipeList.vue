<template>
  <div class="recipe-list">
    <div class="page-header">
      <h2>菜谱列表</h2>
      <el-button type="primary" @click="$router.push('/add')">
        <el-icon><Plus /></el-icon>
        录入菜谱
      </el-button>
    </div>

    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="recipe in recipes" :key="recipe.id" style="margin-bottom: 20px;">
        <el-card class="recipe-card" shadow="hover" @click="goToDetail(recipe.id)">
          <div class="card-cover">
            <img v-if="recipe.coverImage" :src="recipe.coverImage" alt="" />
            <div v-else class="no-cover">
              <el-icon :size="48"><Dish /></el-icon>
            </div>
            <div class="favorite-badge" @click.stop="toggleFavorite(recipe)">
              <el-icon :size="20" :color="recipe.isFavorite ? '#ff6b6b' : '#ccc'">
                <StarFilled v-if="recipe.isFavorite" />
                <Star v-else />
              </el-icon>
            </div>
          </div>
          <div class="card-body">
            <h3 class="recipe-name">{{ recipe.name }}</h3>
            <p class="recipe-desc" v-if="recipe.description">{{ recipe.description }}</p>
            <div class="recipe-tags">
              <el-tag v-if="recipe.difficulty" size="small" :type="getDifficultyType(recipe.difficulty)">
                {{ recipe.difficulty }}
              </el-tag>
              <el-tag v-if="recipe.cookingTime" size="small" type="info">
                <el-icon><Clock /></el-icon>
                {{ recipe.cookingTime }}分钟
              </el-tag>
              <el-tag v-for="season in recipe.seasonNames" :key="season" size="small" type="success">
                {{ season }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && recipes.length === 0" description="暂无菜谱，点击右上角录入菜谱" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, StarFilled, Star, Clock, Dish } from '@element-plus/icons-vue'
import { recipeApi, favoriteApi } from '../api'

const router = useRouter()
const recipes = ref([])
const loading = ref(false)

const loadRecipes = async () => {
  loading.value = true
  try {
    recipes.value = await recipeApi.getAll()
  } catch (e) {
    ElMessage.error('加载菜谱失败')
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/recipe/${id}`)
}

const toggleFavorite = async (recipe) => {
  try {
    const result = await favoriteApi.toggle(recipe.id)
    recipe.isFavorite = result.isFavorite
    ElMessage.success(result.isFavorite ? '已收藏' : '已取消收藏')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const getDifficultyType = (difficulty) => {
  const map = { '简单': 'success', '中等': 'warning', '困难': 'danger' }
  return map[difficulty] || ''
}

onMounted(loadRecipes)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-header h2 {
  color: #333;
  margin: 0;
}

.recipe-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.recipe-card:hover {
  transform: translateY(-5px);
}

.card-cover {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #f0f0f0;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.favorite-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.card-body {
  padding: 15px;
}

.recipe-name {
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #333;
}

.recipe-desc {
  color: #666;
  font-size: 14px;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>
