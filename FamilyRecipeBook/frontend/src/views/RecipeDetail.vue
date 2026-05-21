<template>
  <div class="recipe-detail" v-loading="loading">
    <div class="detail-header">
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <div class="header-actions">
        <el-button type="primary" plain @click="goToEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button type="danger" plain @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>

    <el-card v-if="recipe" class="detail-card">
      <div class="recipe-header">
        <div class="cover-wrapper">
          <img v-if="recipe.coverImage" :src="recipe.coverImage" alt="" class="cover" />
          <div v-else class="no-cover">
            <el-icon :size="80"><Dish /></el-icon>
          </div>
        </div>
        <div class="recipe-info">
          <div class="title-row">
            <h1>{{ recipe.name }}</h1>
            <el-button
              :type="recipe.isFavorite ? 'danger' : 'default'"
              @click="toggleFavorite">
              <el-icon>
                <StarFilled v-if="recipe.isFavorite" />
                <Star v-else />
              </el-icon>
              {{ recipe.isFavorite ? '取消收藏' : '收藏' }}
            </el-button>
          </div>
          <p class="desc" v-if="recipe.description">{{ recipe.description }}</p>
          <div class="meta">
            <el-tag v-if="recipe.difficulty" :type="getDifficultyType(recipe.difficulty)">
              难度：{{ recipe.difficulty }}
            </el-tag>
            <el-tag v-if="recipe.cookingTime" type="info">
              <el-icon><Clock /></el-icon>
              {{ recipe.cookingTime }}分钟
            </el-tag>
            <el-tag v-if="recipe.servings" type="warning">
              份量：{{ recipe.servings }}人份
            </el-tag>
          </div>
          <div class="seasons" v-if="recipe.seasonNames && recipe.seasonNames.length">
            <span>适合季节：</span>
            <el-tag v-for="s in recipe.seasonNames" :key="s" type="success" size="small">
              {{ s }}
            </el-tag>
          </div>
        </div>
      </div>

      <el-divider>食材清单</el-divider>
      <div class="ingredients-section">
        <div v-for="(ing, idx) in recipe.ingredients" :key="idx" class="ingredient-item">
          <span class="ing-name">{{ ing.ingredientName }}</span>
          <span class="ing-quantity">{{ ing.quantity }} {{ ing.unit || '' }}</span>
          <el-tag v-if="ing.isRequired" size="small" type="danger">必需</el-tag>
          <el-tag v-else size="small" type="info">可选</el-tag>
        </div>
      </div>

      <el-divider>烹饪步骤</el-divider>
      <div class="steps-section">
        <div v-for="step in recipe.steps" :key="step.stepNumber" class="step-item">
          <div class="step-number">{{ step.stepNumber }}</div>
          <div class="step-content">
            <p>{{ step.description }}</p>
            <img v-if="step.imageUrl" :src="step.imageUrl" alt="" class="step-image" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete, StarFilled, Star, Clock, Dish } from '@element-plus/icons-vue'
import { recipeApi, favoriteApi } from '../api'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const loading = ref(false)

const loadRecipe = async () => {
  loading.value = true
  try {
    recipe.value = await recipeApi.getById(route.params.id)
  } catch (e) {
    ElMessage.error('加载菜谱失败')
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async () => {
  try {
    const result = await favoriteApi.toggle(recipe.value.id)
    recipe.value.isFavorite = result.isFavorite
    ElMessage.success(result.isFavorite ? '已收藏' : '已取消收藏')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const goToEdit = () => {
  router.push(`/edit/${recipe.value.id}`)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个菜谱吗？', '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await recipeApi.delete(recipe.value.id)
    ElMessage.success('删除成功')
    router.push('/')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getDifficultyType = (difficulty) => {
  const map = { '简单': 'success', '中等': 'warning', '困难': 'danger' }
  return map[difficulty] || ''
}

onMounted(loadRecipe)
</script>

<style scoped>
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.detail-card {
  padding: 20px;
}

.recipe-header {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.cover-wrapper {
  width: 300px;
  height: 220px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.recipe-info {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.title-row h1 {
  margin: 0;
  color: #333;
}

.desc {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.meta {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.seasons {
  display: flex;
  align-items: center;
  gap: 5px;
}

.ingredients-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: #fafafa;
  border-radius: 6px;
}

.ing-name {
  font-weight: 500;
  min-width: 80px;
}

.ing-quantity {
  color: #666;
}

.steps-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  gap: 15px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content p {
  line-height: 1.8;
  color: #333;
  margin: 0 0 10px 0;
}

.step-image {
  max-width: 400px;
  border-radius: 6px;
  margin-top: 10px;
}
</style>
