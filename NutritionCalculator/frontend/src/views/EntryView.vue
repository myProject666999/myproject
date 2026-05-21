<template>
  <div class="entry-view">
    <div class="card date-selector-card">
      <div class="date-row">
        <button class="btn btn-secondary date-nav-btn" @click="changeDate(-1)">
          ← 昨天
        </button>
        <input type="date" v-model="selectedDate" @change="loadDailyData" class="date-input" />
        <button class="btn btn-secondary date-nav-btn" @click="changeDate(1)">
          明天 →
        </button>
        <button class="btn btn-secondary" @click="goToToday">今天</button>
      </div>

      <div v-if="dailyData" class="nutrition-summary">
        <div class="summary-item">
          <span class="summary-icon">🔥</span>
          <div class="summary-content">
            <span class="summary-value">{{ dailyData.totalCalories }}</span>
            <span class="summary-label">kcal</span>
          </div>
        </div>
        <div class="summary-item">
          <span class="summary-icon">🥩</span>
          <div class="summary-content">
            <span class="summary-value">{{ dailyData.totalProtein }}</span>
            <span class="summary-label">g 蛋白</span>
          </div>
        </div>
        <div class="summary-item">
          <span class="summary-icon">🥑</span>
          <div class="summary-content">
            <span class="summary-value">{{ dailyData.totalFat }}</span>
            <span class="summary-label">g 脂肪</span>
          </div>
        </div>
        <div class="summary-item">
          <span class="summary-icon">🍚</span>
          <div class="summary-content">
            <span class="summary-value">{{ dailyData.totalCarbs }}</span>
            <span class="summary-label">g 碳水</span>
          </div>
        </div>
      </div>

      <div v-if="dailyData?.goalCompare" class="goal-progress">
        <div class="progress-item" v-for="item in goalProgressItems" :key="item.key">
          <div class="progress-header">
            <span class="progress-label">{{ item.label }}</span>
            <span class="progress-value">
              {{ dailyData[item.currentKey] }} / {{ dailyData.goalCompare[item.targetKey] }} {{ item.unit }}
              ({{ dailyData.goalCompare[item.percentKey] }}%)
            </span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: Math.min(dailyData.goalCompare[item.percentKey], 100) + '%',
                background: item.color
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">➕ 添加餐食</h3>

      <div class="form-row">
        <select v-model="newRecord.mealType" class="form-select">
          <option value="breakfast">🌅 早餐</option>
          <option value="lunch">☀️ 午餐</option>
          <option value="dinner">🌙 晚餐</option>
          <option value="snack">🍪 加餐</option>
        </select>
        <select v-model="selectedCategory" @change="loadFoods" class="form-select">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索食物..."
          @input="debounceLoadFoods"
          class="form-input"
        />
      </div>

      <div v-if="foods.length > 0" class="food-list">
        <div
          v-for="food in foods"
          :key="food.id"
          class="food-item"
          :class="{ selected: newRecord.foodId === food.id }"
          @click="selectFood(food)"
        >
          <div class="food-info">
            <div class="food-name">{{ food.name }}</div>
            <div class="food-nutrition">
              <span class="nutrition-badge badge-calories">🔥 {{ food.calories }} kcal</span>
              <span class="nutrition-badge badge-protein">🥩 {{ food.protein }}g</span>
              <span class="nutrition-badge badge-fat">🥑 {{ food.fat }}g</span>
              <span class="nutrition-badge badge-carbs">🍚 {{ food.carbs }}g</span>
              <span class="food-unit">/ {{ food.unitGram }}g</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedFood" class="amount-calculator">
        <div class="calculator-row">
          <label>食用份量 (克):</label>
          <input
            type="number"
            v-model.number="newRecord.amount"
            min="1"
            @input="calculateNutrition"
            class="form-input amount-input"
          />
        </div>
        <div class="calculated-nutrition" v-if="calculatedNutrition">
          <span class="nutrition-badge badge-calories">🔥 {{ calculatedNutrition.calories }} kcal</span>
          <span class="nutrition-badge badge-protein">🥩 {{ calculatedNutrition.protein }}g</span>
          <span class="nutrition-badge badge-fat">🥑 {{ calculatedNutrition.fat }}g</span>
          <span class="nutrition-badge badge-carbs">🍚 {{ calculatedNutrition.carbs }}g</span>
        </div>
        <button class="btn btn-primary add-btn" @click="handleAddMealRecord" :disabled="!newRecord.amount">
          添加到 {{ mealTypeLabel }}
        </button>
      </div>
    </div>

    <div v-for="meal in mealGroups" :key="meal.type" class="card">
      <h3 class="section-title">{{ meal.icon }} {{ meal.label }}</h3>
      <div v-if="meal.records.length === 0" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <p>暂无记录</p>
      </div>
      <div v-else class="meal-record-list">
        <div v-for="record in meal.records" :key="record.id" class="meal-record-item">
          <div class="record-info">
            <div class="record-name">{{ record.foodName }}</div>
            <div class="record-amount">{{ record.amount }}g</div>
          </div>
          <div class="record-nutrition">
            <span class="nutrition-badge badge-calories">{{ record.calories }} kcal</span>
            <span class="nutrition-badge badge-protein">{{ record.protein }}g</span>
            <span class="nutrition-badge badge-fat">{{ record.fat }}g</span>
            <span class="nutrition-badge badge-carbs">{{ record.carbs }}g</span>
          </div>
          <button class="btn btn-danger delete-btn" @click="deleteRecord(record.id)">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getFoods, getFoodCategories } from '../api/food'
