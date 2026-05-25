<template>
  <div class="foods-view">
    <div class="header">
      <h1>食物库</h1>
      <button class="add-btn" @click="showAddModal = true">+ 添加食物</button>
    </div>

    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索食物..." 
        @input="loadFoods"
      />
      <select v-model="selectedCategory" @change="loadFoods">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <div class="foods-grid">
      <div 
        v-for="food in foods" 
        :key="food.id" 
        class="food-card"
      >
        <div class="food-header">
          <h3>{{ food.name }}</h3>
          <span class="category-tag">{{ food.category }}</span>
        </div>
        <div class="nutrition-info">
          <div class="nutrition-item">
            <span class="label">热量</span>
            <span class="value">{{ food.calories }}</span>
          </div>
          <div class="nutrition-item">
            <span class="label">蛋白质</span>
            <span class="value">{{ food.protein }}g</span>
          </div>
          <div class="nutrition-item">
            <span class="label">碳水</span>
            <span class="value">{{ food.carbs }}g</span>
          </div>
          <div class="nutrition-item">
            <span class="label">脂肪</span>
            <span class="value">{{ food.fat }}g</span>
          </div>
        </div>
        <div class="serving-info">
          每 {{ food.serving_size }}{{ food.serving_unit }}
        </div>
        <div v-if="food.is_custom" class="custom-actions">
          <button class="edit-btn" @click="editFood(food)">编辑</button>
          <button class="delete-btn" @click="deleteFood(food.id)">删除</button>
        </div>
      </div>
    </div>

    <div v-if="foods.length === 0" class="empty-state">
      <p>暂无食物记录</p>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <h3>{{ editingFood ? '编辑食物' : '添加食物' }}</h3>
        
        <div class="form-group">
          <label>食物名称</label>
          <input v-model="formData.name" type="text" placeholder="请输入食物名称" />
        </div>

        <div class="form-group">
          <label>分类</label>
          <select v-model="formData.category">
            <option value="主食">主食</option>
            <option value="肉类">肉类</option>
            <option value="乳制品">乳制品</option>
            <option value="水果">水果</option>
            <option value="蔬菜">蔬菜</option>
            <option value="豆类">豆类</option>
            <option value="坚果">坚果</option>
            <option value="油脂">油脂</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>热量 (kcal)</label>
            <input v-model.number="formData.calories" type="number" step="0.1" />
          </div>
          <div class="form-group">
            <label>蛋白质 (g)</label>
            <input v-model.number="formData.protein" type="number" step="0.1" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>碳水 (g)</label>
            <input v-model.number="formData.carbs" type="number" step="0.1" />
          </div>
          <div class="form-group">
            <label>脂肪 (g)</label>
            <input v-model.number="formData.fat" type="number" step="0.1" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>份量</label>
            <input v-model.number="formData.serving_size" type="number" step="1" />
          </div>
          <div class="form-group">
            <label>单位</label>
            <select v-model="formData.serving_unit">
              <option value="克">克</option>
              <option value="毫升">毫升</option>
              <option value="个">个</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="confirm-btn" @click="saveFood">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { foodApi } from '../api'

const foods = ref([])
const categories = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')

const showAddModal = ref(false)
const editingFood = ref(null)
const formData = ref({
  name: '',
  category: '其他',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  serving_size: 100,
  serving_unit: '克'
})

const loadCategories = async () => {
  try {
    categories.value = await foodApi.getCategories()
  } catch (e) {
    console.error('加载分类失败:', e)
  }
}

const loadFoods = async () => {
  try {
    if (searchQuery.value) {
      foods.value = await foodApi.search(searchQuery.value, selectedCategory.value)
    } else {
      foods.value = await foodApi.getAll({ category: selectedCategory.value })
    }
  } catch (e) {
    console.error('加载食物失败:', e)
  }
}

const editFood = (food) => {
  editingFood.value = food
  formData.value = { ...food }
  showAddModal.value = true
}

const deleteFood = async (id) => {
  if (confirm('确定要删除这个食物吗？')) {
    try {
      await foodApi.delete(id)
      loadFoods()
    } catch (e) {
      alert('删除失败: ' + e.message)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingFood.value = null
  formData.value = {
    name: '',
    category: '其他',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    serving_size: 100,
    serving_unit: '克'
  }
}

const saveFood = async () => {
  if (!formData.value.name) {
    alert('请输入食物名称')
    return
  }

  try {
    if (editingFood.value) {
      await foodApi.update(editingFood.value.id, formData.value)
    } else {
      await foodApi.create(formData.value)
    }
    closeModal()
    loadFoods()
  } catch (e) {
    alert('保存失败: ' + e.message)
  }
}

onMounted(() => {
  loadCategories()
  loadFoods()
})
</script>

<style scoped>
.foods-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  margin: 0;
  color: #333;
}

.add-btn {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-bar input,
.search-bar select {
  padding: 0.625rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
}

.search-bar input {
  flex: 1;
}

.foods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.food-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.food-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.food-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.category-tag {
  padding: 0.25rem 0.5rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.75rem;
}

.nutrition-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.nutrition-item {
  text-align: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.nutrition-item .label {
  display: block;
  font-size: 0.7rem;
  color: #888;
  margin-bottom: 0.25rem;
}

.nutrition-item .value {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.serving-info {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.75rem;
}

.custom-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.edit-btn {
  background: #e3f2fd;
  color: #1976d2;
}

.delete-btn {
  background: #ffebee;
  color: #c62828;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
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

.modal {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin: 0 0 1.25rem 0;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
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
