<template>
  <div class="meal-card">
    <div class="meal-header">
      <div class="meal-type">
        <span class="meal-icon">{{ mealIcon }}</span>
        <span class="meal-name">{{ meal.meal_type }}</span>
      </div>
      <div class="meal-calories">{{ formatNumber(meal.total_calories) }} kcal</div>
    </div>

    <div v-if="meal.items && meal.items.length > 0" class="meal-items">
      <div v-for="item in meal.items" :key="item.id" class="meal-item">
        <div class="item-info">
          <span class="item-name">{{ item.food_name }}</span>
          <span class="item-quantity">{{ item.quantity }}{{ getItemUnit(item) }}</span>
        </div>
        <div class="item-nutrition">
          <span>{{ formatNumber(item.calories) }} kcal</span>
        </div>
        <div class="item-actions">
          <button class="action-btn edit-btn" @click="$emit('edit-item', item)">编辑</button>
          <button class="action-btn delete-btn" @click="$emit('delete-item', item.id)">删除</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-meal">
      <span>暂无记录</span>
    </div>

    <button class="add-food-btn" @click="$emit('add-food', meal)">
      + 添加食物
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  meal: Object
})

defineEmits(['add-food', 'edit-item', 'delete-item'])

const mealIcons = {
  '早餐': '🌅',
  '午餐': '☀️',
  '晚餐': '🌙',
  '加餐': '🍎'
}

const mealIcon = computed(() => mealIcons[props.meal?.meal_type] || '🍽️')

const formatNumber = (num) => {
  return Math.round(num * 10) / 10
}

const getItemUnit = (item) => {
  return '克'
}
</script>

<style scoped>
.meal-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.meal-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meal-icon {
  font-size: 1.5rem;
}

.meal-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.meal-calories {
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
}

.meal-items {
  margin-bottom: 1rem;
}

.meal-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-quantity {
  font-size: 0.85rem;
  color: #888;
}

.item-nutrition {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
  margin-right: 1rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background: #e3f2fd;
  color: #1976d2;
}

.edit-btn:hover {
  background: #1976d2;
  color: white;
}

.delete-btn {
  background: #ffebee;
  color: #c62828;
}

.delete-btn:hover {
  background: #c62828;
  color: white;
}

.empty-meal {
  text-align: center;
  padding: 1.5rem;
  color: #aaa;
  font-size: 0.9rem;
}

.add-food-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.add-food-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