import { getDailyNutrition, addMealRecord as saveMealRecord, deleteMealRecord } from '../api/meal'
import { getCurrentGoal } from '../api/goal'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const searchKeyword = ref('')
const selectedCategory = ref('')
const foods = ref([])
const categories = ref([])
const dailyData = ref(null)
const selectedFood = ref(null)
const calculatedNutrition = ref(null)
let searchTimer = null

const newRecord = reactive({
  mealType: 'breakfast',
  foodId: null,
  amount: 100,
  mealDate: selectedDate.value
})

const mealTypeLabel = computed(() => {
  const map = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }
  return map[newRecord.mealType] || '餐食'
})

const goalProgressItems = [
  { key: 'calories', label: '热量', currentKey: 'totalCalories', targetKey: 'targetCalories', percentKey: 'caloriesPercentage', unit: 'kcal', color: '#f57c00' },
  { key: 'protein', label: '蛋白质', currentKey: 'totalProtein', targetKey: 'targetProtein', percentKey: 'proteinPercentage', unit: 'g', color: '#388e3c' },
  { key: 'fat', label: '脂肪', currentKey: 'totalFat', targetKey: 'targetFat', percentKey: 'fatPercentage', unit: 'g', color: '#1976d2' },
  { key: 'carbs', label: '碳水', currentKey: 'totalCarbs', targetKey: 'targetCarbs', percentKey: 'carbsPercentage', unit: 'g', color: '#c2185b' }
]

const mealGroups = computed(() => {
  if (!dailyData.value?.records) return []
  const meals = [
    { type: 'breakfast', label: '早餐', icon: '🌅', records: [] },
    { type: 'lunch', label: '午餐', icon: '☀️', records: [] },
    { type: 'dinner', label: '晚餐', icon: '🌙', records: [] },
    { type: 'snack', label: '加餐', icon: '🍪', records: [] }
  ]
  dailyData.value.records.forEach(r => {
    const meal = meals.find(m => m.type === r.mealType)
    if (meal) meal.records.push(r)
  })
  return meals
})

function changeDate(delta) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + delta)
  selectedDate.value = d.toISOString().split('T')[0]
  loadDailyData()
}

function goToToday() {
  selectedDate.value = new Date().toISOString().split('T')[0]
  loadDailyData()
}

async function loadFoods() {
  foods.value = await getFoods(searchKeyword.value, selectedCategory.value)
}

function debounceLoadFoods() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(loadFoods, 300)
}

async function loadCategories() {
  categories.value = await getFoodCategories()
}

async function loadDailyData() {
  newRecord.mealDate = selectedDate.value
  dailyData.value = await getDailyNutrition(selectedDate.value)
}

function selectFood(food) {
  selectedFood.value = food
  newRecord.foodId = food.id
  newRecord.amount = food.unitGram
  calculateNutrition()
}

function calculateNutrition() {
  if (!selectedFood.value || !newRecord.amount) {
    calculatedNutrition.value = null
    return
  }
  const ratio = newRecord.amount / selectedFood.value.unitGram
  calculatedNutrition.value = {
    calories: Math.round(selectedFood.value.calories * ratio),
    protein: Math.round(selectedFood.value.protein * ratio),
    fat: Math.round(selectedFood.value.fat * ratio),
    carbs: Math.round(selectedFood.value.carbs * ratio)
  }
}

async function handleAddMealRecord() {
  if (!newRecord.foodId || !newRecord.amount) return
  await saveMealRecord({
    mealDate: selectedDate.value,
    mealType: newRecord.mealType,
    foodId: newRecord.foodId,
    amount: newRecord.amount
  })
  newRecord.foodId = null
  newRecord.amount = 100
  selectedFood.value = null
  calculatedNutrition.value = null
  loadDailyData()
}

async function deleteRecord(id) {
  if (!confirm('确定要删除这条记录吗？')) return
  await deleteMealRecord(id)
  loadDailyData()
}

onMounted(() => {
  loadCategories()
  loadFoods()
  loadDailyData()
  getCurrentGoal()
})
</script>

<style scoped>
.date-selector-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.date-input {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

.date-nav-btn {
  min-width: 80px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.date-nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.nutrition-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.15);
  padding: 14px;
  border-radius: 12px;
}

.summary-icon {
  font-size: 28px;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
}

.summary-label {
  font-size: 12px;
  opacity: 0.9;
}

.goal-progress {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
}

.progress-item {
  margin-bottom: 12px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
}

.progress-label {
  font-weight: 500;
}

.progress-value {
  opacity: 0.9;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.2);
}

.progress-fill {
  transition: width 0.5s ease;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-select,
.form-input {
  width: 100%;
}

.food-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  margin-bottom: 16px;
}

.food-item {
  padding: 14px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.food-item:hover {
  background: #f9f9f9;
}

.food-item.selected {
  background: #eef2ff;
  border-left: 4px solid #667eea;
}

.food-item:last-child {
  border-bottom: none;
}

.food-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.food-nutrition {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.food-unit {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.amount-calculator {
  background: #f8f9ff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e0e7ff;
}

.calculator-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.calculator-row label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.amount-input {
  max-width: 150px;
}

.calculated-nutrition {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.add-btn {
  width: 100%;
  padding: 12px;
  font-size: 15px;
}

.meal-record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meal-record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fafafa;
  border-radius: 10px;
  flex-wrap: wrap;
}

.record-info {
  flex: 1;
  min-width: 120px;
}

.record-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.record-amount {
  color: #666;
  font-size: 13px;
}

.record-nutrition {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 2;
  min-width: 200px;
}

.delete-btn {
  padding: 6px 14px;
  font-size: 12px;
}
</style>
