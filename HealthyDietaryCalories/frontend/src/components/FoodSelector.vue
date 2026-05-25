<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>选择食物</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索食物..." 
            @input="handleSearch"
          />
          <select v-model="selectedCategory" @change="handleSearch">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="food-list">
          <div 
            v-for="food in foods" 
            :key="food.id" 
            class="food-item"
            @click="selectFood(food)"
          >
            <div class="food-info">
              <span class="food-name">{{ food.name }}</span>
              <span class="food-category">{{ food.category }}</span>
            </div>
            <div class="food-calories">{{ food.calories }} kcal/{{ food.serving_size }}{{ food.serving_unit }}</div>
          </div>
        </div>

        <div v-if="selectedFood" class="food-detail">
          <h4>{{ selectedFood.name }}</h4>
          <div class="nutrition-info">
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <span class="label">热量</span>
                <span class="value">{{ selectedFood.calories }} kcal</span>
              </div>
              <div class="nutrition-item">
                <span class="label">蛋白质</span>
                <span class="value">{{ selectedFood.protein }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="label">碳水</span>
                <span class="value">{{ selectedFood.carbs }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="label">脂肪</span>
                <span class="value">{{ selectedFood.fat }}g</span>
              </div>
            </div>
          </div>

          <div class="quantity-input">
            <label>食用量 ({{ selectedFood.serving_unit }})</label>
            <input 
              v-model.number="quantity" 
              type="number" 
              :min="1"
              :step="10"
            />
          </div>

          <div class="calculated-nutrition">
            <p>预计摄入: {{ calculatedCalories }} kcal</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button 
          class="confirm-btn" 
          :disabled="!selectedFood || !quantity"
          @click="confirm"
        >
          添加
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { foodApi } from '../api'

const props = defineProps({
  visible: Boolean,
  meal: Object
})

const emit = defineEmits(['close', 'confirm'])

const searchQuery = ref('')
const selectedCategory = ref('')
const categories = ref([])
const foods = ref([])
const selectedFood = ref(null)
const quantity = ref(100)

const calculatedCalories = computed(() => {
  if (!selectedFood.value) return 0
  const ratio = quantity.value / selectedFood.value.serving_size
  return Math.round(selectedFood.value.calories * ratio * 10) / 10
})

const loadCategories = async () => {
  try {
    categories.value = await foodApi.getCategories()
  } catch (e) {
    console.error('加载分类失败:', e)
  }
}

const handleSearch = async () => {
  try {
    if (searchQuery.value) {
      foods.value = await foodApi.search(searchQuery.value, selectedCategory.value)
    } else {
      foods.value = await foodApi.getAll({ category: selectedCategory.value })
    }
  } catch (e) {
    console.error('搜索食物失败:', e)
  }
}

const selectFood = (food) => {
  selectedFood.value = food
  quantity.value = food.serving_size
}

const confirm = () => {
  if (selectedFood.value && quantity.value) {
    emit('confirm', {
      food_id: selectedFood.value.id,
      quantity: quantity.value
    })
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    loadCategories()
    handleSearch()
    selectedFood.value = null
    quantity.value = 100
  }
})
</script>

<style scoped>
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

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

.search-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-bar input {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
}

.search-bar select {
  padding: 0.625rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
}

.food-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.food-item:hover {
  background: #e9ecef;
}

.food-info {
  display: flex;
  flex-direction: column;
}

.food-name {
  font-weight: 500;
  color: #333;
}

.food-category {
  font-size: 0.8rem;
  color: #888;
}

.food-calories {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
}

.food-detail {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
}

.food-detail h4 {
  margin: 0 0 0.75rem 0;
  color: #333;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.nutrition-item {
  text-align: center;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
}

.nutrition-item .label {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 0.25rem;
}

.nutrition-item .value {
  font-weight: 600;
  color: #333;
}

.quantity-input {
  margin-bottom: 1rem;
}

.quantity-input label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.quantity-input input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.calculated-nutrition {
  text-align: center;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border-radius: 8px;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn,
.confirm-btn {
  padding: 0.625rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f0f0f0;
  border: none;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
