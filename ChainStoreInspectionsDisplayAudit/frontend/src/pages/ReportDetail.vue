<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts/core'
import {
  GaugeChart,
  RadarChart,
  PieChart as EChartsPieChart,
  BarChart,
  LineChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  FileText,
  Download,
  Printer,
  ArrowLeft,
  Home,
  ChevronRight,
  Calendar,
  User,
  Store,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Clock,
  BarChart3,
  PieChart,
  ListChecks,
  AlertCircle,
  CheckSquare,
  XCircle
} from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getReport } from '@/api/report'
import type { InspectionReport, InspectionItemRecord, Issue } from '@/types'

echarts.use([
  GaugeChart,
  RadarChart,
  EChartsPieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  CanvasRenderer
])

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const reportId = computed(() => Number(route.params.id))
const report = ref<InspectionReport | null>(null)

const scoreGaugeRef = ref<HTMLElement>()
const radarChartRef = ref<HTMLElement>()
const issueLevelPieRef = ref<HTMLElement>()
const issueTypeBarRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

let scoreGaugeChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null
let issueLevelPieChart: echarts.ECharts | null = null
let issueTypeBarChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

interface SummaryStats {
  totalScore: number
  avgScore: number
  passRate: number
  issueCount: number
  resolvedCount: number
  rectificationRate: number
}

interface CategoryScore {
  name: string
  score: number
  fullScore: number
  items: InspectionItemRecord[]
}

const summaryStats = reactive<SummaryStats>({
  totalScore: 0,
  avgScore: 0,
  passRate: 0,
  issueCount: 0,
  resolvedCount: 0,
  rectificationRate: 0
})

const categoryScores = ref<CategoryScore[]>([])
const issues = ref<Issue[]>([])
const activeCategory = ref<number | null>(null)

const reportInfo = computed(() => {
  if (!report.value) return null
  const record = report.value.record
  return {
    name: getReportName(report.value),
    reportNo: `RPT${dayjs(report.value.generatedAt).format('YYYYMMDD')}${String(report.value.id).padStart(6, '0')}`,
    type: getReportType(report.value),
    typeLabel: getTypeLabel(getReportType(report.value)),
    generatedAt: formatDate(report.value.generatedAt),
    creatorName: record?.inspector?.realName || '系统管理员',
    storeName: record?.store?.name || '全部门店',
    templateName: record?.templateName || '标准巡检模板',
    inspectionDate: record?.endTime ? formatDate(record.endTime) : '-'
  }
})

const getReportName = (item: InspectionReport): string => {
  const typeMap: Record<string, string> = {
    summary: '巡检汇总报告',
    detail: '巡检详情报告',
    issue: '问题分析报告'
  }
  const baseName = typeMap[item.type] || '巡检报告'
  const date = dayjs(item.generatedAt).format('YYYY年MM月DD日')
  return `${date} - ${baseName}`
}

const getReportType = (item: InspectionReport): 'task' | 'store' | 'summary' => {
  if (item.type === 'summary') return 'summary'
  if (item.record?.taskId) return 'task'
  return 'store'
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    task: '任务报告',
    store: '门店报告',
    summary: '汇总报告'
  }
  return map[type] || type
}

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    task: 'primary',
    store: 'success',
    summary: 'warning'
  }
  return map[type] || 'info'
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getIssueLevelLabel = (level: string) => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return map[level] || level
}

const getIssueLevelColor = (level: string) => {
  const map: Record<string, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444'
  }
  return map[level] || '#6b7280'
}

const getIssueStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    rectifying: '整改中',
    resolved: '已解决',
    verified: '已验证'
  }
  return map[status] || status
}

const getIssueStatusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: '#ef4444',
    rectifying: '#f59e0b',
    resolved: '#10b981',
    verified: '#3b82f6'
  }
  return map[status] || '#6b7280'
}

const fetchReport = async () => {
  loading.value = true
  try {
    const response = await getReport(reportId.value)
    if (response.code === 0) {
      report.value = response.data
      initMockData()
      await nextTick()
      initCharts()
    }
  } catch (error) {
    console.error('获取报告详情失败:', error)
    ElMessage.error('获取报告详情失败')
  } finally {
    loading.value = false
  }
}

