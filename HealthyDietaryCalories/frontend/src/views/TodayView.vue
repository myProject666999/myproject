<template>
  <div class="today-view">
    <div class="header">
      <div class="date-picker">
        <button class="nav-btn" @click="changeDate(-1)">&larr;</button>
        <input 
          type="date" 
          v-model="currentDate" 
          @change="onDateChange"
        />
        <button class="nav-btn" @click="changeDate(1)">&rarr;</button>
        <button v-if="currentDate !== today" class="today-btn" @click="goToday">今天</button>
      </div>
    </div>

    <GoalProgress :goal="dietStore.dailyGoal" :intake="dietStore.dailySummary" />

    <div class="meals-section">
      <h2 class="section-title">今日饮食</h2>
      
      <div class="meals-grid">
        <MealCard
          v-for="meal in mealsByType"
          :key="meal.id"
          :meal="meal"
          @add-food="openFoodSelector(meal)"
          @edit-item="editItem"
          @delete-item="deleteItem"
        />
        
        <div v-for="type in missingMealTypes" :key="type" class="meal-card empty">
          <div class="meal-header">
            <div class="meal-type">
              <span class="meal-icon">{{ mealIcons[type] }}</span>
              <span class="meal-name">{{ type }}</span>
            </div>
          </div>
          <div class="empty-meal">
            <span>暂无记录</span>
          </div>
          <button class="add-food-btn" @click="createMeal(type)">
            + 添加{{ type }}
          </button>
        </div>
      </div>
    </div>

    <FoodSelector
      :visible="showFoodSelector"
      :meal="selectedMeal"
      @close="showFoodSelector = false"
      @confirm="addFoodToMeal"
    />

    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="edit-modal">
        <h3>编辑食用量</h3>
        <div class="edit-item">
          <label>食用量 (克)</label>
          <input v-model.number="editQuantity" type="number" min="1" step="10" />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showEditModal = false">取消</button>
          <button class="confirm-btn" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDietStore } from '../stores/diet'
import GoalProgress from '../components/GoalProgress.vue'
import MealCard from '../components/MealCard.vue'
import FoodSelector from '../components/FoodSelector.vue'

const dietStore = useDietStore()

const currentDate = ref(new Date().toISOString().split('T')[0])
const today = new Date().toISOString().split('T')[0]

const showFoodSelector = ref(false)
const selectedMeal = ref(null)

const showEditModal = ref(false)
const editingItem = ref(null)
const editQuantity = ref(100)

const mealIcons = {
  '早餐': '🌅',
  '午餐': '☀️',
  '晚餐': '🌙',
  '加餐': '🍎'
}

const mealTypes = ['早餐', '午餐', '晚餐', '加餐']

const mealsByType = computed(() => {
  if (!dietStore.meals) return []
  return dietStore.meals
})

const missingMealTypes = computed(() => {
  const existingTypes = mealsByType.value.map(m => m.meal_type)
  return mealTypes.filter(t => !existingTypes.includes(t))
})

onMounted(() => {
  dietStore.setDate(currentDate.value)
})

const changeDate = (delta) => {
  const date = new Date(currentDate.value)
  date.setDate(date.getDate() + delta)
  currentDate.value = date.toISOString().split('T')[0]
  dietStore.setDate(currentDate.value)
}

const goToday = () => {
  currentDate.value = today
  dietStore.setDate(currentDate.value)
}

const onDateChange = () => {
  dietStore.setDate(currentDate.value)
}

const openFoodSelector = (meal) => {
  selectedMeal.value = meal
  showFoodSelector.value = true
}

const createMeal = async (type) => {
  try {
    const meal = await dietStore.createMeal({
      meal_type: type,
      meal_date: currentDate.value
    })
    openFoodSelector(meal)
  } catch (e) {
    alert('创建餐食失败: ' + e.message)
  }
}

const addFoodToMeal = async (item) => {
  try {
    await dietStore.addMealItem(selectedMeal.value.id, item)
    showFoodSelector.value = false
  } catch (e) {
    alert('添加食物失败: ' + e.message)
  }
}

const editItem = (item) => {
  editingItem.value = item
  editQuantity.value = item.quantity
  showEditModal.value = true
}

const saveEdit = async () => {
  try {
    await dietStore.updateMealItem(editingItem.value.id, {
      food_id: editingItem.value.food_id,
      quantity: editQuantity.value
    })
    showEditModal.value = false
  } catch (e) {
    alert('保存失败: ' + e.message)
  }
}

const deleteItem = async (itemId) => {
  if (confirm('确定要删除这个食物吗？')) {
    try {
      await dietStore.deleteMealItem(itemId)
    } catch (e) {
      alert('删除失败: ' + e.message)
    }
  }
}
</script>

<style scoped>
.today-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}

.header {
  margin-bottom: 1.5rem;
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.date-picker input[type="date"] {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.nav-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.nav-btn:hover {
  background: #f0f0f0;
}

.today-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

.today-btn:hover {
  background: #5a6fd8;
}

.meals-section {
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.meals-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meal-card.empty {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  opacity: 0.8;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-modal {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
}

.edit-modal h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.edit-item {
  margin-bottom: 1rem;
}

.edit-item label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.edit-item input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn,
.confirm-btn {
  padding: 0.625rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}

.cancel-btn {
  background: #f0f0f0;
  border: none;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}
</style>
