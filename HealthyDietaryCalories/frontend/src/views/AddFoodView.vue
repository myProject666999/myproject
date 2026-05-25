<template>
  <div class="add-food-view">
    <div class="header">
      <h1>添加食物</h1>
      <router-link to="/foods" class="back-link">← 返回食物库</router-link>
    </div>

    <div class="food-form">
      <div class="form-group">
        <label>食物名称 *</label>
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
          <label>热量 (kcal) *</label>
          <input v-model.number="formData.calories" type="number" step="0.1" />
        </div>
        <div class="form-group">
          <label>蛋白质 (g)</label>
          <input v-model.number="formData.protein" type="number" step="0.1" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>碳水化合物 (g)</label>
          <input v-model.number="formData.carbs" type="number" step="0.1" />
        </div>
        <div class="form-group">
          <label>脂肪 (g)</label>
          <input v-model.number="formData.fat" type="number" step="0.1" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>膳食纤维 (g)</label>
          <input v-model.number="formData.fiber" type="number" step="0.1" />
        </div>
        <div class="form-group">
          <label>份量</label>
          <input v-model.number="formData.serving_size" type="number" step="1" />
        </div>
      </div>

      <div class="form-group">
        <label>单位</label>
        <select v-model="formData.serving_unit">
          <option value="克">克</option>
          <option value="毫升">毫升</option>
          <option value="个">个</option>
        </select>
      </div>

      <div class="form-actions">
        <button class="save-btn" @click="saveFood">保存食物</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { foodApi } from '../api'

const router = useRouter()

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

const saveFood = async () => {
  if (!formData.value.name) {
    alert('请输入食物名称')
    return
  }

  if (!formData.value.calories || formData.value.calories <= 0) {
    alert('请输入有效的热量值')
    return
  }

  try {
    await foodApi.create(formData.value)
    alert('食物添加成功！')
    router.push('/foods')
  } catch (e) {
    alert('保存失败: ' + e.message)
  }
}
</script>

<style scoped>
.add-food-view {
  max-width: 600px;
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

.back-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.95rem;
}

.back-link:hover {
  text-decoration: underline;
}

.food-form {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-actions {
  margin-top: 1.5rem;
}

.save-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
