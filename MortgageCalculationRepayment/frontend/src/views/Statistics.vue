<template>
  <div class="statistics-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card total-loan">
          <div class="stat-icon">
            <el-icon :size="40"><Wallet /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">贷款总额</div>
            <div class="stat-value">{{ formatMoney(statistics.totalLoanAmount) }}</div>
            <div class="stat-unit">元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card paid-principal">
          <div class="stat-icon">
            <el-icon :size="40"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">已还本金</div>
            <div class="stat-value">{{ formatMoney(statistics.totalPaidPrincipal) }}</div>
            <div class="stat-unit">元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card paid-interest">
          <div class="stat-icon">
            <el-icon :size="40"><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">已付利息</div>
            <div class="stat-value">{{ formatMoney(statistics.totalPaidInterest) }}</div>
            <div class="stat-unit">元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card remaining">
          <div class="stat-icon">
            <el-icon :size="40"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">剩余本金</div>
            <div class="stat-value">{{ formatMoney(statistics.totalRemainingPrincipal) }}</div>
            <div class="stat-unit">元</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span class="card-header">贷款构成分析</span>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span class="card-header">还款进度</span>
          </template>
          <div class="progress-section">
            <div class="progress-item">
              <div class="progress-header">
                <span>本金还款进度</span>
                <span class="progress-percent">{{ principalProgress }}%</span>
              </div>
              <el-progress :percentage="principalProgress" :stroke-width="18" color="#67C23A" />
              <div class="progress-detail">
                已还 {{ formatMoney(statistics.totalPaidPrincipal) }} / 待还 {{ formatMoney(statistics.totalRemainingPrincipal) }}
              </div>
            </div>

            <div class="progress-item" style="margin-top: 30px;">
              <div class="progress-header">
                <span>利息支付进度</span>
                <span class="progress-percent">{{ interestProgress }}%</span>
              </div>
              <el-progress :percentage="interestProgress" :stroke-width="18" color="#E6A23C" />
              <div class="progress-detail">
                已付 {{ formatMoney(statistics.totalPaidInterest) }} / 待付 {{ formatMoney(statistics.totalRemainingInterest) }}
              </div>
            </div>

            <el-alert
              title="剩余利息提醒"
              :description="'您还需支付利息 ' + formatMoney(statistics.totalRemainingInterest) + ' 元，建议根据资金情况考虑提前还款以减少利息支出。'"
              type="warning"
              :closable="false"
              style="margin-top: 30px;"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span class="card-header">方案列表</span>
        <el-tag type="info">共 {{ statistics.schemeCount }} 个方案</el-tag>
      </template>
      <el-table :data="schemeDetails" border stripe>
        <el-table-column label="方案名称" prop="name" width="180" />
        <el-table-column label="还款方式" prop="repaymentTypeName" width="120" align="center" />
        <el-table-column label="贷款金额" width="140" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.loanAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="还款总额" width="140" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.totalPayment) }}
          </template>
        </el-table-column>
        <el-table-column label="总利息" width="140" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.totalInterest) }}
          </template>
        </el-table-column>
        <el-table-column label="已还本金" width="140" align="right">
          <template #default="{ row }">
            <span style="color: #67C23A;">{{ formatMoney(row.paidPrincipal) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="剩余本金" width="140" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.remainingPrincipal) }}
          </template>
        </el-table-column>
        <el-table-column label="剩余利息" width="140" align="right">
          <template #default="{ row }">
            <el-tag type="danger" size="small" effect="plain">
              {{ formatMoney(row.remainingInterest) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="还款进度" width="200">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.paidPeriods / row.loanTermMonths) * 100)"
              :stroke-width="10"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getStatistics, listSchemes, getSchemeDetail } from '../api'

const pieChartRef = ref(null)
let pieChartInstance = null

const statistics = reactive({
  totalLoanAmount: 0,
  totalPaidPrincipal: 0,
  totalPaidInterest: 0,
  totalRemainingPrincipal: 0,
  totalRemainingInterest: 0,
  schemeCount: 0
})

const schemeDetails = ref([])

const principalProgress = computed(() => {
  if (!statistics.totalLoanAmount) return 0
  return Math.round((statistics.totalPaidPrincipal / statistics.totalLoanAmount) * 100)
})

const interestProgress = computed(() => {
  const totalInterest = statistics.totalPaidInterest + statistics.totalRemainingInterest
  if (!totalInterest) return 0
  return Math.round((statistics.totalPaidInterest / totalInterest) * 100)
})

const formatMoney = (value) => {
  if (!value && value !== 0) return '-'
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadData = async () => {
  try {
    const stats = await getStatistics()
    Object.assign(statistics, stats)

    const schemes = await listSchemes()
    const details = []
    for (const scheme of schemes) {
      const detail = await getSchemeDetail(scheme.id)
      details.push(detail)
    }
    schemeDetails.value = details

    nextTick(() => {
      initPieChart()
    })
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

const initPieChart = () => {
  if (!pieChartRef.value) return

  if (pieChartInstance) {
    pieChartInstance.dispose()
  }

  pieChartInstance = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 元 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: '贷款构成',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: statistics.totalPaidPrincipal, name: '已还本金', itemStyle: { color: '#67C23A' } },
          { value: statistics.totalRemainingPrincipal, name: '剩余本金', itemStyle: { color: '#409EFF' } },
          { value: statistics.totalPaidInterest, name: '已付利息', itemStyle: { color: '#E6A23C' } },
          { value: statistics.totalRemainingInterest, name: '待付利息', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }

  pieChartInstance.setOption(option)
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (pieChartInstance) {
    pieChartInstance.dispose()
  }
})
</script>

<style scoped>
.statistics-page {
  max-width: 1600px;
  margin: 0 auto;
}

.card-header {
  font-weight: 600;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  border-radius: 8px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.total-loan .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.paid-principal .stat-icon {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.paid-interest .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.remaining .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.stat-unit {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 2px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.progress-section {
  padding: 10px 0;
}

.progress-item {
  padding: 0 10px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.progress-percent {
  font-weight: 600;
  color: #409eff;
}

.progress-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}
</style>
