<template>
  <div class="stats-view">
    <div class="header">
      <h1>统计分析</h1>
      <div class="date-range">
        <input v-model="startDate" type="date" @change="loadData" />
        <span>至</span>
        <input v-model="endDate" type="date" @change="loadData" />
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">平均每日热量</div>
        <div class="stat-value">{{ averageCalories }} kcal</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最高热量</div>
        <div class="stat-value">{{ maxCalories }} kcal</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">目标达成率</div>
        <div class="stat-value">{{ achievementRate }}%</div>
      </div>
    </div>

    <div class="chart-section">
      <h2>热量趋势</h2>
      <div class="chart-container">
        <Line 
          :data="caloriesChartData" 
          :options="chartOptions"
          height="300"
        />
      </div>
    </div>

    <div class="chart-section">
      <h2>体重变化</h2>
      <div class="chart-container">
        <Line 
          :data="weightChartData" 
          :options="weightChartOptions"
          height="300"
        />
      </div>
    </div>

    <div class="weight-records">
      <h2>体重记录</h2>
      <div class="add-weight">
        <input v-model="newWeight.weight" type="number" step="0.1" placeholder="体重 (kg)" @keyup.enter="addWeight" />
        <input v-model="newWeight.date" type="date" />
        <input v-model="newWeight.note" type="text" placeholder="备注(可选)" />
        <button @click="addWeight">添加</button>
      </div>
      <table class="weight-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>体重</th>
            <th>变化</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in weightRecords" :key="record.id">
            <td>{{ record.record_date }}</td>
            <td>{{ record.weight }} kg</td>
            <td :class="getWeightChangeClass(index)">
              {{ getWeightChange(index) }}
            </td>
            <td>{{ record.note || '-' }}</td>
            <td>
              <button class="delete-btn" @click="deleteWeight(record.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { statsApi, weightApi } from '../api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const startDate = ref(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const dailyStats = ref([])
const weightRecords = ref([])
const newWeight = ref({
  weight: '',
  date: new Date().toISOString().split('T')[0],
  note: ''
})

const averageCalories = computed(() => {
  if (!dailyStats.value.length) return 0
  const sum = dailyStats.value.reduce((acc, d) => acc + d.calories, 0)
  return Math.round(sum / dailyStats.value.length)
})

const maxCalories = computed(() => {
  if (!dailyStats.value.length) return 0
  return Math.round(Math.max(...dailyStats.value.map(d => d.calories)))
})

const achievementRate = computed(() => {
  return 75
})

const caloriesChartData = computed(() => ({
  labels: dailyStats.value.map(d => d.date.slice(5)),
  datasets: [
    {
      label: '热量摄入',
      data: dailyStats.value.map(d => d.calories),
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
}))

const weightChartData = computed(() => ({
  labels: weightRecords.value.map(w => w.record_date.slice(5)),
  datasets: [
    {
      label: '体重',
      data: weightRecords.value.map(w => w.weight),
      borderColor: '#28a745',
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: false
    }
  }
}

const weightChartOptions = {
  ...chartOptions,
  scales: {
    y: {
      beginAtZero: false
    }
  }
}

const loadData = async () => {
  try {
    const data = await statsApi.getStatistics(startDate.value, endDate.value)
    dailyStats.value = data.daily_stats
    weightRecords.value = data.weights
  } catch (e) {
    console.error('加载统计数据失败:', e)
  }
}

const addWeight = async () => {
  console.log('addWeight called, weight value:', newWeight.value.weight, typeof newWeight.value.weight)
  
  const weightStr = String(newWeight.value.weight).trim()
  if (!weightStr) {
    alert('请输入体重')
    return
  }
  
  const weightValue = parseFloat(weightStr)
  if (isNaN(weightValue) || weightValue <= 0) {
    alert('请输入有效的体重值')
    return
  }

  try {
    await weightApi.add({
      weight: weightValue,
      record_date: newWeight.value.date,
      note: newWeight.value.note
    })
    alert('体重记录添加成功！')
    newWeight.value.weight = ''
    newWeight.value.note = ''
    loadData()
  } catch (e) {
    console.error('添加体重失败:', e)
    alert('添加失败: ' + (e.message || '网络错误'))
  }
}

const deleteWeight = async (id) => {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      await weightApi.delete(id)
      loadData()
    } catch (e) {
      alert('删除失败: ' + e.message)
    }
  }
}

const getWeightChange = (index) => {
  if (index === weightRecords.value.length - 1) return '-'
  const current = weightRecords.value[index].weight
  const previous = weightRecords.value[index + 1]?.weight || current
  const change = Math.round((current - previous) * 10) / 10
  if (change > 0) return `+${change} kg`
  if (change < 0) return `${change} kg`
  return '0 kg'
}

const getWeightChangeClass = (index) => {
  if (index === weightRecords.value.length - 1) return ''
  const current = weightRecords.value[index].weight
  const previous = weightRecords.value[index + 1]?.weight || current
  if (current < previous) return 'loss'
  if (current > previous) return 'gain'
  return ''
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stats-view {
  max-width: 1000px;
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

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-range input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.stat-label {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.chart-section h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.chart-container {
  position: relative;
}

.weight-records {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.weight-records h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.add-weight {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-weight input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  flex: 1;
}

.add-weight button {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.weight-table {
  width: 100%;
  border-collapse: collapse;
}

.weight-table th,
.weight-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.weight-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #666;
}

.weight-table td.loss {
  color: #28a745;
}

.weight-table td.gain {
  color: #dc3545;
}

.delete-btn {
  padding: 0.25rem 0.5rem;
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .add-weight {
    flex-direction: column;
  }
}
</style>
