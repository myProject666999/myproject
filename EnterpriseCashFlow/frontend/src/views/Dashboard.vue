<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { formatAmount } from '../utils/format'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  Plus,
  FileText,
  BarChart3
} from 'lucide-vue-next'

const overviewData = ref({
  totalBalance: 568923456,
  totalReceivable: 125678900,
  totalPayable: 89456700,
  netFlow: 36222200
})

const trendData = ref<any[]>([])
const dueReminders = ref<any[]>([])
let trendChart: echarts.ECharts | null = null

const generateMockData = () => {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      inflow: Math.floor(Math.random() * 50000000) + 20000000,
      outflow: Math.floor(Math.random() * 40000000) + 15000000
    })
  }
  trendData.value = data

  dueReminders.value = [
    { id: 1, type: 'receivable', title: 'ABC公司货款', amount: 25000000, dueDate: '2026-06-01', daysLeft: 1 },
    { id: 2, type: 'payable', title: '供应商X采购款', amount: 18500000, dueDate: '2026-06-02', daysLeft: 2 },
    { id: 3, type: 'receivable', title: 'DEF项目回款', amount: 42000000, dueDate: '2026-06-03', daysLeft: 3 }
  ]
}

const initTrendChart = () => {
  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return
  
  trendChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: ¥${formatAmount(item.value)}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['流入', '流出'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.value.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `¥${(value / 1000000).toFixed(0)}M`
      }
    },
    series: [
      {
        name: '流入',
        type: 'line',
        smooth: true,
        data: trendData.value.map(item => item.inflow),
        itemStyle: { color: '#10B981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
          ])
        }
      },
      {
        name: '流出',
        type: 'line',
        smooth: true,
        data: trendData.value.map(item => item.outflow),
        itemStyle: { color: '#EF4444' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
          ])
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

const handleResize = () => {
  trendChart?.resize()
}

onMounted(() => {
  generateMockData()
  setTimeout(() => {
    initTrendChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">账户总余额</p>
            <p class="text-2xl font-bold text-gray-800 font-mono-numbers mt-2">
              ¥{{ formatAmount(overviewData.totalBalance) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center">
            <Wallet class="w-6 h-6 text-primary-blue" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">应收账款总额</p>
            <p class="text-2xl font-bold text-success-green font-mono-numbers mt-2">
              ¥{{ formatAmount(overviewData.totalReceivable) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-success-green/10 rounded-lg flex items-center justify-center">
            <ArrowUpRight class="w-6 h-6 text-success-green" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">应付账款总额</p>
            <p class="text-2xl font-bold text-warning-red font-mono-numbers mt-2">
              ¥{{ formatAmount(overviewData.totalPayable) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-warning-red/10 rounded-lg flex items-center justify-center">
            <ArrowDownRight class="w-6 h-6 text-warning-red" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">近30日净流入</p>
            <p class="text-2xl font-bold text-primary-blue font-mono-numbers mt-2">
              ¥{{ formatAmount(overviewData.netFlow) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center">
            <TrendingUp class="w-6 h-6 text-primary-blue" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">近30日资金趋势</h3>
        <div id="trendChart" class="h-80"></div>
      </div>
      
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">近3日到期提醒</h3>
          <Clock class="w-5 h-5 text-warning-orange" />
        </div>
        <div class="space-y-4">
          <div
            v-for="item in dueReminders"
            :key="item.id"
            class="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium text-gray-800">{{ item.title }}</p>
                <p class="text-sm text-gray-500 mt-1">到期日: {{ item.dueDate }}</p>
              </div>
              <span
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  item.type === 'receivable' ? 'bg-success-green/10 text-success-green' : 'bg-warning-red/10 text-warning-red'
                ]"
              >
                {{ item.type === 'receivable' ? '应收' : '应付' }}
              </span>
            </div>
            <div class="flex items-center justify-between mt-3">
              <span class="text-lg font-bold font-mono-numbers" :class="item.type === 'receivable' ? 'text-success-green' : 'text-warning-red'">
                ¥{{ formatAmount(item.amount) }}
              </span>
              <span class="text-sm text-warning-orange">{{ item.daysLeft }}天后到期</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">快捷操作</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button class="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-primary-blue hover:bg-primary-blue/5 transition-all group">
          <div class="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
            <Plus class="w-6 h-6 text-primary-blue" />
          </div>
          <span class="mt-3 text-sm font-medium text-gray-700">新增应收</span>
        </button>
        <button class="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-primary-blue hover:bg-primary-blue/5 transition-all group">
          <div class="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
            <Plus class="w-6 h-6 text-primary-blue" />
          </div>
          <span class="mt-3 text-sm font-medium text-gray-700">新增应付</span>
        </button>
        <button class="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-primary-blue hover:bg-primary-blue/5 transition-all group">
          <div class="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
            <BarChart3 class="w-6 h-6 text-primary-blue" />
          </div>
          <span class="mt-3 text-sm font-medium text-gray-700">现金流预测</span>
        </button>
        <button class="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-primary-blue hover:bg-primary-blue/5 transition-all group">
          <div class="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
            <FileText class="w-6 h-6 text-primary-blue" />
          </div>
          <span class="mt-3 text-sm font-medium text-gray-700">生成日报</span>
        </button>
      </div>
    </div>
  </div>
</template>
