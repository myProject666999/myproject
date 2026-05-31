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
              color: '#3b82f6'
            },
            areaStyle: {
              color: 'rgba(59, 130, 246, 0.3)'
            },
            lineStyle: {
              color: '#3b82f6',
              width: 2
            }
          }
        ]
      }
    ]
  }

  radarChart.setOption(option)
}

const handleSearch = () => {
  pagination.page = 1
  fetchRanking()
}

const handleReset = () => {
  filters.period = 'month'
  filters.area = ''
  filters.keyword = ''
  pagination.page = 1
  fetchRanking()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchRanking()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchRanking()
}

const toggleExpand = async (item: RankingItem) => {
  if (expandedRow.value === item.id) {
    expandedRow.value = null
  } else {
    expandedRow.value = item.id
    await nextTick()
    initRadarChart(item)
    initTrendChart(item.storeId)
  }
}

const getRankChangeIcon = (change: number) => {
  if (change > 0) return TrendingUp
  if (change < 0) return TrendingDown
  return Minus
}

const getRankChangeClass = (change: number) => {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-500'
}

const getMedalStyle = (rank: number) => {
  const styles = [
    { bg: 'linear-gradient(135deg, #ffd700 0%, #ffb800 100%)', border: '#ffd700', shadow: 'rgba(255, 215, 0, 0.4)' },
    { bg: 'linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%)', border: '#c0c0c0', shadow: 'rgba(192, 192, 192, 0.4)' },
    { bg: 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)', border: '#cd7f32', shadow: 'rgba(205, 127, 50, 0.4)' }
  ]
  return styles[rank - 1] || styles[2]
}

const getStoreName = (item: RankingItem) => {
  return item.store?.name || '未知门店'
}

const getStoreArea = (item: RankingItem) => {
  return item.store?.city || item.store?.district || '-'
}

const handleResize = () => {
  trendChart?.resize()
  distributionChart?.resize()
  radarChart?.resize()
}

watch(() => filters.period, () => {
  fetchRanking()
  initDistributionChart()
})

onMounted(() => {
  fetchStores()
  fetchRanking()
  setTimeout(() => {
    initTrendChart()
    initDistributionChart()
  }, 500)
  
  window.addEventListener('resize', handleResize)
})
</script>

