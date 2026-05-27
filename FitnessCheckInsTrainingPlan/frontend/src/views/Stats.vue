<template>
  <div class="page-container">
    <div class="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 pb-12 rounded-b-3xl">
      <h1 class="text-2xl font-bold mb-1">数据曲线</h1>
      <p class="text-primary-100 text-sm">追踪你的身体变化</p>
    </div>

    <div class="px-4 -mt-8">
      <div class="card animate-slide-up">
        <div class="flex gap-2 mb-4">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="px-4 py-2 rounded-lg text-sm"
            :class="activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'weight'" class="h-64">
          <Line :data="weightChartData" :options="chartOptions" />
        </div>
        <div v-else class="h-64">
          <Line :data="bodyChartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <div class="px-4 mt-4">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold">添加记录</h3>
          <button @click="showAddRecord = !showAddRecord" class="text-primary-500 text-sm">
            {{ showAddRecord ? '收起' : '+ 添加' }}
          </button>
        </div>

        <div v-if="showAddRecord" class="space-y-3 mb-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500">体重(kg)</label>
              <input v-model.number="newRecord.weight" type="number" step="0.1" class="input-field" />
            </div>
            <div>
              <label class="text-xs text-gray-500">胸围(cm)</label>
              <input v-model.number="newRecord.chest" type="number" step="0.1" class="input-field" />
            </div>
            <div>
              <label class="text-xs text-gray-500">腰围(cm)</label>
              <input v-model.number="newRecord.waist" type="number" step="0.1" class="input-field" />
            </div>
            <div>
              <label class="text-xs text-gray-500">臀围(cm)</label>
              <input v-model.number="newRecord.hip" type="number" step="0.1" class="input-field" />
            </div>
            <div>
              <label class="text-xs text-gray-500">臂围(cm)</label>
              <input v-model.number="newRecord.arm" type="number" step="0.1" class="input-field" />
            </div>
            <div>
              <label class="text-xs text-gray-500">腿围(cm)</label>
              <input v-model.number="newRecord.thigh" type="number" step="0.1" class="input-field" />
            </div>
          </div>
          <button @click="saveRecord" :disabled="saving" class="btn-primary w-full">
            {{ saving ? '保存中...' : '保存记录' }}
          </button>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="record in records"
            :key="record.id"
            class="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
          >
            <div>
              <div class="font-medium">{{ record.date }}</div>
              <div class="text-sm text-gray-500">
                体重: {{ record.weight }}kg
                <span v-if="record.chest"> | 胸围: {{ record.chest }}cm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 mt-4">
      <div class="card">
        <h3 class="font-bold mb-4">训练统计</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-primary-50 rounded-xl">
            <div class="text-3xl font-bold text-primary-500">{{ stats.totalCheckIns }}</div>
            <div class="text-xs text-gray-500 mt-1">总训练次数</div>
          </div>
          <div class="text-center p-4 bg-orange-50 rounded-xl">
            <div class="text-3xl font-bold text-orange-500">{{ stats.currentStreak }}</div>
            <div class="text-xs text-gray-500 mt-1">当前连续</div>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="text-3xl font-bold text-blue-500">{{ stats.longestStreak }}</div>
            <div class="text-xs text-gray-500 mt-1">最长连续</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-xl">
            <div class="text-3xl font-bold text-purple-500">{{ formatWeight(stats.totalWeightLifted) }}</div>
            <div class="text-xs text-gray-500 mt-1">总举重(kg)</div>
          </div>
        </div>
      </div>
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
import { bodyRecordApi, statsApi } from '../api'

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

const tabs = [
  { key: 'weight', label: '体重' },
  { key: 'body', label: '围度' }
]

const activeTab = ref('weight')
const records = ref([])
const stats = ref({
  totalCheckIns: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalWeightLifted: 0
})
const showAddRecord = ref(false)
const saving = ref(false)
const newRecord = ref({
  weight: 0,
  chest: 0,
  waist: 0,
  hip: 0,
  arm: 0,
  thigh: 0
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: false
    }
  }
}

const weightChartData = computed(() => {
  const sorted = [...records.value].sort((a, b) => a.date.localeCompare(b.date))
  return {
    labels: sorted.map(r => r.date.slice(5)),
    datasets: [{
      label: '体重 (kg)',
      data: sorted.map(r => r.weight),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

const bodyChartData = computed(() => {
  const sorted = [...records.value].sort((a, b) => a.date.localeCompare(b.date))
  return {
    labels: sorted.map(r => r.date.slice(5)),
    datasets: [
      {
        label: '胸围 (cm)',
        data: sorted.map(r => r.chest),
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        tension: 0.4
      },
      {
        label: '腰围 (cm)',
        data: sorted.map(r => r.waist),
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        tension: 0.4
      },
      {
        label: '臀围 (cm)',
        data: sorted.map(r => r.hip),
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        tension: 0.4
      }
    ]
  }
})

const formatWeight = (weight) => {
  const w = Number(weight) || 0
  if (w >= 10000) {
    return (w / 1000).toFixed(1) + 'k'
  }
  return Math.round(w)
}

const saveRecord = async () => {
  if (!newRecord.value.weight) {
    alert('请输入体重')
    return
  }
  saving.value = true
  try {
    await bodyRecordApi.create(newRecord.value)
    showAddRecord.value = false
    loadRecords()
  } catch (e) {
    alert('保存失败')
  }
  saving.value = false
}

const loadRecords = async () => {
  try {
    const res = await bodyRecordApi.getAll()
    records.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadStats = async () => {
  try {
    const res = await statsApi.get()
    const data = res.data || {}
    stats.value = {
      totalCheckIns: Number(data.totalCheckIns) || 0,
      currentStreak: Number(data.currentStreak) || 0,
      longestStreak: Number(data.longestStreak) || 0,
      totalWeightLifted: Number(data.totalWeightLifted) || 0
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadRecords()
  loadStats()
})
</script>
