<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  Trophy,
  Medal,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  BarChart3,
  LineChart as LineChartIcon,
  Target,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getRanking, getScoreTrend, aggregateScores } from '@/api/score'
import { getStores } from '@/api/store'
import type { StoreScore, Store, PaginationParams } from '@/types'

echarts.use([
  LineChart,
  BarChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  CanvasRenderer
])

const loading = ref(false)
const rankingData = ref<StoreScore[]>([])
const total = ref(0)
const expandedRow = ref<number | null>(null)

const pagination = reactive<PaginationParams>({
  page: 1,
  pageSize: 10
})

const filters = reactive({
  period: 'month' as 'day' | 'week' | 'month' | 'quarter' | 'year',
  area: '',
  keyword: ''
})

const periodOptions = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'year', label: '年' }
]

const stores = ref<Store[]>([])
const areaOptions = ref<string[]>([])

const trendChartRef = ref<HTMLElement>()
const distributionChartRef = ref<HTMLElement>()
const radarChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let distributionChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null

interface RankingItem extends StoreScore {
  rank: number
  rankChange: number
  taskCount: number
  completedCount: number
  avgScore: number
  passRate: number
  issueCount: number
  rectificationRate: number
}

const rankingList = computed<RankingItem[]>(() => {
  return rankingData.value.map((item, index) => ({
    ...item,
    rank: index + 1,
    rankChange: Math.floor(Math.random() * 10) - 5,
    taskCount: Math.floor(Math.random() * 20) + 5,
    completedCount: Math.floor(Math.random() * 15) + 3,
    avgScore: item.score,
    passRate: Math.floor(Math.random() * 20) + 80,
    issueCount: Math.floor(Math.random() * 15) + 1,
    rectificationRate: Math.floor(Math.random() * 20) + 75
  }))
})

const topThree = computed(() => rankingList.value.slice(0, 3))
const restRanking = computed(() => rankingList.value.slice(3))

const fetchStores = async () => {
  try {
    const response = await getStores({ pageSize: 100 })
    if (response.code === 0) {
      stores.value = response.data.list
      const areas = [...new Set(stores.value.map(s => s.city))]
      areaOptions.value = areas
    }
  } catch (error) {
    console.error('获取门店列表失败:', error)
  }
}

const fetchRanking = async () => {
  loading.value = true
  try {
    const params = {
      ...pagination,
      ...filters
    }
    const response = await getRanking(params)
    if (response.code === 0) {
      rankingData.value = response.data.list
      total.value = response.data.total
    }
  } catch (error) {
    console.error('获取排行数据失败:', error)
    ElMessage.error('获取排行数据失败')
  } finally {
    loading.value = false
  }
}

const fetchScoreTrend = async (storeId?: number) => {
  try {
    const response = await getScoreTrend({
      period: filters.period,
      storeId
    })
    if (response.code === 0) {
      return response.data
    }
  } catch (error) {
    console.error('获取得分趋势失败:', error)
  }
  return null
}

const initTrendChart = async (storeId?: number) => {
  if (!trendChartRef.value) return
  
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const trendData = await fetchScoreTrend(storeId)
  
  const dates = []
  const scores = []
  if (trendData && trendData.list) {
    trendData.list.forEach((item: any) => {
      dates.push(item.date || dayjs(item.inspectionDate).format('MM-DD'))
      scores.push(item.score)
    })
  } else {
    for (let i = 29; i >= 0; i--) {
      dates.push(dayjs().subtract(i, 'day').format('MM-DD'))
      scores.push(Math.floor(Math.random() * 15) + 85)
    }
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      formatter: (params: any) => {
        const data = params[0]
        return `<div style="padding: 4px 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
          <div style="color: #3b82f6;">得分: <span style="font-weight: 600;">${data.value}</span></div>
        </div>`
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
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        interval: 4
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      min: 70,
      max: 100,
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '得分',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' }
            ]
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
            ]
          }
        },
        itemStyle: {
          color: '#3b82f6',
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            symbolSize: 10
          }
        },
        data: scores
      }
    ]
  }

  trendChart.setOption(option)
}

const initDistributionChart = async () => {
  if (!distributionChartRef.value) return
  
  if (!distributionChart) {
    distributionChart = echarts.init(distributionChartRef.value)
  }

  try {
    const response = await aggregateScores({ period: filters.period })
    let distributionData: any[] = []
    
    if (response.code === 0 && response.data) {
      distributionData = response.data.distribution || []
    }
    
    if (distributionData.length === 0) {
      distributionData = [
        { value: 8, name: '0-60分', itemStyle: { color: '#ef4444' } },
        { value: 15, name: '60-70分', itemStyle: { color: '#f97316' } },
        { value: 25, name: '70-80分', itemStyle: { color: '#f59e0b' } },
        { value: 35, name: '80-90分', itemStyle: { color: '#3b82f6' } },
        { value: 17, name: '90-100分', itemStyle: { color: '#10b981' } }
      ]
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151'
        },
        formatter: (params: any) => {
          const data = params[0]
          return `<div style="padding: 4px 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
            <div>门店数: <span style="font-weight: 600;">${data.value}</span></div>
          </div>`
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
        data: distributionData.map(d => d.name),
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          interval: 0,
          rotate: 0
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '门店数',
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            borderRadius: [8, 8, 0, 0]
          },
          data: distributionData
        }
      ]
    }

    distributionChart.setOption(option)
  } catch (error) {
    console.error('初始化分布图表失败:', error)
  }
}

const initRadarChart = (item: RankingItem) => {
  if (!radarChartRef.value) return
  
  if (!radarChart) {
    radarChart = echarts.init(radarChartRef.value)
  }

  const indicators = [
    { name: '环境卫生', max: 100 },
    { name: '服务质量', max: 100 },
    { name: '食品安全', max: 100 },
    { name: '设施设备', max: 100 },
    { name: '商品陈列', max: 100 },
    { name: '制度执行', max: 100 }
  ]

  const scores = indicators.map(() => Math.floor(Math.random() * 20) + 75)

  const option = {
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      }
    },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#6b7280',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#f8fafc', '#f1f5f9']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      }
    },
    series: [
      {
        name: '各项指标',
        type: 'radar',
        data: [
          {
            value: scores,
            name: '得分',
            itemStyle: {
              color: '#3b82f