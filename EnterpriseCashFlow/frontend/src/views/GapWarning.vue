<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  AlertTriangle,
  Shield,
  Clock,
  History,
  CheckCircle,
  Settings,
  X
} from 'lucide-vue-next'
import * as echarts from 'echarts'
import { warningApi } from '../api'

const activeTab = ref<'active' | 'threshold' | 'history'>('active')

const thresholds = ref<any[]>([])
const activeWarnings = ref<any[]>([])
const historyWarnings = ref<any[]>([])
const timelineData = ref<any[]>([])

const isEditModal = ref(false)
const editingThreshold = ref<any>(null)

const thresholdForm = ref({
  name: '',
  type: 'ABSOLUTE',
  absoluteAmount: 0,
  percentage: null,
  level: 'YELLOW',
  isEnabled: true
})

const levelColors: Record<string, string> = {
  YELLOW: '#F59E0B',
  ORANGE: '#F97316',
  RED: '#EF4444'
}

const levelLabels: Record<string, string> = {
  YELLOW: '黄色预警',
  ORANGE: '橙色预警',
  RED: '红色预警'
}

const formatAmount = (fen: number) => {
  if (!fen && fen !== 0) return '-'
  const yuan = fen / 100
  return '¥' + yuan.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadData = async () => {
  try {
    const [thresholdRes, activeRes, historyRes, timelineRes] = await Promise.all([
      warningApi.getThreshold(),
      warningApi.getActiveWarnings(),
      warningApi.getHistory(),
      warningApi.getTimeline()
    ])
    thresholds.value = thresholdRes.data?.data || []
    activeWarnings.value = activeRes.data?.data || []
    historyWarnings.value = historyRes.data?.data || []
    timelineData.value = timelineRes.data?.data || []
    
    renderTimelineChart()
  } catch (e) {
    console.error('加载预警数据失败', e)
    loadMockData()
  }
}

const loadMockData = () => {
  thresholds.value = [
    { id: 1, name: '黄色预警', type: 'ABSOLUTE', absoluteAmount: 20000000, level: 'YELLOW', isEnabled: true },
    { id: 2, name: '橙色预警', type: 'ABSOLUTE', absoluteAmount: 10000000, level: 'ORANGE', isEnabled: true },
    { id: 3, name: '红色预警', type: 'ABSOLUTE', absoluteAmount: 5000000, level: 'RED', isEnabled: true }
  ]
  
  activeWarnings.value = [
    { id: 1, triggerDate: '2026-06-15', gapDate: '2026-06-20', gapAmount: 8000000, level: 'ORANGE', thresholdName: '橙色预警', description: '预计6月20日资金将低于100万安全线' },
    { id: 2, triggerDate: '2026-06-10', gapDate: '2026-06-25', gapAmount: 15000000, level: 'RED', thresholdName: '红色预警', description: '预计6月25日资金将低于50万警戒线' }
  ]
  
  historyWarnings.value = [
    { id: 3, triggerDate: '2026-05-20', gapDate: '2026-05-28', gapAmount: 18000000, level: 'YELLOW', thresholdName: '黄色预警', resolvedAt: '2026-05-22 10:30', status: 'RESOLVED' }
  ]
  
  timelineData.value = [
    { date: '2026-06-15', balance: 35000000, threshold: 20000000, hasWarning: false },
    { date: '2026-06-18', balance: 25000000, threshold: 20000000, hasWarning: false },
    { date: '2026-06-20', balance: 8000000, threshold: 10000000, hasWarning: true },
    { date: '2026-06-22', balance: 12000000, threshold: 20000000, hasWarning: true },
    { date: '2026-06-25', balance: 3000000, threshold: 5000000, hasWarning: true },
    { date: '2026-06-28', balance: 28000000, threshold: 20000000, hasWarning: false }
  ]
  
  renderTimelineChart()
}

const renderTimelineChart = () => {
  const chartDom = document.getElementById('timeline-chart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const dates = timelineData.value.map(d => d.date.slice(5))
  const balances = timelineData.value.map(d => d.balance / 10000)
  const thresholds = timelineData.value.map(d => d.threshold / 10000)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>预计余额: ¥${data.value.toLocaleString()}万`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#94a3b8' } }
    },
    yAxis: {
      type: 'value',
      name: '余额(万元)',
      axisLine: { lineStyle: { color: '#94a3b8' } },
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } }
    },
    series: [
      {
        name: '预计余额',
        type: 'line',
        data: balances,
        smooth: true,
        lineStyle: { color: '#2E6CF6', width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(46, 108, 246, 0.3)' },
              { offset: 1, color: 'rgba(46, 108, 246, 0.05)' }
            ]
          }
        },
        markLine: {
          silent: true,
          data: [
            { yAxis: 200, lineStyle: { color: '#F59E0B', type: 'dashed' }, label: { formatter: '黄线' } },
            { yAxis: 100, lineStyle: { color: '#F97316', type: 'dashed' }, label: { formatter: '橙线' } },
            { yAxis: 50, lineStyle: { color: '#EF4444', type: 'dashed' }, label: { formatter: '红线' } }
          ]
        }
      }
    ]
  }
  
  myChart.setOption(option)
}

const openEditThreshold = (threshold?: any) => {
  if (threshold) {
    editingThreshold.value = threshold
    thresholdForm.value = { ...threshold }
  } else {
    editingThreshold.value = null
    thresholdForm.value = {
      name: '',
      type: 'ABSOLUTE',
      absoluteAmount: 0,
      percentage: null,
      level: 'YELLOW',
      isEnabled: true
    }
  }
  isEditModal.value = true
}

const saveThreshold = async () => {
  try {
    await warningApi.updateThreshold(thresholdForm.value)
    isEditModal.value = false
    loadData()
  } catch (e) {
    console.error('保存阈值失败', e)
    isEditModal.value = false
    loadData()
  }
}

const resolveWarning = async (id: number) => {
  try {
    await fetch(`/api/warnings/${id}/resolve`, { method: 'PUT' })
    loadData()
  } catch (e) {
    loadData()
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', () => {
    const chartDom = document.getElementById('timeline-chart')
    if (chartDom) echarts.getInstanceByDom(chartDom)?.resize()
  })
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">资金缺口预警</h1>
        <p class="text-gray-500 mt-1">监控资金安全线，提前预警资金缺口</p>
      </div>
      <button
        @click="openEditThreshold()"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <Settings class="w-4 h-4" />
        添加阈值
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">缺口时间轴</h3>
      <div id="timeline-chart" class="w-full h-64"></div>
    </div>

    <div class="flex gap-4 border-b border-gray-200">
      <button
        v-for="tab in [{ key: 'active', label: '活跃预警', icon: AlertTriangle }, { key: 'threshold', label: '预警阈值', icon: Shield }, { key: 'history', label: '历史记录', icon: History }]"
        :key="tab.key"
        @click="activeTab = tab.key as any"
        :class="[
          'flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition',
          activeTab === tab.key
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
        <span
          v-if="tab.key === 'active' && activeWarnings.length > 0"
          class="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full"
        >
          {{ activeWarnings.length }}
        </span>
      </button>
    </div>

    <div v-if="activeTab === 'active'" class="space-y-4">
      <div
        v-for="warning in activeWarnings"
        :key="warning.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition hover:shadow-md"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div
              class="p-3 rounded-xl"
              :style="{ backgroundColor: levelColors[warning.level] + '20' }"
            >
              <AlertTriangle class="w-6 h-6" :style="{ color: levelColors[warning.level] }" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :style="{ backgroundColor: levelColors[warning.level] + '20', color: levelColors[warning.level] }"
                >
                  {{ levelLabels[warning.level] }}
                </span>
                <span class="text-sm text-gray-500">{{ warning.thresholdName }}</span>
              </div>
              <p class="text-gray-800 font-medium mt-2">{{ warning.description }}</p>
              <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  <Clock class="w-4 h-4" />
                  触发日期: {{ warning.triggerDate }}
                </span>
                <span>预计缺口日期: {{ warning.gapDate }}</span>
                <span class="font-semibold" :style="{ color: levelColors[warning.level] }">
                  缺口: {{ formatAmount(warning.gapAmount) }}
                </span>
              </div>
            </div>
          </div>
          <button
            @click="resolveWarning(warning.id)"
            class="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <CheckCircle class="w-4 h-4" />
            标记已处理
          </button>
        </div>
      </div>

      <div v-if="activeWarnings.length === 0" class="text-center py-12 text-gray-500">
        <CheckCircle class="w-12 h-12 mx-auto text-green-500 mb-3" />
        <p>暂无活跃预警，资金状况良好</p>
      </div>
    </div>

    <div v-if="activeTab === 'threshold'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="t in thresholds"
        :key="t.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
      >
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-semibold text-gray-800">{{ t.name }}</h4>
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: levelColors[t.level] }"
          ></div>
        </div>
        <div class="text-2xl font-bold mb-2" :style="{ color: levelColors[t.level] }">
          {{ formatAmount(t.absoluteAmount) }}
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">
            {{ t.isEnabled ? '已启用' : '已禁用' }}
          </span>
          <button
            @click="openEditThreshold(t)"
            class="text-blue-600 text-sm hover:underline"
          >
            编辑
          </button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'history'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">预警等级</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">触发日期</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">缺口日期</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">缺口金额</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">解决时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="w in historyWarnings" :key="w.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <span
                class="px-2 py-1 text-xs font-medium rounded"
                :style="{ backgroundColor: levelColors[w.level] + '20', color: levelColors[w.level] }"
              >
                {{ levelLabels[w.level] }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ w.triggerDate }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ w.gapDate }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-800">{{ formatAmount(w.gapAmount) }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ w.resolvedAt }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">已解决</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ editingThreshold ? '编辑预警阈值' : '新增预警阈值' }}
          </h3>
          <button @click="isEditModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">阈值名称</label>
            <input
              v-model="thresholdForm.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：黄色预警"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">预警等级</label>
            <select
              v-model="thresholdForm.level"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="YELLOW">黄色预警</option>
              <option value="ORANGE">橙色预警</option>
              <option value="RED">红色预警</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">阈值类型</label>
            <select
              v-model="thresholdForm.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ABSOLUTE">固定金额</option>
              <option value="PERCENTAGE">月支出比例</option>
            </select>
          </div>
          <div v-if="thresholdForm.type === 'ABSOLUTE'">
            <label class="block text-sm font-medium text-gray-700 mb-1">最低资金安全线（元）</label>
            <input
              v-model.number="thresholdForm.absoluteAmount"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="20000000 = 20万元"
            />
            <p class="text-xs text-gray-500 mt-1">注意：系统以分为单位存储，请输入分（20万 = 20000000）</p>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="thresholdForm.isEnabled"
              type="checkbox"
              id="enabled"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="enabled" class="text-sm text-gray-700">启用此阈值</label>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="isEditModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="saveThreshold"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
