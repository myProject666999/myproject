<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts/core'
import { LineChart, PieChart as EChartsPieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Calendar,
  FileText,
  BarChart3,
  PieChart
} from 'lucide-vue-next'
import type { InspectionTask } from '@/types/models'
import dayjs from 'dayjs'

echarts.use([
  LineChart,
  EChartsPieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  CanvasRenderer
])

const router = useRouter()

const loading = ref(true)
const lineChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()

let lineChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

interface StatCard {
  title: string
  value: string | number
  change: number
  icon: any
  gradient: string
}

interface QuickEntry {
  title: string
  desc: string
  icon: any
  path: string
  color: string
}

const statCards = ref<StatCard[]>([])
const quickEntries = ref<QuickEntry[]>([])
const recentTasks = ref<InspectionTask[]>([])

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const initMockData = () => {
  statCards.value = [
    {
      title: '今日任务数',
      value: 12,
      change: 8.3,
      icon: ClipboardList,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: '待处理问题数',
      value: 28,
      change: -5.2,
      icon: AlertTriangle,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: '本月平均得分',
      value: '92.5',
      change: 3.1,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: '门店合格率',
      value: '95.8%',
      change: 2.4,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ]

  quickEntries.value = [
    {
      title: '巡店任务',
      desc: '查看和管理巡店任务',
      icon: ClipboardList,
      path: '/tasks',
      color: '#3b82f6'
    },
    {
      title: '问题整改',
      desc: '处理待整改问题',
      icon: AlertTriangle,
      path: '/issues',
      color: '#f59e0b'
    },
    {
      title: '门店排行',
      desc: '查看门店评分排名',
      icon: BarChart3,
      path: '/ranking',
      color: '#10b981'
    },
    {
      title: '巡店报告',
      desc: '生成和查看报告',
      icon: FileText,
      path: '/reports',
      color: '#8b5cf6'
    }
  ]

  recentTasks.value = [
    {
      id: 1,
      name: '2026年5月一线城市巡检',
      templateId: 1,
      templateName: '标准门店巡检模板',
      storeIds: [1, 2, 3],
      stores: [
        { id: 1, name: '北京朝阳店', code: 'BJ001', address: '', city: '北京', district: '朝阳区', status: 1, createdAt: '', updatedAt: '' }
      ],
      inspectorIds: [1],
      inspectors: [{ id: 1, username: 'admin', realName: '张管理员', email: '', phone: '', role: 'admin', status: 1, createdAt: '', updatedAt: '' }],
      startDate: '2026-05-28',
      endDate: '2026-06-10',
      status: 'in_progress',
      progress: 65,
      createdAt: '2026-05-20',
      updatedAt: '2026-05-28'
    },
    {
      id: 2,
      name: '华东区域Q2季度检查',
      templateId: 2,
      templateName: '季度综合巡检模板',
      storeIds: [4, 5, 6],
      stores: [],
      inspectorIds: [2],
      inspectors: [],
      startDate: '2026-05-25',
      endDate: '2026-06-05',
      status: 'in_progress',
      progress: 40,
      createdAt: '2026-05-18',
      updatedAt: '2026-05-26'
    },
    {
      id: 3,
      name: '深圳区域食品安全专项',
      templateId: 3,
      templateName: '食品安全专项模板',
      storeIds: [7, 8],
      stores: [],
      inspectorIds: [3],
      inspectors: [],
      startDate: '2026-05-20',
      endDate: '2026-05-30',
      status: 'completed',
      progress: 100,
      createdAt: '2026-05-15',
      updatedAt: '2026-05-29'
    },
    {
      id: 4,
      name: '新店开业前检查',
      templateId: 1,
      templateName: '标准门店巡检模板',
      storeIds: [9],
      stores: [],
      inspectorIds: [1],
      inspectors: [],
      startDate: '2026-06-01',
      endDate: '2026-06-03',
      status: 'pending',
      progress: 0,
      createdAt: '2026-05-25',
      updatedAt: '2026-05-25'
    },
    {
      id: 5,
      name: '广州区域服务质量检查',
      templateId: 4,
      templateName: '服务质量检查模板',
      storeIds: [10, 11, 12],
      stores: [],
      inspectorIds: [2],
      inspectors: [],
      startDate: '2026-05-15',
      endDate: '2026-05-25',
      status: 'completed',
      progress: 100,
      createdAt: '2026-05-10',
      updatedAt: '2026-05-24'
    }
  ]
}

const initLineChart = () => {
  if (!lineChartRef.value) return

  lineChart = echarts.init(lineChartRef.value)

  const dates = []
  const scores = []
  for (let i = 29; i >= 0; i--) {
    dates.push(dayjs().subtract(i, 'day').format('MM-DD'))
    scores.push(Math.floor(Math.random() * 15) + 85)
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

  lineChart.setOption(option)
}

const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      formatter: (params: any) => {
        return `<div style="padding: 4px 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div>数量: <span style="font-weight: 600;">${params.value}</span></div>
          <div>占比: <span style="font-weight: 600;">${params.percent}%</span></div>
        </div>`
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 16,
      textStyle: {
        color: '#6b7280',
        fontSize: 13,
        padding: [0, 0, 0, 8]
      },
      formatter: (name: string) => {
        return name
      }
    },
    series: [
      {
        name: '问题类型',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '环境卫生', itemStyle: { color: '#3b82f6' } },
          { value: 28, name: '服务质量', itemStyle: { color: '#10b981' } },
          { value: 22, name: '食品安全', itemStyle: { color: '#f59e0b' } },
          { value: 18, name: '设施设备', itemStyle: { color: '#8b5cf6' } },
          { value: 12, name: '商品陈列', itemStyle: { color: '#ef4444' } },
          { value: 8, name: '其他问题', itemStyle: { color: '#6b7280' } }
        ]
      }
    ]
  }

  pieChart.setOption(option)
}

