<template>
  <div class="goal-view">
    <div class="card goal-card">
      <h3 class="section-title">🎯 营养目标设置</h3>
      <p class="section-desc">设置您每日的营养摄入目标，系统会自动对比您的实际摄入情况。</p>

      <div class="form-group" v-for="item in goalItems" :key="item.key">
        <label class="form-label">
          <span class="label-icon">{{ item.icon }}</span>
          {{ item.label }}
          <span class="label-unit">({{ item.unit }})</span>
        </label>
        <div class="input-row">
          <input
            type="number"
            :value="goal[item.key]"
            @input="updateGoal(item.key, $event)"
            class="form-input"
            :min="0"
            :placeholder="'请输入' + item.label"
          />
          <div class="suggestion">
            建议: {{ item.suggestion }}
          </div>
        </div>
      </div>

      <div class="reference-card">
        <h4 class="ref-title">📖 参考标准</h4>
        <div class="ref-content">
          <div class="ref-item">
            <span class="ref-label">成年女性 (轻体力劳动)</span>
            <span class="ref-value">1800 kcal / 天</span>
          </div>
          <div class="ref-item">
            <span class="ref-label">成年男性 (轻体力劳动)</span>
            <span class="ref-value">2200 kcal / 天</span>
          </div>
          <div class="ref-item">
            <span class="ref-label">蛋白质推荐</span>
            <span class="ref-value">0.8-1.2g / kg 体重</span>
          </div>
          <div class="ref-item">
            <span class="ref-label">脂肪供能比</span>
            <span class="ref-value">20-30% 总热量</span>
          </div>
          <div class="ref-item">
            <span class="ref-label">碳水供能比</span>
            <span class="ref-value">50-65% 总热量</span>
          </div>
        </div>
      </div>

      <div class="calculator-card">
        <h4 class="calc-title">🧮 热量需求估算</h4>
        <div class="calc-form">
          <div class="calc-row">
            <label>性别:</label>
            <select v-model="calcForm.gender" class="form-select">
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div class="calc-row">
            <label>年龄:</label>
            <input type="number" v-model.number="calcForm.age" min="1" max="120" class="form-input" placeholder="岁" />
          </div>
          <div class="calc-row">
            <label>身高:</label>
            <input type="number" v-model.number="calcForm.height" min="50" max="250" class="form-input" placeholder="cm" />
          </div>
          <div class="calc-row">
            <label>体重:</label>
            <input type="number" v-model.number="calcForm.weight" min="20" max="300" class="form-input" placeholder="kg" />
          </div>
          <div class="calc-row">
            <label>活动量:</label>
            <select v-model="calcForm.activity" class="form-select">
              <option value="1.2">久坐不动</option>
              <option value="1.375">轻度活动 (每周1-3次运动)</option>
              <option value="1.55">中度活动 (每周4-5次运动)</option>
              <option value="1.725">高度活动 (每天运动)</option>
              <option value="1.9">极高活动 (重体力劳动/专业运动员)</option>
            </select>
          </div>
          <button class="btn btn-primary calc-btn" @click="calculateBMR">
            计算我的推荐热量
          </button>
          <div v-if="calculatedResult" class="calc-result">
            <div class="result-item">
              <span class="result-label">基础代谢 (BMR)</span>
              <span class="result-value">{{ calculatedResult.bmr }} kcal</span>
            </div>
            <div class="result-item highlight">
              <span class="result-label">每日总消耗 (TDEE)</span>
              <span class="result-value">{{ calculatedResult.tdee }} kcal</span>
            </div>
            <button class="btn btn-secondary apply-btn" @click="applyCalculation">
              应用此目标
            </button>
          </div>
        </div>
      </div>

      <button class="btn btn-primary save-btn" @click="saveGoal">
        💾 保存目标设置
      </button>
    </div>

    <div v-if="currentGoal" class="card current-goal-card">
      <h3 class="section-title">📌 当前目标</h3>
      <div class="current-goal-grid">
        <div class="goal-item">
          <span class="goal-icon">🔥</span>
          <div class="goal-info">
            <div class="goal-value">{{ currentGoal.targetCalories }}</div>
            <div class="goal-label">热量 (kcal/天)</div>
          </div>
        </div>
        <div class="goal-item">
          <span class="goal-icon">🥩</span>
          <div class="goal-info">
            <div class="goal-value">{{ currentGoal.targetProtein }}</div>
            <div class="goal-label">蛋白质 (g/天)</div>
          </div>
        </div>
        <div class="goal-item">
          <span class="goal-icon">🥑</span>
          <div class="goal-info">
            <div class="goal-value">{{ currentGoal.targetFat }}</div>
            <div class="goal-label">脂肪 (g/天)</div>
          </div>
        </div>
        <div class="goal-item">
          <span class="goal-icon">🍚</span>
          <div class="goal-info">
            <div class="goal-value">{{ currentGoal.targetCarbs }}</div>
            <div class="goal-label">碳水 (g/天)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCurrentGoal, saveOrUpdateGoal } from '../api/goal'

