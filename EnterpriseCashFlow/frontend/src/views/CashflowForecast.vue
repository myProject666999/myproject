<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { formatAmount } from '../utils/format'
import { Calendar, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

const forecastDays = ref(30)
const forecastData = ref<any[]>([])
let cumulativeChart: echarts.ECharts | null = null

const scenarioParams = ref({
  receivableDelay: 0,
  payableAdvance: 0,
  extraIncome: 0,
  extraExpense: 0
})

const generateForecastData = () => {
  const data = []
  const today = new Date()
  let cumulative = 500000000
  
  for (let i = 0; i < forecastDays.value; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    
    const baseInflow = Math.floor(Math.random() * 20000000) + 10000000
    const baseOutflow = Math.floor(Math.random() * 18000000) + 8000000
    
    const inflow = baseInflow * (1 - scenarioParams.value.receivableDelay / 100) + scenarioParams.value.extraIncome * 100
    const outflow = baseOutflow * (1 + scenarioParams.value.payableAdvance / 100) + scenarioParams.value.extraExpense * 100
    const netFlow = inflow - outflow
    cumulative += netFlow
    
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      netFlow: Math.round(netFlow),
      cumulative: Math.round(cumulative)
    })
  }
  
  forecastData.value = data
}

const initCumulativeChart = () => {
  const chartDom = document.getElementById('cumulativeChart')
  if (!chartDom) return
  
  cumulativeChart = echarts.init(chartDom)
  updateChart()
}

const updateChart = () => {
  if (!cumulativeChart) return
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const item = params[0]
        const data = forecastData.value[item.dataIndex]
        return `${item.axisValue}<br/>
          累计资金: ¥${formatAmount(data.cumulative)}<br/>
          净流入: ¥${formatAmount(data.netFlow)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: forecastData.value.map(item => item.date),
      axisLabel: {
        interval: Math.floor(forecastDays.value / 10)
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `¥${(value / 100000000).toFixed(1)}亿`
      }
    },
    series: [
      {
        name: '累计资金',
        type: 'line',
        smooth: true,
        data: forecastData.value.map(item => item.cumulative),
        itemStyle: { color: '#2E6CF6' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(46, 108, 246, 0.3)' },
            { offset: 1, color: 'rgba(46, 108, 246, 0.05)' }
          ])
        },
        markLine: {
          silent: true,
          data: [{ yAxis: 200000000, lineStyle: { color: '#EF4444', type: 'dashed' } }]
        }
      }
    ]
  }
  
  cumulativeChart.setOption(option)
}

const totalInflow = computed(() => forecastData.value.reduce((sum, item) => sum + item.inflow, 0))
const totalOutflow = computed(() => forecastData.value.reduce((sum, item) => sum + item.outflow, 0))
const totalNetFlow = computed(() => totalInflow.value - totalOutflow.value)

const resetScenario = () => {
  scenarioParams.value = {
    receivableDelay: 0,
    payableAdvance: 0,
    extraIncome: 0,
    extraExpense: 0
  }
}

watch(forecastDays, () => {
  generateForecastData()
  updateChart()
})

watch(scenarioParams, () => {
  generateForecastData()
  updateChart()
}, { deep: true })

const handleResize = () => {
  cumulativeChart?.resize()
}

onMounted(() => {
  generateForecastData()
  setTimeout(() => {
    initCumulativeChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cumulativeChart?.dispose()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-800">预测设置</h3>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <Calendar class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600">预测天数:</span>
            <select
              v-model="forecastDays"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue"
            >
              <option :value="7">7天</option>
              <option :value="14">14天</option>
              <option :value="30">30天</option>
              <option :value="60">60天</option>
              <option :value="90">90天</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-4 bg-success-green/5 rounded-lg border border-success-green/20">
          <div class="flex items-center gap-2 mb-2">
            <TrendingUp class="w-5 h-5 text-success-green" />
            <span class="text-sm text-gray-600">预测期总流入</span>
          </div>
          <p class="text-2xl font-bold text-success-green font-mono-numbers">
            ¥{{ formatAmount(totalInflow) }}
          </p>
        </div>
        <div class="p-4 bg-warning-red/5 rounded-lg border border-warning-red/20">
          <div class="flex items-center gap-2 mb-2">
            <TrendingDown class="w-5 h-5 text-warning-red" />
            <span class="text-sm text-gray-600">预测期总流出</span>
          </div>
          <p class="text-2xl font-bold text-warning-red font-mono-numbers">
            ¥{{ formatAmount(totalOutflow) }}
          </p>
        </div>
        <div class="p-4 bg-primary-blue/5 rounded-lg border border-primary-blue/20">
          <div class="flex items-center gap-2 mb-2">
            <Minus class="w-5 h-5 text-primary-blue" />
            <span class="text-sm text-gray-600">预测期净流入</span>
          </div>
          <p class="text-2xl font-bold text-primary-blue font-mono-numbers">
            ¥{{ formatAmount(totalNetFlow) }}
          </p>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">累计资金趋势</h3>
        <div id="cumulativeChart" class="h-80"></div>
      </div>
      
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">情景模拟</h3>
          <button
            @click="resetScenario"
            class="flex items-center gap-1 text-sm text-primary-blue hover:text-primary-blue/80"
          >
            <RefreshCw class="w-4 h-4" />
            重置
          </button>
        </div>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              应收延迟: {{ scenarioParams.receivableDelay }}%
            </label>
            <input
              v-model.number="scenarioParams.receivableDelay"
              type="range"
              min="0"
              max="50"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-blue"
            />
            <p class="text-xs text-gray-500 mt-1">模拟应收账款延期回收比例</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              应付提前: {{ scenarioParams.payableAdvance }}%
            </label>
            <input
              v-model.number="scenarioParams.payableAdvance"
              type="range"
              min="0"
              max="50"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-blue"
            />
            <p class="text-xs text-gray-500 mt-1">模拟应付账款提前支付比例</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              额外收入(万元)
            </label>
            <input
              v-model.number="scenarioParams.extraIncome"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue font-mono-numbers"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              额外支出(万元)
            </label>
            <input
              v-model.number="scenarioParams.extraExpense"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue font-mono-numbers"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">每日资金明细</h3>
      <div class="overflow-x-auto max-h-96">
        <table class="w-full">
          <thead class="sticky top-0 bg-white">
            <tr class="bg-gray-50">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">流入</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">流出</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">净流入</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">累计余额</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(item, index) in forecastData" :key="index" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-800">{{ item.date }}</td>
              <td class="px-4 py-3 text-right text-success-green font-mono-numbers">
                ¥{{ formatAmount(item.inflow) }}
              </td>
              <td class="px-4 py-3 text-right text-warning-red font-mono-numbers">
                ¥{{ formatAmount(item.outflow) }}
              </td>
              <td class="px-4 py-3 text-right font-mono-numbers" :class="item.netFlow >= 0 ? 'text-success-green' : 'text-warning-red'">
                {{ item.netFlow >= 0 ? '+' : '' }}¥{{ formatAmount(item.netFlow) }}
              </td>
              <td class="px-4 py-3 text-right font-semibold text-gray-800 font-mono-numbers">
                ¥{{ formatAmount(item.cumulative) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
