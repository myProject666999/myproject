<template>
    <div class="page-container">
        <el-row :gutter="20" class="mb20">
            <el-col :span="6">
                <div class="card stat-card">
                    <div class="stat-value">{{ stats?.totalSubscriptions || 0 }}</div>
                    <div class="stat-label">订阅总数</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="card stat-card">
                    <div class="stat-value" style="color: #67c23a;">{{ stats?.activeSubscriptions || 0 }}</div>
                    <div class="stat-label">活跃订阅</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="card stat-card">
                    <div class="stat-value" style="color: #e6a23c;">
                        ¥{{ stats?.totalMonthlyCostCNY?.toFixed(2) || '0.00' }}
                    </div>
                    <div class="stat-label">月度总支出</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="card stat-card">
                    <div class="stat-value" style="color: #f56c6c;">
                        ¥{{ stats?.totalYearlyCostCNY?.toFixed(2) || '0.00' }}
                    </div>
                    <div class="stat-label">年度总支出</div>
                </div>
            </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="12">
                <div class="card">
                    <h3 style="margin-bottom: 20px;">分类分布</h3>
                    <div ref="categoryChartRef" class="chart-container"></div>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="card">
                    <h3 style="margin-bottom: 20px;">币种支出分布 (CNY)</h3>
                    <div ref="currencyChartRef" class="chart-container"></div>
                </div>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="mt20">
            <el-col :span="12">
                <div class="card">
                    <h3 style="margin-bottom: 20px;">各分类订阅数量</h3>
                    <el-table :data="categoryTableData" stripe>
                        <el-table-column prop="category" label="分类" />
                        <el-table-column prop="count" label="数量" width="120" align="center" />
                    </el-table>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="card">
                    <h3 style="margin-bottom: 20px;">各币种支出金额</h3>
                    <el-table :data="currencyTableData" stripe>
                        <el-table-column prop="currency" label="币种" />
                        <el-table-column label="金额 (CNY)" width="150" align="right">
                            <template #default="{ row }">
                                ¥{{ row.amount?.toFixed(2) }}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getStatistics } from '../api'

const stats = ref(null)
const categoryChartRef = ref(null)
const currencyChartRef = ref(null)
let categoryChart = null
let currencyChart = null

const categoryTableData = computed(() => {
    if (!stats.value?.countByCategory) return []
    return Object.entries(stats.value.countByCategory).map(([category, count]) => ({
        category,
        count
    }))
})

const currencyTableData = computed(() => {
    if (!stats.value?.costByCurrency) return []
    return Object.entries(stats.value.costByCurrency).map(([currency, amount]) => ({
        currency,
        amount
    }))
})

const initCategoryChart = () => {
    if (!categoryChartRef.value || !stats.value?.countByCategory) return
    categoryChart = echarts.init(categoryChartRef.value)
    const data = Object.entries(stats.value.countByCategory).map(([name, value]) => ({ name, value }))
    categoryChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
            labelLine: { show: false },
            data
        }]
    })
}

const initCurrencyChart = () => {
    if (!currencyChartRef.value || !stats.value?.costByCurrency) return
    currencyChart = echarts.init(currencyChartRef.value)
    const currencies = Object.keys(stats.value.costByCurrency)
    const values = Object.values(stats.value.costByCurrency).map(v => Number(v.toFixed(2)))
    currencyChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: currencies },
        yAxis: { type: 'value', name: '金额(CNY)' },
        series: [{
            type: 'bar',
            data: values,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 1, color: '#188df0' }
                ])
            }
        }]
    })
}

const loadData = async () => {
    try {
        stats.value = await getStatistics()
        await nextTick()
        initCategoryChart()
        initCurrencyChart()
    } catch (e) {
        console.error(e)
    }
}

const handleResize = () => {
    categoryChart?.resize()
    currencyChart?.resize()
}

onMounted(() => {
    loadData()
    window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.mb20 {
    margin-bottom: 20px;
}
.mt20 {
    margin-top: 20px;
}
</style>