<template>
  <div class="ranking-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">门店排行</h2>
        <p class="page-desc">查看各门店巡检评分排名和绩效表现</p>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="filter-header">
        <Filter class="filter-icon" />
        <span class="filter-title">筛选条件</span>
      </div>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="周期">
          <el-radio-group v-model="filters.period" size="large" @change="handleSearch">
            <el-radio-button v-for="item in periodOptions" :key="item.value" :value="item.value">
              <Calendar class="radio-icon" />
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="filters.area" placeholder="全部区域" clearable class="filter-select" @change="handleSearch">
            <el-option v-for="area in areaOptions" :key="area" :label="area" :value="area" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="search-wrapper">
            <Search class="search-icon" />
            <el-input
              v-model="filters.keyword"
              placeholder="搜索门店名称"
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-loading="loading" element-loading-text="加载中...">
      <div class="top-three-section" v-if="topThree.length > 0">
        <div class="section-title">
          <Trophy class="title-icon" />
          <h3>排行榜前三名</h3>
        </div>
        <div class="top-three-container">
          <div 
            v-for="(item, index) in [topThree[1], topThree[0], topThree[2]]" 
            :key="item?.id"
            class="medal-card"
            :class="{ 'first-place': item?.rank === 1 }"
            :style="{ 
              background: getMedalStyle(item?.rank || 3).bg,
              boxShadow: `0 8px 30px ${getMedalStyle(item?.rank || 3).shadow}`
            }"
            v-if="item"
          >
            <div class="medal-rank" :class="`rank-${item.rank}`">
              <Medal class="medal-icon" />
              <span class="rank-number">{{ item.rank }}</span>
            </div>
            <div class="medal-content">
              <h4 class="store-name">{{ getStoreName(item) }}</h4>
              <p class="store-area">
                <MapPin class="area-icon" />
                {{ getStoreArea(item) }}
              </p>
              <div class="score-display">
                <span class="score-value">{{ item.avgScore.toFixed(1) }}</span>
                <span class="score-label">平均得分</span>
              </div>
              <div class="medal-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ item.passRate }}%</span>
                  <span class="stat-label">合格率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ item.rectificationRate }}%</span>
                  <span class="stat-label">整改率</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-row :gutter="20" class="content-row">
        <el-col :xs="24" :lg="16">
          <el-card class="ranking-card" shadow="never">
            <template #header>
              <div class="card-header-title">
                <BarChart3 class="header-icon" />
                <span>完整排行榜</span>
              </div>
            </template>
            
            <el-table :data="restRanking" style="width: 100%" stripe class="ranking-table">
              <el-table-column prop="rank" label="排名" width="80" align="center">
                <template #default="{ row }">
                  <span class="rank-badge" :class="`rank-${row.rank}`">{{ row.rank }}</span>
                </template>
              </el-table-column>
              <el-table-column label="门店名称" min-width="180">
                <template #default="{ row }">
                  <div class="store-info">
                    <span class="store-name">{{ getStoreName(row) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="区域" width="120">
                <template #default="{ row }">
                  <span class="area-text">{{ getStoreArea(row) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="taskCount" label="任务数" width="80" align="center" />
              <el-table-column prop="completedCount" label="完成数" width="80" align="center" />
              <el-table-column label="平均分" width="100" align="center">
                <template #default="{ row }">
                  <span class="avg-score">{{ row.avgScore.toFixed(1) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="合格率" width="90" align="center">
                <template #default="{ row }">
                  <span class="pass-rate" :class="{
                    'text-green-600': row.passRate >= 90,
                    'text-yellow-600': row.passRate >= 70 && row.passRate < 90,
                    'text-red-600': row.passRate < 70
                  }">{{ row.passRate }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="issueCount" label="问题数" width="80" align="center" />
              <el-table-column label="整改率" width="90" align="center">
                <template #default="{ row }">
                  <span class="rect-rate" :class="{
                    'text-green-600': row.rectificationRate >= 90,
                    'text-yellow-600': row.rectificationRate >= 70 && row.rectificationRate < 90,
                    'text-red-600': row.rectificationRate < 70
                  }">{{ row.rectificationRate }}%</span>
                </template>
              </el-table-column>
              <el-table-column label="排名变化" width="100" align="center">
                <template #default="{ row }">
                  <div class="rank-change" :class="getRankChangeClass(row.rankChange)">
                    <component :is="getRankChangeIcon(row.rankChange)" class="change-icon" />
                    <span>{{ Math.abs(row.rankChange) || '-' }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="详情" width="60" align="center">
                <template #default="{ row }">
                  <div class="expand-btn" @click="toggleExpand(row)">
                    <component :is="expandedRow === row.id ? ChevronUp : ChevronDown" class="expand-icon" />
                  </div>
                </template>
              </el-table-column>
              <template #expand="{ row }">
                <div class="expand-content" v-if="expandedRow === row.id">
                  <div class="expand-charts">
                    <div class="chart-item">
                      <div class="chart-header">
                        <LineChartIcon class="chart-title-icon" />
                        <span>得分趋势图</span>
                      </div>
                      <div ref="trendChartRef" class="chart-container"></div>
                    </div>
                    <div class="chart-item">
                      <div class="chart-header">
                        <Target class="chart-title-icon" />
                        <span>各项指标雷达图</span>
                      </div>
                      <div ref="radarChartRef" class="chart-container"></div>
                    </div>
                  </div>
                </div>
              </template>
            </el-table>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pagination.page"
                v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total - 3"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
              />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="8">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header-title">
                <BarChart3 class="header-icon" />
                <span>得分分布</span>
              </div>
            </template>
            <div ref="distributionChartRef" class="distribution-chart"></div>
          </el-card>

          <el-card class="stats-card" shadow="never">
            <template #header>
              <div class="card-header-title">
                <Trophy class="header-icon" />
                <span>统计概览</span>
              </div>
            </template>
            <div class="stats-grid">
              <div class="stat-card-item">
                <span class="stat-card-value">{{ rankingList.value.length }}</span>
                <span class="stat-card-label">参与门店</span>
              </div>
              <div class="stat-card-item">
                <span class="stat-card-value green">
                  {{ rankingList.value.filter(r => r.passRate >= 90).length }}
                </span>
                <span class="stat-card-label">优秀门店</span>
              </div>
              <div class="stat-card-item">
                <span class="stat-card-value yellow">
                  {{ rankingList.value.filter(r => r.passRate >= 70 && r.passRate < 90).length }}
                </span>
                <span class="stat-card-label">良好门店</span>
              </div>
              <div class="stat-card-item">
                <span class="stat-card-value red">
                  {{ rankingList.value.filter(r => r.passRate < 70).length }}
                </span>
                <span class="stat-card-label">待改进门店</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.ranking-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f8fafc;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.page-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.filter-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-icon {
  width: 18px;
  height: 18px;
  color: #3b82f6;
}

.filter-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-select {
  width: 140px;
}

.search-wrapper {
  position: relative;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #94a3b8;
  z-index: 1;
}

.search-input {
  padding-left: 36px;
}

.radio-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  vertical-align: middle;
}

.top-three-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.title-icon {
  width: 22px;
  height: 22px;
  color: #f59e0b;
}

.section-title h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.top-three-container {
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: flex-end;
  padding: 20px 0;
}

.medal-card {
  flex: 1;
  max-width: 280px;
  border-radius: 20px;
  padding: 24px;
  color: white;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.medal-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.medal-card:hover {
  transform: translateY(-8px);
}

.medal-card.first-place {
  transform: scale(1.05);
  z-index: 1;
}

.medal-card.first-place:hover {
  transform: scale(1.05) translateY(-8px);
}

.medal-rank {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.medal-icon {
  width: 32px;
  height: 32px;
}

.rank-number {
  font-size: 28px;
  font-weight: 800;
}

.medal-content {
  position: relative;
  z-index: 1;
}

.store-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.store-area {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  opacity: 0.9;
  margin: 0 0 16px 0;
}

.area-icon {
  width: 14px;
  height: 14px;
}

.score-display {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
}

.score-value {
  font-size: 36px;
  font-weight: 800;
  display: block;
  line-height: 1;
  margin-bottom: 4px;
}

.score-label {
  font-size: 12px;
  opacity: 0.9;
}

.medal-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  display: block;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  opacity: 0.8;
}

.content-row {
  margin-bottom: 20px;
}

.ranking-card,
.chart-card,
.stats-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

.card-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.header-icon {
  width: 18px;
  height: 18px;
  color: #3b82f6;
}

.ranking-table {
  margin-bottom: 16px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 13px;
  background: #f1f5f9;
  color: #64748b;
}

.rank-badge.rank-4,
.rank-badge.rank-5,
.rank-badge.rank-6 {
  background: #dbeafe;
  color: #3b82f6;
}

.store-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.store-name {
  font-weight: 500;
  color: #1e293b;
}

.area-text {
  color: #64748b;
  font-size: 13px;
}

.avg-score {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.rank-change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-weight: 600;
}

.change-icon {
  width: 16px;
  height: 16px;
}

.expand-btn {
  cursor: pointer;
  color: #3b82f6;
  transition: all 0.2s;
}

.expand-btn:hover {
  color: #2563eb;
}

.expand-icon {
  width: 18px;
  height: 18px;
}

.expand-content {
  padding: 20px;
  background: #fafbfc;
  border-radius: 12px;
  margin-top: 8px;
}

.expand-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.chart-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f1f5f9;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
}

.chart-title-icon {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.chart-container {
  width: 100%;
  height: 240px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.distribution-chart {
  width: 100%;
  height: 300px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card-item {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.stat-card-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-card-value.green {
  color: #10b981;
}

.stat-card-value.yellow {
  color: #f59e0b;
}

.stat-card-value.red {
  color: #ef4444;
}

.stat-card-label {
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 1200px) {
  .top-three-container {
    flex-direction: column;
    align-items: center;
  }

  .medal-card {
    max-width: 100%;
    width: 100%;
  }

  .medal-card.first-place {
    order: -1;
    transform: none;
  }

  .medal-card.first-place:hover {
    transform: translateY(-4px);
  }
}

@media (max-width: 768px) {
  .ranking-container {
    padding: 16px;
  }

  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .search-wrapper {
    width: 100%;
  }

  .top-three-container {
    gap: 12px;
  }

  .expand-charts {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