const initMockData = () => {
  summaryStats.totalScore = report.value?.record?.totalScore || Math.floor(Math.random() * 20) + 80
  summaryStats.avgScore = Math.floor(Math.random() * 15) + 82
  summaryStats.passRate = Math.floor(Math.random() * 20) + 80
  summaryStats.issueCount = report.value?.record?.issues?.length || Math.floor(Math.random() * 15) + 3
  summaryStats.resolvedCount = Math.floor(summaryStats.issueCount * (Math.random() * 0.4 + 0.5))
  summaryStats.rectificationRate = Math.floor((summaryStats.resolvedCount / summaryStats.issueCount) * 100)

  const categories = ['环境卫生', '服务质量', '食品安全', '设施设备', '商品陈列', '制度执行']
  categoryScores.value = categories.map(name => ({
    name,
    score: Math.floor(Math.random() * 20) + 75,
    fullScore: 100,
    items: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
      id: i,
      recordId: reportId.value,
      itemId: i + 1,
      itemTitle: `${name}检查项${i + 1}`,
      itemType: 'score',
      value: String(Math.floor(Math.random() * 5) + 75),
      score: Math.floor(Math.random() * 5) + 75,
      fullScore: 100,
      remark: Math.random() > 0.7 ? '需要改进' : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  }))

  const levels: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical']
  const statuses: Array<'pending' | 'rectifying' | 'resolved' | 'verified'> = ['pending', 'rectifying', 'resolved', 'verified']
  const issueTypes = ['环境卫生', '服务质量', '食品安全', '设施设备', '商品陈列', '其他']

  issues.value = Array.from({ length: summaryStats.issueCount }, (_, i) => ({
    id: i + 1,
    recordId: reportId.value,
    itemId: i + 1,
    description: `${['地面清洁不彻底', '员工服务态度待提升', '食品保质期检查不到位', '设备维护记录缺失', '商品陈列不规范'][i % 5]}问题${i + 1}`,
    level: levels[Math.floor(Math.random() * levels.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    deadline: dayjs().add(Math.floor(Math.random() * 7) + 1, 'day').format('YYYY-MM-DD'),
    handlerId: 1,
    createdAt: dayjs().subtract(Math.floor(Math.random() * 10), 'day').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(Math.floor(Math.random() * 5), 'day').format('YYYY-MM-DD HH:mm:ss')
  }))
}

const initScoreGauge = () => {
  if (!scoreGaugeRef.value) return
  if (!scoreGaugeChart) {
    scoreGaugeChart = echarts.init(scoreGaugeRef.value)
  }

  const score = summaryStats.totalScore
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: '90%',
        center: ['50%', '60%'],
        itemStyle: {
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
        progress: {
          show: true,
          width: 20,
          roundCap: true
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#f1f5f9']]
          },
          roundCap: true
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '-5%'],
          fontSize: 48,
          fontWeight: '700',
          formatter: '{value}',
          color: '#1e293b'
        },
        data: [
          {
            value: score
          }
        ]
      }
    ]
  }

  scoreGaugeChart.setOption(option)
}

const initRadarChart = () => {
  if (!radarChartRef.value) return
  if (!radarChart) {
    radarChart = echarts.init(radarChartRef.value)
  }

  const indicators = categoryScores.value.map(c => ({
    name: c.name,
    max: 100
  }))

  const scores = categoryScores.value.map(c => c.score)

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
      radius: '65%',
      center: ['50%', '50%'],
      axisName: {
        color: '#64748b',
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
        name: '各项得分',
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

const initIssueLevelPie = () => {
  if (!issueLevelPieRef.value) return
  if (!issueLevelPieChart) {
    issueLevelPieChart = echarts.init(issueLevelPieRef.value)
  }

  const levelCounts: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  }
  issues.value.forEach(issue => {
    levelCounts[issue.level]++
  })

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
      itemGap: 12,
      textStyle: {
        color: '#64748b',
        fontSize: 12,
        padding: [0, 0, 0, 6]
      }
    },
    series: [
      {
        name: '问题等级',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
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
          { value: levelCounts.critical, name: '严重', itemStyle: { color: '#ef4444' } },
          { value: levelCounts.high, name: '高', itemStyle: { color: '#f97316' } },
          { value: levelCounts.medium, name: '中', itemStyle: { color: '#f59e0b' } },
          { value: levelCounts.low, name: '低', itemStyle: { color: '#10b981' } }
        ]
      }
    ]
  }

  issueLevelPieChart.setOption(option)
}

