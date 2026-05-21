<template>
  <div class="search-page">
    <div class="search-header">
      <h2>今天做什么？</h2>
      <p class="subtitle">选择你手头有的食材，看看能做什么菜</p>
    </div>

    <el-card class="search-card">
      <div class="ingredient-selector">
        <div class="category-tabs">
          <el-radio-group v-model="activeCategory" size="large">
            <el-radio-button label="全部">全部</el-radio-button>
            <el-radio-button
              v-for="cat in categories"
              :key="cat"
              :label="cat">
              {{ cat }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="ingredient-list">
          <el-checkbox
            v-for="ing in filteredIngredients"
            :key="ing.id"
            :label="ing.name"
            v-model="selectedIngredients">
            {{ ing.name }}
          </el-checkbox>
        </div>

        <div class="selected-display" v-if="selectedIngredients.length > 0">
          <span>已选择：</span>
          <el-tag
            v-for="ing in selectedIngredients"
            :key="ing"
            closable
            @close="removeIngredient(ing)"
            style="margin: 3px;">
            {{ ing }}
          </el-tag>
        </div>

        <div class="search-actions">
          <el-checkbox v-model="exactMatch">精确匹配（必须包含所有选中食材）</el-checkbox>
          <el-button type="primary" size="large" @click="doSearch" :loading="searching">
            <el-icon><Search /></el-icon>
            搜索菜谱
          </el-button>
          <el-button size="large" @click="clearSelection">清空选择</el-button>
        </div>
      </div>
    </el-card>

    <el-divider v-if="hasSearched">搜索结果</el-divider>

    <div v-if="hasSearched" v-loading="searching">
      <el-row :gutter="20">
        <el-col :span="8" v-for="recipe in searchResults" :key="recipe.id" style="margin-bottom: 20px;">
          <el-card class="recipe-card" shadow="hover" @click="goToDetail(recipe.id)">
            <div class="card-cover">
              <img v-if="recipe.coverImage" :src="recipe.coverImage" alt="" />
              <div v-else class="no-cover">
                <el-icon :size="48"><Dish /></el-icon>
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
                  {{ recipe.cookingTime }}分钟
                </el-tag>
              </div>
              <div class="matched-ingredients">
                <span>匹配食材：</span>
                <el-tag
                  v-for="ing in recipe.ingredients"
                  :key="ing.ingredientName"
                  size="small"
                  :type="selectedIngredients.includes(ing.ingredientName) ? 'success' : 'info'">
                  {{ ing.ingredientName }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="!searching && searchResults.length === 0" description="没有找到匹配的菜谱，试试减少食材或取消精确匹配" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Dish } from '@element-plus/icons-vue'
import { ingredientApi, recipeApi } from '../api'

const router = useRouter()
const allIngredients = ref([])
const categories = ref([])
const activeCategory = ref('全部')
const selectedIngredients = ref([])
const exactMatch = ref(false)
const searching = ref(false)
const searchResults = ref([])
const hasSearched = ref(false)

const filteredIngredients = computed(() => {
  if (activeCategory.value === '全部') {
    return allIngredients.value
  }
  return allIngredients.value.filter(i => i.category === activeCategory.value)
})

const loadIngredients = async () => {
  try {
    allIngredients.value = await ingredientApi.getAll()
    categories.value = await ingredientApi.getCategories()
  } catch (e) {
    ElMessage.error('加载食材失败')
  }
}

const removeIngredient = (name) => {
  selectedIngredients.value = selectedIngredients.value.filter(i => i !== name)
}

const clearSelection = () => {
  selectedIngredients.value = []
  hasSearched.value = false
  searchResults.value = []
}

const doSearch = async () => {
  if (selectedIngredients.value.length === 0) {
    ElMessage.warning('请至少选择一种食材')
    return
  }
  searching.value = true
  hasSearched.value = true
  try {
    searchResults.value = await recipeApi.searchByIngredients(selectedIngredients.value, exactMatch.value)
    if (searchResults.value.length === 0) {
      ElMessage.info('没有找到匹配的菜谱')
    }
  } catch (e) {
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/recipe/${id}`)
}

const getDifficultyType = (difficulty) => {
  const map = { '简单': 'success', '中等': 'warning', '困难': 'danger' }
  return map[difficulty] || ''
}

onMounted(loadIngredients)
</script>

<style scoped>
.search-header {
  text-align: center;
  margin-bottom: 30px;
}

.search-header h2 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 28px;
}

.subtitle {
  color: #666;
  margin: 0;
}

.search-card {
  margin-bottom: 20px;
}

.ingredient-selector {
  padding: 10px 0;
}

.category-tabs {
  margin-bottom: 20px;
  text-align: center;
}

.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.selected-display {
  margin-bottom: 15px;
  padding: 10px;
  background: #fff8f0;
  border-radius: 6px;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.recipe-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.recipe-card:hover {
  transform: translateY(-5px);
}

.card-cover {
  height: 150px;
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
  gap: 5px;
  margin-bottom: 10px;
}

.matched-ingredients {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #999;
}
</style>
