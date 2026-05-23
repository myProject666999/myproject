<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">一周菜单规划</h1>
      <div>
        <el-button :icon="ArrowLeft" @click="changeWeek(-1)">上一周</el-button>
        <el-date-picker
          v-model="weekStartDate"
          type="date"
          placeholder="选择日期"
          :picker-options="pickerOptions"
          @change="fetchMenu"
          style="margin: 0 12px"
        />
        <el-button :icon="ArrowRight" @click="changeWeek(1)">下一周</el-button>
      </div>
    </div>

    <div v-loading="loading" class="menu-wrapper">
      <div class="menu-grid">
        <div class="menu-header"></div>
        <div
          v-for="day in weekDays"
          :key="day"
          class="menu-header"
        >
          {{ day }}
        </div>

        <div v-for="meal in mealTypes" :key="meal" class="menu-row">
          <div class="menu-header meal-cell">
            {{ meal }}
          </div>
          <div
            v-for="day in weekDays"
            :key="day"
            class="menu-cell"
          >
            <div
              v-for="item in getMenuItems(day, meal)"
              :key="item.id"
              class="menu-cell-item"
              @click="$router.push(`/recipe/${item.recipe?.id}`)"
            >
              <span class="delete-btn" @click.stop="removeItem(item.id)">
                <el-icon><Close /></el-icon>
              </span>
              {{ item.recipe?.title }}
            </div>
            <el-button
              class="add-btn"
              link
              type="primary"
              size="small"
              @click="showAddDialog(day, meal)"
            >
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="添加菜谱到菜单" width="600px">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索菜谱..."
        clearable
        style="margin-bottom: 16px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div v-loading="searchLoading" class="search-results">
        <div
          v-for="recipe in searchResults"
          :key="recipe.id"
          class="search-item"
          @click="addToMenu(recipe)"
        >
          <div class="search-item-image">
            <el-image
              v-if="recipe.cover_image"
              :src="recipe.cover_image"
              fit="cover"
              style="width: 100%; height: 100%"
            />
            <span v-else>🍳</span>
          </div>
          <div class="search-item-info">
            <h4>{{ recipe.title }}</h4>
            <p>{{ recipe.category }} | {{ recipe.difficulty }}</p>
          </div>
        </div>
        <div v-if="!searchLoading && searchResults.length === 0" class="empty-state">
          <p>没有找到相关菜谱</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Close,
  Search
} from '@element-plus/icons-vue'
import { menuAPI, recipeAPI } from '../api'

const loading = ref(false)
const weekStartDate = ref(new Date())
const menuData = ref({})

const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
const mealTypes = ['早餐', '午餐', '晚餐', '加餐']

const dialogVisible = ref(false)
const searchKeyword = ref('')
const searchLoading = ref(false)
const searchResults = ref([])
const selectedDay = ref('')
const selectedMeal = ref('')

const pickerOptions = {
  disabledDate: (time) => {
    return time.getDay() !== 1
  }
}

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

const fetchMenu = async () => {
  loading.value = true
  try {
    const monday = getMonday(weekStartDate.value)
    const res = await menuAPI.getWeekMenu({
      week_start_date: monday.toISOString().split('T')[0]
    })
    menuData.value = res.data.menu || {}
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const changeWeek = (direction) => {
  const current = getMonday(weekStartDate.value)
  current.setDate(current.getDate() + direction * 7)
  weekStartDate.value = current
  fetchMenu()
}

const getMenuItems = (day, meal) => {
  return menuData.value?.[day]?.[meal] || []
}

const showAddDialog = (day, meal) => {
  selectedDay.value = day
  selectedMeal.value = meal
  searchKeyword.value = ''
  searchResults.value = []
  dialogVisible.value = true
}

const searchRecipes = async () => {
  searchLoading.value = true
  try {
    const res = await recipeAPI.getList({
      keyword: searchKeyword.value || undefined,
      pageSize: 20
    })
    searchResults.value = res.data.list
  } catch (error) {
    console.error(error)
  } finally {
    searchLoading.value = false
  }
}

const addToMenu = async (recipe) => {
  try {
    const monday = getMonday(weekStartDate.value)
    await menuAPI.addToMenu({
      recipe_id: recipe.id,
      week_day: selectedDay.value,
      meal_type: selectedMeal.value,
      week_start_date: monday.toISOString().split('T')[0]
    })
    ElMessage.success('添加成功')
    dialogVisible.value = false
    fetchMenu()
  } catch (error) {
    console.error(error)
  }
}

const removeItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要从菜单中移除吗？', '提示', {
      type: 'warning'
    })
    await menuAPI.removeFromMenu(id)
    ElMessage.success('移除成功')
    fetchMenu()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

onMounted(() => {
  weekStartDate.value = getMonday(new Date())
  fetchMenu()
})
</script>

<style scoped>
.menu-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.menu-grid {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
}

.menu-header {
  background: #f5f7fa;
  padding: 16px 12px;
  text-align: center;
  font-weight: 600;
  color: #606266;
  border: 1px solid #ebeef5;
}

.menu-header.meal-cell {
  background: #ecf5ff;
  color: #409eff;
}

.menu-cell {
  background: white;
  padding: 12px;
  min-height: 120px;
  border: 1px solid #ebeef5;
  position: relative;
}

.menu-cell-item {
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 6px;
  padding: 8px 12px 8px 8px;
  margin-bottom: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.menu-cell-item:hover {
  background: #d9ecff;
}

.delete-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  color: #f56c6c;
  cursor: pointer;
  padding: 4px;
}

.add-btn {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-item:hover {
  background: #f5f7fa;
}

.search-item-image {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  overflow: hidden;
  flex-shrink: 0;
}

.search-item-info h4 {
  margin: 0 0 4px;
  font-size: 15px;
  color: #303133;
}

.search-item-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: 80px repeat(7, 120px);
    overflow-x: auto;
  }
}
</style>