const initIssueTypeBar = () => {
  if (!issueTypeBarRef.value) return
  if (!issueTypeBarChart) {
    issueTypeBarChart = echarts.init(issueTypeBarRef.value)
  }

  const typeCounts: Record<string, number> = {}
  const types = ['环境卫生', '服务质量', '食品安全', '设施设备', '商品陈列', '其他']
  types.forEach(t => { typeCounts[t] = 0 })
  issues.value.forEach((_, i) => {
    typeCounts[types[i % types.length]]++
  })

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280']

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
          <div>数量: <span style="font-weight: 600;">${data.value}</span></div>
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
      data: types,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#64748b',
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
        color: '#64748b',
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
        name: '问题数',
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0]
        },
        data: types.map((t, i) => ({
          value: typeCounts[t],
          itemStyle: { color: colors[i] }
        }))
      }
    ]
  }

  issueTypeBarChart.setOption(option)
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const dates = []
  const scores = []
  for (let i = 11; i >= 0; i--) {
    dates.push(dayjs().subtract(i, 'month').format('YYYY-MM'))
    scores.push(Math.floor(Math.random() * 15) + 82)
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
        color: '#64748b',
        fontSize: 11
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
        color: '#64748b',
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

const initCharts = () => {
  initScoreGauge()
  initRadarChart()
  initIssueLevelPie()
  initIssueTypeBar()
  initTrendChart()
}

const handleResize = () => {
  scoreGaugeChart?.resize()
  radarChart?.resize()
  issueLevelPieChart?.resize()
  issueTypeBarChart?.resize()
  trendChart?.resize()
}

const handleBack = () => {
  router.back()
}

const handlePrint = () => {
  window.print()
}

const handleExport = () => {
  ElMessage.success('正在导出PDF...')
}

const isItemPassed = (item: InspectionItemRecord) => {
  return item.score >= 60
}

onMounted(() => {
  fetchReport()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  scoreGaugeChart?.dispose()
  radarChart?.dispose()
  issueLevelPieChart?.dispose()
  issueTypeBarChart?.dispose()
  trendChart?.dispose()
})
</script>

<template>
  <div class="report-detail-container" v-loading="loading" element-loading-text="加载中...">
    <div class="print-hide">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item @click="router.push('/')">
          <Home class="breadcrumb-icon" />
          首页
        </el-breadcrumb-item>
        <el-breadcrumb-item @click="router.push('/reports')">
          <FileText class="breadcrumb-icon" />
          巡店报告
        </el-breadcrumb-item>
        <el-breadcrumb-item>报告详情</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="action-bar">
        <el-button @click="handleBack">
          <ArrowLeft class="btn-icon" />
          返回列表
        </el-button>
        <div class="action-right">
          <el-button @click="handleExport">
            <Download class="btn-icon" />
            导出PDF
          </el-button>
          <el-button type="primary" @click="handlePrint">
            <Printer class="btn-icon" />
            打印
          </el-button>
        </div>
      </div>
    </div>

    <template v-if="reportInfo">
      <div class="report-header">
        <div class="header-left">
          <h1 class="report-title">{{ reportInfo.name }}</h1>
          <div class="header-meta">
            <span class="report-no">
              <FileText class="meta-icon" />
              编号：{{ reportInfo.reportNo }}
            </span>
            <el-tag :type="getTypeTagType(reportInfo.type)" effect="light" size="small" class="type-tag">
              {{ reportInfo.typeLabel }}
            </el-tag>
          </div>
        </div>
        <div class="header-right">
          <div class="meta-row">
            <span class="meta-item">
              <Calendar class="meta-icon" />
              生成时间：{{ reportInfo.generatedAt }}
            </span>
            <span class="meta-item">
              <User class="meta-icon" />
              创建人：{{ reportInfo.creatorName }}
            </span>
          </div>
          <div class="meta-row">
            <span class="meta-item">
              <Store class="meta-icon" />
              门店：{{ reportInfo.storeName }}
            </span>
            <span class="meta-item">
              <ListChecks class="meta-icon" />
              模板：{{ reportInfo.templateName }}
            </span>
          </div>
        </div>
      </div>

      <div class="section-title print-section-title">
        <Target class="title-icon" />
        <h3>报告摘要</h3>
      </div>

      <el-row :gutter="16" class="summary-row">
        <el-col :xs="12" :sm="8" :lg="4">
          <div class="summary-card score">
            <div class="card-icon">
              <Target class="icon" />
            </div>
            <div class="card-info">
              <span class="card-value">{{ summaryStats.totalScore }}</span>
              <span class="card-label">总分</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :lg="4">
          <div class="summary-card avg">
            <div class="card-icon">
              <TrendingUp class="icon" />
            </div>
            <div class="card-info">
              <span class="card-value">{{ summaryStats.avgScore }}</span>
              <span class="card-label">平均分</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :lg="4">
          <div class="summary-card pass">
            <div class="card-icon">
              <CheckCircle class="icon" />
            </div>
            <div class="card-info">
              <span class="card-value">{{ summaryStats.passRate }}%</span>
              <span class="card-label">合格率</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :lg="4">
          <div class="summary-card issue">
            <div class="card-icon">
              <AlertTriangle class="icon" />
            </div>
            <div class="card-info">
              <span class="card-value">{{ summaryStats.issueCount }}</span>
              <span class="card-label">问题数</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :lg="4">
          <div class="summary-card resolved">
            <div class="card-icon">
              <CheckSquare class="icon" />
            </div>
            <div class="card-info">
              <span class="card-value">{{ summaryStats.resolvedCount }}</span>
              <span class="card-label">已整改</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :lg="4">
          <div class="summary-card rate">
            <div class="card-icon">
              <Wrench class="icon" />
            </div>
            <div class="card-info">
              <span class="card-value">{{ summaryStats.rectificationRate }}%</span>
              <span class="card-label">整改率</span>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="section-title print-section-title">
        <BarChart3 class="title-icon" />
        <h3>得分概览</h3>
      </div>

      <el-row :gutter="20" class="score-overview-row">
        <el-col :xs="24" :lg="10">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">总体得分</span>
              </div>
            </template>
            <div ref="scoreGaugeRef" class="gauge-chart"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="14">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">各项分类得分</span>
              </div>
            </template>
            <div ref="radarChartRef" class="radar-chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <div class="section-title print-section-title">
        <ListChecks class="title-icon" />
        <h3>检查明细</h3>
      </div>

      <el-card class="detail-card" shadow="never">
        <el-collapse v-model="activeCategory" accordion>
          <el-collapse-item
            v-for="(category, index) in categoryScores"
            :key="category.name"
            :name="index"
          >
            <template #title>
              <div class="collapse-title">
                <span class="category-name">{{ category.name }}</span>
                <el-tag :type="category.score >= 80 ? 'success' : category.score >= 60 ? 'warning' : 'danger'" size="small">
                  {{ category.score }}分
                </el-tag>
                <span class="item-count">共 {{ category.items.length }} 项</span>
              </div>
            </template>
            <el-table :data="category.items" style="width: 100%" stripe class="detail-table">
              <el-table-column prop="itemTitle" label="检查项" min-width="200">
                <template #default="{ row }">
                  <span class="item-title" :class="{ 'failed': !isItemPassed(row) }">{{ row.itemTitle }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="score" label="得分" width="100" align="center">
                <template #default="{ row }">
                  <span class="item-score" :class="{ 'failed': !isItemPassed(row) }">{{ row.score }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="fullScore" label="满分" width="80" align="center">
                {{ category.items[0]?.fullScore || 100 }}
              </el-table-column>
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag v-if="isItemPassed(row)" type="success" effect="light" size="small">合格</el-tag>
                  <el-tag v-else type="danger" effect="light" size="small">不合格</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="200">
                <template #default="{ row }">
                  <span v-if="row.remark" class="remark-text">{{ row.remark }}</span>
                  <span v-else class="no-remark">-</span>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <div class="section-title print-section-title">
        <AlertTriangle class="title-icon" />
        <h3>问题统计</h3>
      </div>

      <el-row :gutter="20" class="issue-stats-row">
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <PieChart class="header-icon" />
                <span class="card-title">问题等级分布</span>
              </div>
            </template>
            <div ref="issueLevelPieRef" class="pie-chart"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <BarChart3 class="header-icon" />
                <span class="card-title">问题类型分布</span>
              </div>
            </template>
            <div ref="issueTypeBarRef" class="bar-chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="issue-list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <AlertCircle class="header-icon" />
            <span class="card-title">问题列表</span>
          </div>
        </template>
        <el-table :data="issues" style="width: 100%" stripe>
          <el-table-column prop="id" label="编号" width="80" align="center" />
          <el-table-column prop="description" label="问题描述" min-width="250" />
          <el-table-column prop="level" label="等级" width="100" align="center">
            <template #default="{ row }">
              <el-tag :color="getIssueLevelColor(row.level)" effect="light" size="small">
                {{ getIssueLevelLabel(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :color="getIssueStatusColor(row.status)" effect="light" size="small">
                {{ getIssueStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="截止日期" width="120" align="center">
            <template #default="{ row }">
              <div class="deadline-cell">
                <Clock class="deadline-icon" />
                <span>{{ row.deadline }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" align="center" />
        </el-table>
      </el-card>

      <div class="section-title print-section-title">
        <Wrench class="title-icon" />
        <h3>整改情况</h3>
      </div>

      <el-row :gutter="20" class="rectification-row">
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="rect-card pending">
            <div class="rect-icon">
              <XCircle class="icon" />
            </div>
            <div class="rect-info">
              <span class="rect-value">{{ issues.filter(i => i.status === 'pending').length }}</span>
              <span class="rect-label">待处理</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="rect-card rectifying">
            <div class="rect-icon">
              <Wrench class="icon" />
            </div>
            <div class="rect-info">
              <span class="rect-value">{{ issues.filter(i => i.status === 'rectifying').length }}</span>
              <span class="rect-label">整改中</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="rect-card resolved">
            <div class="rect-icon">
              <CheckSquare class="icon" />
            </div>
            <div class="rect-info">
              <span class="rect-value">{{ issues.filter(i => i.status === 'resolved').length }}</span>
              <span class="rect-label">已解决</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="rect-card verified">
            <div class="rect-icon">
              <CheckCircle class="icon" />
            </div>
            <div class="rect-info">
              <span class="rect-value">{{ issues.filter(i => i.status === 'verified').length }}</span>
              <span class="rect-label">已验证</span>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-card class="timeline-card" shadow="never">
        <template #header>
          <div class="card-header">
            <Clock class="header-icon" />
            <span class="card-title">整改时效分析</span>
          </div>
        </template>
        <div class="timeline-content">
          <div class="timeline-item">
            <div class="timeline-dot" style="background: #10b981;"></div>
            <div class="timeline-content-item">
              <span class="timeline-label">平均整改时间</span>
              <span class="timeline-value">2.5 天</span>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot" style="background: #3b82f6;"></div>
            <div class="timeline-content-item">
              <span class="timeline-label">按时完成率</span>
              <span class="timeline-value">85%</span>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot" style="background: #f59e0b;"></div>
            <div class="timeline-content-item">
              <span class="timeline-label">逾期数</span>
              <span class="timeline-value">2 项</span>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot" style="background: #8b5cf6;"></div>
            <div class="timeline-content-item">
              <span class="timeline-label">平均验证时间</span>
              <span class="timeline-value">1.2 天</span>
            </div>
          </div>
        </div>
      </el-card>

      <div class="section-title print-section-title">
        <TrendingUp class="title-icon" />
        <h3>趋势分析</h3>
      </div>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <BarChart3 class="header-icon" />
            <span class="card-title">近12个月得分趋势</span>
          </div>
        </template>
        <div ref="trendChartRef" class="trend-chart"></div>
      </el-card>

      <div class="footer-actions print-hide">
        <el-button size="large" @click="handleBack">
          <ArrowLeft class="btn-icon" />
          返回列表
        </el-button>
        <el-button size="large" @click="handleExport">
          <Download class="btn-icon" />
          导出PDF
        </el-button>
        <el-button type="primary" size="large" @click="handlePrint">
          <Printer class="btn-icon" />
          打印报告
        </el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.report-detail-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f8fafc;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

.breadcrumb-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  vertical-align: middle;
}

:deep(.el-breadcrumb__inner) {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.action-right {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.report-header {
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
}

.header-left {
  flex: 1;
  min-width: 300px;
}

.report-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.report-no {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  opacity: 0.9;
}

.type-tag {
  --el-tag-bg-color: rgba(255, 255, 255, 0.2);
  --el-tag-text-color: white;
  --el-tag-border-color: rgba(255, 255, 255, 0.3);
}

.header-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  opacity: 0.9;
}

.meta-icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 24px 0 16px 0;
}

.title-icon {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.section-title h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.summary-row {
  margin-bottom: 8px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.summary-card.score .card-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.summary-card.avg .card-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #10b981;
}

.summary-card.pass .card-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.summary-card.issue .card-icon {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #ef4444;
}

.summary-card.resolved .card-icon {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #8b5cf6;
}

.summary-card.rate .card-icon {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #ec4899;
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon .icon {
  width: 26px;
  height: 26px;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.card-label {
  font-size: 13px;
  color: #64748b;
}

.score-overview-row {
  margin-bottom: 20px;
}

.chart-card,
.detail-card,
.issue-list-card,
.timeline-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  width: 18px;
  height: 18px;
  color: #3b82f6;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.gauge-chart {
  width: 100%;
  height: 280px;
}

.radar-chart {
  width: 100%;
  height: 320px;
}

.pie-chart,
.bar-chart,
.trend-chart {
  width: 100%;
  height: 300px;
  padding: 8px;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.category-name {
  font-weight: 500;
  color: #1e293b;
  flex: 1;
}

.item-count {
  font-size: 13px;
  color: #94a3b8;
}

.detail-table {
  margin-top: 12px;
}

.item-title {
  font-weight: 500;
  color: #1e293b;
}

.item-title.failed {
  color: #ef4444;
}

.item-score {
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
}

.item-score.failed {
  color: #ef4444;
}

.remark-text {
  color: #f59e0b;
  font-size: 13px;
}

.no-remark {
  color: #94a3b8;
}

:deep(.el-table th) {
  background: #f8fafc !important;
  color: #64748b;
  font-weight: 500;
}

:deep(.el-table tr:hover > td) {
  background: #f1f5f9 !important;
}

.issue-stats-row {
  margin-bottom: 20px;
}

.deadline-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
}

.deadline-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.rectification-row {
  margin-bottom: 20px;
}

.rect-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.rect-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.rect-card.pending .rect-icon {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #ef4444;
}

.rect-card.rectifying .rect-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #f59e0b;
}

.rect-card.resolved .rect-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #10b981;
}

.rect-card.verified .rect-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.rect-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rect-icon .icon {
  width: 24px;
  height: 24px;
}

.rect-info {
  display: flex;
  flex-direction: column;
}

.rect-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.rect-label {
  font-size: 13px;
  color: #64748b;
}

.timeline-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline-content-item {
  display: flex;
  flex-direction: column;
}

.timeline-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 2px;
}

.timeline-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.footer-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 24px 0;
  border-top: 1px solid #e2e8f0;
  margin-top: 20px;
}

@media print {
  .print-hide {
    display: none !important;
  }

  .report-detail-container {
    padding: 0;
    background: white;
    min-height: auto;
  }

  .report-header {
    background: #1e3a5f !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    page-break-inside: avoid;
  }

  .print-section-title {
    page-break-after: avoid;
  }

  .chart-card,
  .detail-card,
  .issue-list-card,
  .timeline-card {
    page-break-inside: avoid;
    box-shadow: none;
  }

  .summary-card,
  .rect-card {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .card-icon,
  .rect-icon {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .summary-card .card-icon,
  .rect-card .rect-icon {
    background: #f1f5f9 !important;
  }

  .gauge-chart,
  .radar-chart,
  .pie-chart,
  .bar-chart,
  .trend-chart {
    page-break-inside: avoid;
  }

  @page {
    margin: 1.5cm;
  }
}

@media (max-width: 768px) {
  .report-detail-container {
    padding: 16px;
  }

  .action-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .action-right {
    justify-content: flex-end;
  }

  .report-header {
    padding: 20px;
  }

  .report-title {
    font-size: 22px;
  }

  .header-right {
    width: 100%;
  }

  .meta-row {
    flex-direction: column;
    gap: 8px;
  }

  .gauge-chart {
    height: 240px;
  }

  .radar-chart {
    height: 280px;
  }

  .pie-chart,
  .bar-chart,
  .trend-chart {
    height: 260px;
  }

  .timeline-content {
    grid-template-columns: 1fr;
  }

  .footer-actions {
    flex-direction: column;
  }

  .footer-actions .el-button {
    width: 100%;
  }
}
</style>
