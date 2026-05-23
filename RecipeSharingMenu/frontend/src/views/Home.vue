<template>
  <div>
    <div class="filter-bar">
      <div class="filter-item">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索菜谱..."
          clearable
          @keyup.enter="handleSearch"
          style="width: 200px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="filter-item">
        <el-select v-model="filterCategory" placeholder="分类" clearable style="width: 120px">
          <el-option label="家常菜" value="家常菜" />
          <el-option label="川菜" value="川菜" />
          <el-option label="粤菜" value="粤菜" />
          <el-option label="甜品" value="甜品" />
          <el-option label="汤羹" value="汤羹" />
          <el-option label="主食" value="主食" />
          <el-option label="其他" value="其他" />
        </el-select>
      </div>
      <div class="filter-item">
        <el-select v-model="filterFlavor" placeholder="口味" clearable style="width: 120px">
          <el-option label="清淡" value="清淡" />
          <el-option label="微辣" value="微辣" />
          <el-option label="中辣" value="中辣" />
          <el-option label="麻辣" value="麻辣" />
          <el-option label="酸甜" value="酸甜" />
          <el-option label="咸鲜" value="咸鲜" />
        </el-select>
      </div>
      <div class="filter-item">
        <el-select v-model="filterDifficulty" placeholder="难度" clearable style="width: 120px">
          <el-option label="简单" value="简单" />
          <el-option label="中等" value="中等" />
          <el-option label="困难" value="困难" />
        </el-select>
      </div>
      <div class="filter-item">
        <el-select v-model="sortBy" placeholder="排序" style="width: 140px">
          <el-option label="最新发布" value="created_at" />
          <el-option label="最多点赞" value="likes_count" />
          <el-option label="最多收藏" value="favorites_count" />
        </el-select>
      </div>
      <el-button type="primary" @click="fetchRecipes">筛选</el-button>
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
            <span class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              {{ recipe.comments_count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && recipes.length === 0" class="empty-state">
      <div class="empty-state-icon">🍽️</div>
      <p>暂无菜谱</p>
    </div>

    <div v-if="total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { recipeAPI } from '../api'

const loading = ref(false)
const recipes = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const searchKeyword = ref('')
const filterCategory = ref('')
const filterFlavor = ref('')
const filterDifficulty = ref('')
const sortBy = ref('created_at')

const fetchRecipes = async () => {
  loading.value = true
  try {
    const res = await recipeAPI.getList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
      category: filterCategory.value || undefined,
      flavor: filterFlavor.value || undefined,
      difficulty: filterDifficulty.value || undefined,
      sortBy: sortBy.value
    })
    recipes.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchRecipes()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchRecipes()
}

onMounted(() => {
  fetchRecipes()
})
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
