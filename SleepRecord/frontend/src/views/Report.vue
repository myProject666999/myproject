<template>
    <div class="page-container">
        <div class="page-header">
            <h1>📊 睡眠报告</h1>
            <p style="margin-top: 8px; opacity: 0.9;">查看你的睡眠数据分析</p>
        </div>

        <div class="nav-tabs">
            <button class="nav-tab" :class="{ active: activeTab === 'record' }" @click="goToRecord">
                📝 录入
            </button>
            <button class="nav-tab" :class="{ active: activeTab === 'report' }" @click="activeTab = 'report'">
                📊 报告
            </button>
        </div>

        <div class="card">
            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
                <span>选择月份：</span>
                <el-date-picker
                    v-model="selectedMonth"
                    type="month"
                    placeholder="选择月份"
                    format="YYYY-MM"
                    value-format="YYYY-MM"
                    @change="loadReport"
                />
                <el-button type="primary" @click="loadReport">查询</el-button>
            </div>

            <div v-if="reportData" class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">{{ reportData.summary?.avg_quality || '--' }}</div>
                    <div class="stat-label">平均质量分</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ reportData.summary?.avg_duration || '--' }}h</div>
                    <div class="stat-label">平均睡眠时长</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ reportData.summary?.avg_deep_sleep || '--' }}h</div>
                    <div class="stat-label">平均深睡眠</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ reportData.summary?.avg_light_sleep || '--' }}h</div>
                    <div class="stat-label">平均浅睡眠</div>
                </div>
                <div class="stat-item" :style="{ borderTop: `4px solid ${getRegularityColor(reportData.regularityScore)}` }">
                    <div class="stat-value">{{ reportData.regularityScore || 0 }}</div>
                    <div class="stat-label">规律性评分</div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">睡眠趋势图</div>
            <div ref="chartRef" style="width: 100%; height: 350px;"></div>
        </div>

        <div class="card">
            <div class="card-title">睡眠质量分布</div>
            <div ref="qualityChartRef" style="width: 100%; height: 300px;"></div>
        </div>

        <div class="card">
            <div class="card-title">每日详情</div>
            <el-table :data="dailyRecords" style="width: 100%" stripe>
                <el-table-column prop="sleep_date" label="日期" width="120" />
                <el-table-column label="入睡时间" width="170">
                    <template #default="{ row }">
                        {{ formatTime(row.sleep_time) }}
                    </template>
                </el-table-column>
                <el-table-column label="起床时间" width="170">
                    <template #default="{ row }">
                        {{ formatTime(row.wake_time) }}
                    </template>
                </el-table-column>
                <el-table-column prop="duration" label="时长" width="100">
                    <template #default="{ row }">
                        {{ row.duration }}h
                    </template>
                </el-table-column>
                <el-table-column prop="quality_score" label="质量分" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getQualityTagType(row.quality_score)">
                            {{ row.quality_score }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="deep_sleep" label="深睡" width="100">
                    <template #default="{ row }">
                        {{ row.deep_sleep }}h
                    </template>
                </el-table-column>
                <el-table-column prop="light_sleep" label="浅睡" width="100">
                    <template #default="{ row }">
                        {{ row.light_sleep }}h
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sleepApi } from '../api'
import * as echarts from 'echarts'

const router = useRouter()
const activeTab = ref('report')
const chartRef = ref(null)
const qualityChartRef = ref(null)
let chart = null
let qualityChart = null

const selectedMonth = ref('')
const reportData = ref(null)
const dailyRecords = ref([])

const formatTime = (timeStr) => {
    if (!timeStr) return '--'
    const date = new Date(timeStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getQualityTagType = (score) => {
    if (score >= 8) return 'success'
    if (score >= 6) return 'warning'
    return 'danger'
}

const getRegularityColor = (score) => {
    if (score >= 80) return '#67C23A'
    if (score >= 60) return '#E6A23C'
    return '#F56C6C'
}

const initChart = () => {
    if (chartRef.value) {
        chart = echarts.init(chartRef.value)
    }
    if (qualityChartRef.value) {
        qualityChart = echarts.init(qualityChartRef.value)
    }
}

const updateChart = () => {
    if (!chart || !dailyRecords.value.length) return

    const dates = dailyRecords.value.map(item => item.sleep_date)
    const durations = dailyRecords.value.map(item => item.duration)
    const qualities = dailyRecords.value.map(item => item.quality_score)
    const deepSleep = dailyRecords.value.map(item => item.deep_sleep)
    const lightSleep = dailyRecords.value.map(item => item.light_sleep)

    chart.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
        },
        legend: {
            data: ['睡眠时长', '质量分', '深睡眠', '浅睡眠']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates
        },
        yAxis: [
            {
                type: 'value',
                name: '时长(h)',
                min: 0,
                max: 12
            },
            {
                type: 'value',
                name: '质量分',
                min: 0,
                max: 10
            }
        ],
        series: [
            {
                name: '睡眠时长',
                type: 'bar',
                data: durations,
                itemStyle: { color: '#667eea' }
            },
            {
                name: '深睡眠',
                type: 'bar',
                data: deepSleep,
                itemStyle: { color: '#764ba2' }
            },
            {
                name: '浅睡眠',
                type: 'bar',
                data: lightSleep,
                itemStyle: { color: '#a8b5f0' }
            },
            {
                name: '质量分',
                type: 'line',
                yAxisIndex: 1,
                data: qualities,
                itemStyle: { color: '#f093fb' },
                lineStyle: { width: 3 }
            }
        ]
    })
}

const updateQualityChart = () => {
    if (!qualityChart || !dailyRecords.value.length) return

    const qualityCount = { '优秀(8-10)': 0, '良好(6-7)': 0, '一般(4-5)': 0, '较差(<4)': 0 }
    dailyRecords.value.forEach(item => {
        if (item.quality_score >= 8) qualityCount['优秀(8-10)']++
        else if (item.quality_score >= 6) qualityCount['良好(6-7)']++
        else if (item.quality_score >= 4) qualityCount['一般(4-5)']++
        else qualityCount['较差(<4)']++
    })

    qualityChart.setOption({
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                name: '睡眠质量',
                type: 'pie',
                radius: '60%',
                data: [
                    { value: qualityCount['优秀(8-10)'], name: '优秀(8-10)', itemStyle: { color: '#67C23A' } },
                    { value: qualityCount['良好(6-7)'], name: '良好(6-7)', itemStyle: { color: '#E6A23C' } },
                    { value: qualityCount['一般(4-5)'], name: '一般(4-5)', itemStyle: { color: '#F56C6C' } },
                    { value: qualityCount['较差(<4)'], name: '较差(<4)', itemStyle: { color: '#909399' } }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    })
}

const loadReport = async () => {
    if (!selectedMonth.value) return

    const [year, month] = selectedMonth.value.split('-')
    const startDate = `${year}-${month}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const endDate = `${year}-${month}-${lastDay}`

    try {
        reportData.value = await sleepApi.getReport(startDate, endDate)
        dailyRecords.value = reportData.value.dailyRecords || []
        updateChart()
        updateQualityChart()
    } catch (error) {
        console.error('加载报告失败:', error)
    }
}

const goToRecord = () => {
    router.push('/record')
}

const handleResize = () => {
    chart?.resize()
    qualityChart?.resize()
}

onMounted(() => {
    const now = new Date()
    selectedMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    initChart()
    loadReport()
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    chart?.dispose()
    qualityChart?.dispose()
    window.removeEventListener('resize', handleResize)
})

watch(selectedMonth, () => {
    loadReport()
})
</script>