const currentGoal = ref(null)
const calculatedResult = ref(null)

const goal = reactive({
  targetCalories: 2000,
  targetProtein: 60,
  targetFat: 60,
  targetCarbs: 250
})

const calcForm = reactive({
  gender: 'male',
  age: 30,
  height: 170,
  weight: 65,
  activity: 1.375
})

const goalItems = [
  { key: 'targetCalories', label: '每日热量目标', icon: '🔥', unit: 'kcal', suggestion: '1800-2500 kcal' },
  { key: 'targetProtein', label: '每日蛋白质目标', icon: '🥩', unit: 'g', suggestion: '50-100 g (0.8-1.2g/kg体重)' },
  { key: 'targetFat', label: '每日脂肪目标', icon: '🥑', unit: 'g', suggestion: '40-80 g (约占总热量20-30%)' },
  { key: 'targetCarbs', label: '每日碳水目标', icon: '🍚', unit: 'g', suggestion: '200-350 g (约占总热量50-65%)' }
]

function updateGoal(key, event) {
  const val = parseInt(event.target.value) || 0
  goal[key] = val
}

function calculateBMR() {
  const { gender, age, height, weight, activity } = calcForm

  let bmr
  if (gender === 'male') {
    bmr = Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age))
  } else {
    bmr = Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age))
  }

  const tdee = Math.round(bmr * parseFloat(activity))

  calculatedResult.value = { bmr, tdee }
}

function applyCalculation() {
  if (!calculatedResult.value) return

  const tdee = calculatedResult.value.tdee
  goal.targetCalories = tdee

  const proteinCal = Math.round(tdee * 0.2)
  const fatCal = Math.round(tdee * 0.25)
  const carbsCal = Math.round(tdee * 0.55)

  goal.targetProtein = Math.round(proteinCal / 4)
  goal.targetFat = Math.round(fatCal / 9)
  goal.targetCarbs = Math.round(carbsCal / 4)
}

async function loadCurrentGoal() {
  const data = await getCurrentGoal()
  if (data) {
    currentGoal.value = data
    Object.assign(goal, data)
  }
}

async function saveGoal() {
  if (goal.targetCalories <= 0) {
    alert('请输入有效的热量目标')
    return
  }

  await saveOrUpdateGoal(goal)
  currentGoal.value = { ...goal }
  alert('目标设置已保存！')
}

onMounted(() => {
  loadCurrentGoal()
})
</script>

<style scoped>
.goal-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #333;
}

.section-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 15px;
}

.label-icon {
  font-size: 20px;
}

.label-unit {
  font-weight: normal;
  color: #999;
  font-size: 13px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.form-input {
  flex: 1;
  min-width: 200px;
}

.suggestion {
  color: #888;
  font-size: 13px;
  background: #f0f0f0;
  padding: 6px 12px;
  border-radius: 16px;
}

.reference-card {
  background: #fff8e1;
  padding: 20px;
  border-radius: 14px;
  margin: 24px 0;
  border: 1px solid #ffe082;
}

.ref-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #f57c00;
}

.ref-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ref-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #5d4037;
}

.ref-label {
  font-weight: 500;
}

.ref-value {
  color: #f57c00;
  font-weight: 600;
}

.calculator-card {
  background: #e8f5e9;
  padding: 20px;
  border-radius: 14px;
  margin: 24px 0;
  border: 1px solid #a5d6a7;
}

.calc-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #2e7d32;
}

.calc-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.calc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.calc-row label {
  font-weight: 500;
  color: #333;
  min-width: 60px;
}

.calc-row .form-input,
.calc-row .form-select {
  flex: 1;
  min-width: 150px;
}

.calc-btn {
  padding: 12px;
  font-size: 15px;
  margin-top: 8px;
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
}

.calc-result {
  background: white;
  padding: 16px;
  border-radius: 12px;
  margin-top: 12px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item.highlight {
  background: #f1f8e9;
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
}

.result-label {
  font-weight: 500;
  color: #333;
}

.result-value {
  font-weight: 700;
  color: #2e7d32;
  font-size: 18px;
}

.apply-btn {
  width: 100%;
  margin-top: 12px;
  background: #e8f5e9;
  color: #2e7d32;
  border: 2px solid #2e7d32;
}

.apply-btn:hover {
  background: #c8e6c9;
}

.save-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 12px;
}

.current-goal-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.current-goal-card .section-title {
  color: white;
}

.current-goal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.15);
  padding: 16px;
  border-radius: 12px;
}

.goal-icon {
  font-size: 28px;
}

.goal-value {
  font-size: 24px;
  font-weight: 700;
}

.goal-label {
  font-size: 12px;
  opacity: 0.9;
}
</style>