const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  initMockData()
  setTimeout(() => {
    loading.value = false
    initLineChart()
    initPieChart()
  }, 800)

  window.addEventListener('resize', handleResize)
})
</script>

<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h2 class="page-title">数据概览</h2>
      <p class="page-desc">欢迎使用连锁门店巡检系统</p>
    </div>

    <template v-if="loading">
      <el-row :gutter="20" class="mb-6">
        <el-col :xs="24" :sm="12" :lg="6" v-for="i in 4" :key="i">
          <el-skeleton :rows="3" animated>
            <template #template>
              <div class="stat-card-skeleton"></div>
            </template>
          </el-skeleton>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mb-6">
        <el-col :xs="24" :sm="12" :lg="6" v-for="i in 4" :key="i">
          <el-skeleton :rows="3" animated>
            <template #template>
              <div class="quick-card-skeleton"></div>
            </template>
          </el-skeleton>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mb-6">
        <el-col :xs="24" :lg="14">
          <el-skeleton :rows="8" animated />
        </el-col>
        <el-col :xs="24" :lg="10">
          <el-skeleton :rows="8" animated />
        </el-col>
      </el-row>

      <el-skeleton :rows="6" animated />
    </template>

    <template v-else>
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :lg="6" v-for="(card, index) in statCards" :key="index">
          <div class="stat-card" :style="{ background: card.gradient }" @click="navigateTo(quickEntries[index]?.path || '/')">
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <component :is="card.icon" class="stat-icon" />
              </div>
              <div class="stat-info">
                <p class="stat-title">{{ card.title }}</p>
                <p class="stat-value">{{ card.value }}</p>
                <div class="stat-change" :class="{ positive: card.change > 0, negative: card.change < 0 }">
                  <component :is="card.change > 0 ? TrendingUp : TrendingUp" class="change-icon" :style="{ transform: card.change < 0 ? 'rotate(180deg)' : 'none' }" />
                  <span>{{ Math.abs(card.change) }}%</span>
                  <span class="change-label">环比</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="section-title">
        <h3>快捷入口</h3>
      </div>

      <el-row :gutter="20" class="quick-row">
        <el-col :xs="24" :sm="12" :lg="6" v-for="(entry, index) in quickEntries" :key="index">
          <div class="quick-card" @click="navigateTo(entry.path)">
            <div class="quick-icon" :style="{ background: entry.color + '15', color: entry.color }">
              <component :is="entry.icon" class="icon" />
            </div>
            <div class="quick-info">
              <h4 class="quick-title">{{ entry.title }}</h4>
              <p class="quick-desc">{{ entry.desc }}</p>
            </div>
            <ArrowRight class="quick-arrow" />
          </div>
        </el-col>
      </el-row>

      <div class="section-title">
        <h3>数据分析</h3>
      </div>

      <el-row :gutter="20" class="charts-row">
        <el-col :xs="24" :lg="14">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <TrendingUp class="header-icon" />
                  近30天得分趋势
                </span>
              </div>
            </template>
            <div ref="lineChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="10">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <PieChart class="header-icon" />
                  问题类型分布
                </span>
              </div>
            </template>
            <div ref="pieChartRef" class="chart-container pie-chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="task-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <ClipboardList class="header-icon" />
              最近任务
            </span>
            <el-button type="primary" link @click="navigateTo('/tasks')">
              查看全部 <ArrowRight class="inline-icon" />
            </el-button>
          </div>
        </template>
        <el-table :data="recentTasks" style="width: 100%" stripe>
          <el-table-column prop="name" label="任务名称" min-width="200">
            <template #default="{ row }">
              <span class="task-name">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="templateName" label="模板" min-width="160">
            <template #default="{ row }">
              <el-tag size="small" type="info" effect="plain">{{ row.templateName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间范围" min-width="180">
            <template #default="{ row }">
              <div class="date-range">
                <Calendar class="date-icon" />
                <span>{{ formatDate(row.startDate) }} ~ {{ formatDate(row.endDate) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" min-width="140">
            <template #default="{ row }">
              <div class="progress-wrapper">
                <el-progress 
                  :percentage="row.progress" 
                  :stroke-width="8"
                  :color="row.progress === 100 ? '#10b981' : '#3b82f6'"
                  :format="(val) => `${val}%`"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" effect="light" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="primary" link @click="navigateTo(`/tasks/${row.id}`)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f8fafc;
}

.page-header {
  margin-bottom: 24px;
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

.section-title {
  margin: 24px 0 16px 0;
}

.section-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.stats-row {
  margin-bottom: 8px;
}

.stat-card {
  border-radius: 16px;
  padding: 24px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 140px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  width: 24px;
  height: 24px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 13px;
  opacity: 0.9;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.9;
}

.stat-change.positive {
  color: #86efac;
}

.stat-change.negative {
  color: #fecaca;
}

.change-icon {
  width: 14px;
  height: 14px;
}

.change-label {
  opacity: 0.7;
}

.stat-card-skeleton,
.quick-card-skeleton {
  height: 140px;
  border-radius: 16px;
}

.quick-row {
  margin-bottom: 8px;
}

.quick-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-icon .icon {
  width: 24px;
  height: 24px;
}

.quick-info {
  flex: 1;
}

.quick-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.quick-desc {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.quick-arrow {
  width: 18px;
  height: 18px;
  color: #cbd5e1;
  transition: all 0.3s ease;
}

.quick-card:hover .quick-arrow {
  color: #3b82f6;
  transform: translateX(4px);
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
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

.inline-icon {
  width: 14px;
  height: 14px;
  margin-left: 2px;
}

.chart-container {
  width: 100%;
  height: 320px;
  padding: 8px;
}

.chart-container.pie-chart {
  height: 320px;
}

.task-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.task-name {
  font-weight: 500;
  color: #1e293b;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 13px;
}

.date-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.progress-wrapper {
  padding: 0 8px;
}

:deep(.el-table th) {
  background: #f8fafc !important;
  color: #64748b;
  font-weight: 500;
}

:deep(.el-table tr:hover > td) {
  background: #f1f5f9 !important;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .stat-value {
    font-size: 28px;
  }

  .chart-container {
    height: 280px;
  }

  .chart-container.pie-chart {
    height: 280px;
  }
}
</style>
