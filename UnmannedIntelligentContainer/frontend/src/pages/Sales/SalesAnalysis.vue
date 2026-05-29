<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">销售分析</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">查看销售数据统计和趋势分析</p>
      </div>
      <div class="flex items-center gap-3">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="w-64"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="refreshData" :icon="RefreshCw" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(stat, index) in statCards"
        :key="index"
        class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ stat.formatter ? stat.formatter(stat.value) : stat.value }}
            </p>
            <div class="flex items-center mt-2" v-if="stat.trend !== undefined">
              <span
                :class="[
                  'text-sm font-medium flex items-center',
                  stat.trend >= 0 ? 'text-green-600' : 'text-red-600'
                ]"
              >
                <TrendingUp v-if="stat.trend >= 0" class="w-4 h-4 mr-1" />
                <TrendingDown v-else class="w-4 h-4 mr-1" />
                {{ Math.abs(stat.trend).toFixed(1) }}%
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">较上期</span>
            </div>
          </div>
          <div :class="['p-3 rounded-lg', stat.bgColor]">
            <component :is="stat.icon" :class="['w-6 h-6', stat.iconColor]" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard
        title="货柜销售统计"
        subtitle="各货柜销售额对比"
        :loading="loading"
        :height="350"
        @retry="refreshData"
      >
        <div ref="containerChartRef" class="w-full h-full"></div>
      </ChartCard>

      <ChartCard
        title="销售趋势"
        subtitle="销售额与订单量变化趋势"
        :loading="loading"
        :height="350"
        @retry="refreshData"
      >
        <div ref="trendChartRef" class="w-full h-full"></div>
      </ChartCard>
    </div>

    <ChartCard
      title="商品销售排行"
      subtitle="按销售额排序 TOP 10"
      :loading="loading"
      :height="400"
      @retry="refreshData"
    >
      <el-table :data="productRankData" style="width: 100%" stripe>
        <el-table-column label="排名" width="80" align="center">
          <template #default="{ $index: index }">
            <span
              :class="[
                'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                index === 1 ? 'bg-gray-200 text-gray-700' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-600'
              ]"
            >
              {{ index + 1 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Package class="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ row.product_name }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ row.product_code }} · {{ row.category }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_quantity" label="销量" align="center" width="100">
          <template #default="{ row }">
            {{ formatNumber(row.total_quantity) }}
          </template>
        </el-table-column>
        <el-table-column prop="order_count" label="订单数" align="center" width="100">
          <template #default="{ row }">
            {{ formatNumber(row.order_count) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_sales" label="销售额" align="right" min-width="140">
          <template #default="{ row }">
            <span class="font-semibold text-blue-600">
              {{ formatCurrency(row.total_sales) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="占比" align="center" width="160">
          <template #default="{ row, $index: index }">
            <div class="flex items-center gap-2">
              <el-progress
                :percentage="getSalesPercentage(row.total_sales)"
                :show-text="false"
                :stroke-width="8"
                :color="getProgressColor(index)"
              />
              <span class="text-xs text-gray-500 dark:text-gray-400 w-10">
                {{ getSalesPercentage(row.total_sales) }}%
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </ChartCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Receipt
} from 'lucide-vue-next'
import ChartCard from '@/components/ChartCard.vue'
import {
  getSaleStatistics,
  getContainerSaleStats,
  getProductSaleStats,
  getSaleList
} from '@/api/sales'
import { formatCurrency, formatNumber, formatDate } from '@/utils/format'
import type {
  SaleStatistics,
  ContainerSaleStats,
  ProductSaleStats,
  SalesTrendItem,
  Sale
} from '@/types'

const loading = ref(false)

const dateRange = ref<[string, string] | null>(() => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return [formatDate(start), formatDate(end)]
})

const statistics = ref<SaleStatistics>({
  total_sales: 0,
  total_orders: 0,
  total_quantity: 0,
  average_order: 0
})

const containerStats = ref<ContainerSaleStats[]>([])
const productStats = ref<ProductSaleStats[]>([])
const trendData = ref<SalesTrendItem[]>([])

const containerChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
let containerChart: ECharts | null = null
let trendChart: ECharts | null = null

const totalSales = computed(() => {
  return productStats.value.reduce((sum, item) => sum + item.total_sales, 0)
})

const productRankData = computed(() => {
  return [...productStats.value]
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 10)
})

const statCards = computed(() => [
  {
    label: '总销售额',
    value: statistics.value.total_sales,
    formatter: formatCurrency,
    trend: 12.5,
    icon: DollarSign,
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    label: '订单总数',
    value: statistics.value.total_orders,
    formatter: formatNumber,
    trend: 8.3,
    icon: ShoppingCart,
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    label: '销售数量',
    value: statistics.value.total_quantity,
    formatter: formatNumber,
    trend: -2.1,
    icon: Package,
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    label: '平均客单价',
    value: statistics.value.average_order,
    formatter: formatCurrency,
    trend: 5.7,
    icon: Receipt,
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  }
])

const getSalesPercentage = (sales: number) => {
  if (totalSales.value === 0) return 0
  return Math.round((sales / totalSales.value) * 100)
}

const getProgressColor = (index: number) => {
  const colors = ['#eab308', '#6b7280', '#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#06b6d4', '#84cc16', '#f59e0b']
  return colors[index] || '#3b82f6'
}

const generateTrendData = (salesList: Sale[], startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  const dateMap = new Map<string, { sales: number; orders: number; quantity: number }>()
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dateStr = formatDate(date)
    dateMap.set(dateStr, { sales: 0, orders: 0, quantity: 0 })
  }
  
  for (const sale of salesList) {
    const dateStr = formatDate(sale.created_at)
    const existing = dateMap.get(dateStr)
    if (existing) {
      existing.sales += sale.total_amount
      existing.orders += 1
      existing.quantity += sale.quantity
    }
  }
  
  trendData.value = Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    ...data
  }))
}

