<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <h3>体测数据</h3>
      <van-button type="primary" size="small" round @click="$router.push('/body-test-edit')">
        <van-icon name="plus" /> 新建
      </van-button>
    </div>

    <div class="chart-card" v-if="stats.dates?.length">
      <div class="card-title">数据趋势</div>
      <van-tabs v-model:active="activeChart" sticky>
        <van-tab title="体重" name="weight">
          <canvas ref="weightCanvas" height="200"></canvas>
        </van-tab>
        <van-tab title="BMI" name="bmi">
          <canvas ref="bmiCanvas" height="200"></canvas>
        </van-tab>
        <van-tab title="体脂" name="bodyFat">
          <canvas ref="bodyFatCanvas" height="200"></canvas>
        </van-tab>
      </van-tabs>
    </div>

    <van-loading v-if="loading" class="flex-center" style="padding: 40px" />
    <van-empty v-else-if="tests.length === 0" description="暂无体测数据" />
    <div v-else class="test-list">
      <div v-for="test in tests" :key="test.id" class="test-card">
        <div class="test-header flex-between">
          <span class="test-date">{{ test.testDate }}</span>
          <div>
            <van-button size="small" type="primary" plain round @click="editTest(test)">编辑</van-button>
          </div>
        </div>
        <div class="test-grid">
          <div class="test-item">
            <div class="test-value">{{ test.weight }} <small>kg</small></div>
            <div class="test-label">体重</div>
          </div>
          <div class="test-item">
            <div class="test-value">{{ test.bmi || '-' }}</div>
            <div class="test-label">BMI</div>
          </div>
          <div class="test-item">
            <div class="test-value">{{ test.bodyFat || '-' }}<small>%</small></div>
            <div class="test-label">体脂率</div>
          </div>
          <div class="test-item">
            <div class="test-value">{{ test.muscleMass || '-' }}<small>kg</small></div>
            <div class="test-label">肌肉量</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { bodyTestAPI } from '@/api'

Chart.register(...registerables)

export default {
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const tests = ref([])
    const stats = ref({ dates: [], weight: [], bmi: [], bodyFat: [], muscleMass: [] })
    const activeChart = ref('weight')
    const weightCanvas = ref(null)
    const bmiCanvas = ref(null)
    const bodyFatCanvas = ref(null)
    let charts = {}

    const loadData = async () => {
      loading.value = true
      try {
        const [testsRes, statsRes] = await Promise.all([
          bodyTestAPI.getAll(),
          bodyTestAPI.getStats()
        ])
        tests.value = testsRes.tests
        stats.value = statsRes.stats
        if (stats.value.dates?.length) {
          nextTick(renderCharts)
        }
      } finally {
        loading.value = false
      }
    }

    const createChart = (canvas, data, label, color) => {
      if (!canvas) return
      if (charts[label]) charts[label].destroy()
      charts[label] = new Chart(canvas, {
        type: 'line',
        data: {
          labels: stats.value.dates,
          datasets: [{
            label,
            data,
            borderColor: color,
            backgroundColor: color + '20',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: false } }
        }
      })
    }

    const renderCharts = () => {
      createChart(weightCanvas.value, stats.value.weight, '体重', '#1989fa')
      createChart(bmiCanvas.value, stats.value.bmi, 'BMI', '#07c160')
      createChart(bodyFatCanvas.value, stats.value.bodyFat, '体脂率', '#ff976a')
    }

    const editTest = (test) => {
      router.push(`/body-test-edit/${test.id}`)
    }

    onMounted(loadData)
    return { loading, tests, stats, activeChart, weightCanvas, bmiCanvas, bodyFatCanvas, editTest }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 16px;
}
.page-header h3 {
  font-size: 18px;
  margin: 0;
}
.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.chart-card .card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
.test-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}
.test-header {
  margin-bottom: 16px;
}
.test-date {
  font-size: 16px;
  font-weight: 600;
  color: #1989fa;
}
.test-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  text-align: center;
}
.test-item {
  padding: 8px;
}
.test-value {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}
.test-value small {
  font-size: 12px;
  color: #969799;
}
.test-label {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}
</style>
