<template>
    <div class="page-container">
        <div class="page-header">
            <h2 class="page-title">统计分析</h2>
            <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 280px"
                @change="loadStatistics"
            />
        </div>
        
        <el-row :gutter="20" class="stats-overview">
            <el-col :span="6">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-item">
                        <div class="stat-icon" style="background: #ecf5ff; color: #409EFF">
                            <el-icon size="24"><Tickets /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ overview.totalReservations || 0 }}</div>
                            <div class="stat-label">总预订数</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-item">
                        <div class="stat-icon" style="background: #f0f9eb; color: #67C23A">
                            <el-icon size="24"><CircleCheck /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ overview.validReservations || 0 }}</div>
                            <div class="stat-label">有效预订</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-item">
                        <div class="stat-icon" style="background: #fef0f0; color: #F56C6C">
                            <el-icon size="24"><CircleClose /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ overview.cancelledReservations || 0 }}</div>
                            <div class="stat-label">取消预订</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-item">
                        <div class="stat-icon" style="background: #fdf6ec; color: #E6A23C">
                            <el-icon size="24"><TrendCharts /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ overview.avgUsageRate || 0 }}%</div>
                            <div class="stat-label">平均使用率</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="12">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>会议室使用率</span>
                        </div>
                    </template>
                    <div ref="usageChartRef" style="height: 350px"></div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>预订趋势</span>
                        </div>
                    </template>
                    <div ref="trendChartRef" style="height: 350px"></div>
                </el-card>
            </el-col>
        </el-row>
        
        <el-card shadow="hover" style="margin-top: 20px">
            <template #header>
                <div class="card-header">
                    <span>会议室使用详情</span>
                </div>
            </template>
            <el-table :data="roomUsage" style="width: 100%">
                <el-table-column prop="roomName" label="会议室名称" />
                <el-table-column prop="roomCode" label="会议室编号" width="120" />
                <el-table-column prop="location" label="位置" width="150" />
                <el-table-column prop="capacity" label="容纳人数" width="100" align="center" />
                <el-table-column prop="reservationCount" label="预订次数" width="120" align="center" />
                <el-table-column prop="totalMinutes" label="使用时长(分钟)" width="140" align="center" />
                <el-table-column label="使用率" width="150">
                    <template #default="{ row }">
                        <el-progress :percentage="row.usageRate || 0" :status="getProgressStatus(row.usageRate)" />
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Tickets, CircleCheck, CircleClose, TrendCharts } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getRoomUsage, getOverview, getTrend } from '@/api/statistics'

const dateRange = ref([
    dayjs().startOf('month').toDate(),
    dayjs().endOf('month').toDate()
])

const overview = reactive({
    totalReservations: 0,
    validReservations: 0,
    cancelledReservations: 0,
    avgUsageRate: 0
})

const roomUsage = ref([])
const trendData = ref([])

const usageChartRef = ref(null)
const trendChartRef = ref(null)
let usageChart = null
let trendChart = null

const getProgressStatus = (rate) => {
    if (rate >= 80) return 'success'
    if (rate >= 50) return 'warning'
    return 'exception'
}

const initCharts = () => {
    if (usageChartRef.value && !usageChart) {
        usageChart = echarts.init(usageChartRef.value)
    }
    if (trendChartRef.value && !trendChart) {
        trendChart = echarts.init(trendChartRef.value)
    }
}

const updateUsageChart = () => {
    if (!usageChart) return
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: roomUsage.value.map(r => r.roomName),
            axisLabel: {
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '使用率(%)',
            max: 100,
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [{
            name: '使用率',
            type: 'bar',
            data: roomUsage.value.map(r => r.usageRate || 0),
            itemStyle: {
                color: function(params) {
                    const colorList = ['#67C23A', '#E6A23C', '#F56C6C']
                    const value = params.value
                    if (value >= 80) return colorList[0]
                    if (value >= 50) return colorList[1]
                    return colorList[2]
                }
            },
            barWidth: '50%'
        }]
    }
    
    usageChart.setOption(option)
}

const updateTrendChart = () => {
    if (!trendChart) return
    
    const option = {
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: trendData.value.map(t => t.date),
            boundaryGap: false,
            axisLabel: {
                interval: 0,
                rotate: 45
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '预订次数',
                position: 'left'
            },
            {
                type: 'value',
                name: '使用率(%)',
                position: 'right',
                max: 100,
                axisLabel: {
                    formatter: '{value}%'
                }
            }
        ],
        series: [
            {
                name: '预订次数',
                type: 'line',
                data: trendData.value.map(t => t.count),
                itemStyle: { color: '#409EFF' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(64,158,255,0.3)' },
                            { offset: 1, color: 'rgba(64,158,255,0.05)' }
                        ]
                    }
                }
            },
            {
                name: '使用率',
                type: 'line',
                yAxisIndex: 1,
                data: trendData.value.map(t => t.usageRate),
                itemStyle: { color: '#67C23A' }
            }
        ]
    }
    
    trendChart.setOption(option)
}

const loadStatistics = async () => {
    if (!dateRange.value || dateRange.value.length !== 2) return
    
    const startDate = dayjs(dateRange.value[0]).format('YYYY-MM-DD')
    const endDate = dayjs(dateRange.value[1]).format('YYYY-MM-DD')
    
    try {
        const [overviewRes, usageRes, trendRes] = await Promise.all([
            getOverview(startDate, endDate),
            getRoomUsage(startDate, endDate),
            getTrend(startDate, endDate)
        ])
        
        Object.assign(overview, overviewRes.data)
        roomUsage.value = usageRes.data
        trendData.value = trendRes.data
        
        await nextTick()
        initCharts()
        updateUsageChart()
        updateTrendChart()
    } catch (error) {
        ElMessage.error('加载统计数据失败')
    }
}

onMounted(() => {
    loadStatistics()
    
    window.addEventListener('resize', () => {
        usageChart?.resize()
        trendChart?.resize()
    })
})
</script>

<style scoped>
.stats-overview {
    margin-bottom: 0;
}

.stat-card {
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-4px);
}

.stat-item {
    display: flex;
    align-items: center;
}

.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
}

.stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
}

.stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
}

.card-header {
    font-weight: 500;
}
</style>