const refreshData = async () => {
  loading.value = true
  try {
    const params = dateRange.value && dateRange.value.length === 2
      ? { start_date: dateRange.value[0], end_date: dateRange.value[1] }
      : undefined

    const [statsRes, containerRes, productRes, salesRes] = await Promise.all([
      getSaleStatistics(params),
      getContainerSaleStats(params),
      getProductSaleStats(params),
      getSaleList({
        ...params,
        page_size: 10000
      })
    ])

    statistics.value = statsRes
    containerStats.value = containerRes
    productStats.value = productRes
    
    if (params) {
      generateTrendData(salesRes.list, params.start_date!, params.end_date!)
    }

    await nextTick()
    renderContainerChart()
    renderTrendChart()
  } catch (error) {
    ElMessage.error('获取销售数据失败')
  } finally {
    loading.value = false
  }
}

const handleDateChange = () => {
  refreshData()
}

const renderContainerChart = () => {
  if (!containerChartRef.value) return
  
  if (!containerChart) {
    containerChart = echarts.init(containerChartRef.value)
  }

  const sortedData = [...containerStats.value].sort((a, b) => b.total_sales - a.total_sales)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        return `
          <div class="font-medium">${data.name}</div>
          <div>销售额: ${formatCurrency(data.value)}</div>
        `
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
      data: sortedData.map(item => item.container_name),
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万'
          }
          return value.toString()
        }
      }
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: sortedData.map(item => item.total_sales),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#60a5fa' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '50%'
      }
    ]
  }

  containerChart.setOption(option)
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = `<div class="font-medium mb-1">${params[0].axisValue}</div>`
        params.forEach((item: any) => {
          const value = item.seriesName === '销售额'
            ? formatCurrency(item.value)
            : formatNumber(item.value)
          result += `<div class="flex items-center justify-between gap-4">
            <span style="color:${item.color}">${item.marker} ${item.seriesName}</span>
            <span class="font-medium">${value}</span>
          </div>`
        })
        return result
      }
    },
    legend: {
      data: ['销售额', '订单量'],
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
      data: trendData.value.map(item => item.date.slice(5)),
      boundaryGap: false,
      axisLabel: {
        fontSize: 11
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        position: 'left',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 10000) {
              return (value / 10000).toFixed(1) + '万'
            }
            return value.toString()
          }
        }
      },
      {
        type: 'value',
        name: '订单量',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        yAxisIndex: 0,
        data: trendData.value.map(item => item.sales),
        smooth: true,
        itemStyle: {
          color: '#3b82f6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ])
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: '订单量',
        type: 'line',
        yAxisIndex: 1,
        data: trendData.value.map(item => item.orders),
        smooth: true,
        itemStyle: {
          color: '#10b981'
        },
        lineStyle: {
          width: 2,
          type: 'dashed'
        }
      }
    ]
  }

  trendChart.setOption(option)
}

const handleResize = () => {
  containerChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  refreshData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  containerChart?.dispose()
  trendChart?.dispose()
})
</script>
