<template>
  <div class="settings-view">
    <div class="header">
      <h1>设置</h1>
    </div>

    <div class="settings-content">
      <div class="settings-section">
        <h2>每日目标</h2>
        <div class="goal-form">
          <div class="form-row">
            <div class="form-group">
              <label>目标热量 (kcal)</label>
              <input v-model.number="goal.target_calories" type="number" min="0" />
            </div>
            <div class="form-group">
              <label>目标蛋白质 (g)</label>
              <input v-model.number="goal.target_protein" type="number" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>目标碳水 (g)</label>
              <input v-model.number="goal.target_carbs" type="number" min="0" />
            </div>
            <div class="form-group">
              <label>目标脂肪 (g)</label>
              <input v-model.number="goal.target_fat" type="number" min="0" />
            </div>
          </div>
          <button class="save-btn" @click="saveGoal">保存目标</button>
        </div>
      </div>

      <div class="settings-section">
        <h2>关于</h2>
        <div class="about-info">
          <p><strong>健康饮食热量记录</strong></p>
          <p>版本: 1.0.0</p>
          <p>帮助您记录每日饮食热量，跟踪营养摄入，达成健康目标</p>
        </div>
      </div>

      <div class="settings-section">
        <h2>数据管理</h2>
        <div class="data-actions">
          <button class="action-btn" @click="exportData">导出数据</button>
          <button class="action-btn danger" @click="clearData">清空数据</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dailyApi, statsApi } from '../api'

const goal = ref({
  target_calories: 2000,
  target_protein: 75,
  target_carbs: 250,
  target_fat: 65
})

const loadGoal = async () => {
  try {
    const data = await dailyApi.getGoal()
    if (data) {
      goal.value = {
        target_calories: data.target_calories || 2000,
        target_protein: data.target_protein || 75,
        target_carbs: data.target_carbs || 250,
        target_fat: data.target_fat || 65
      }
    }
  } catch (e) {
    console.error('加载目标失败:', e)
  }
}

const saveGoal = async () => {
  try {
    await dailyApi.setGoal(goal.value)
    alert('目标保存成功！')
  } catch (e) {
    alert('保存失败: ' + e.message)
  }
}

const exportData = async () => {
  try {
    const data = await statsApi.exportData()
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dietary-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    alert('数据导出成功！')
  } catch (e) {
    alert('导出失败: ' + e.message)
  }
}

const clearData = () => {
  if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
    alert('清空功能开发中...')
  }
}

onMounted(() => {
  loadGoal()
})
</script>

<style scoped>
.settings-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
}

.header {
  margin-bottom: 1.5rem;
}

.header h1 {
  margin: 0;
  color: #333;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.settings-section h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.goal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  align-self: flex-start;
}

.about-info {
  color: #666;
  line-height: 1.8;
}

.about-info p {
  margin: 0.5rem 0;
}

.data-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
}

.action-btn:not(.danger) {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.danger {
  background: #ffebee;
  color: #c62828;
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
  }
  
  .data-actions {
    flex-direction: column;
  }
}
</style>
