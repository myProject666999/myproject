<template>
  <div class="calculator-page">
    <el-card class="input-card">
      <template #header>
        <div class="card-header">
          <span>贷款参数</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="贷款金额" prop="loanAmount" :rules="rules.loanAmount">
              <el-input-number
                v-model="form.loanAmount"
                :min="10000"
                :max="100000000"
                :step="10000"
                style="width: 100%"
                placeholder="请输入贷款金额"
              />
              <span style="margin-left: 10px; color: #909399;">元</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="贷款期限" prop="loanTermMonths" :rules="rules.loanTermMonths">
              <el-select v-model="form.loanTermMonths" style="width: 100%" placeholder="请选择贷款期限">
                <el-option label="5年（60期）" :value="60" />
                <el-option label="10年（120期）" :value="120" />
                <el-option label="15年（180期）" :value="180" />
                <el-option label="20年（240期）" :value="240" />
                <el-option label="25年（300期）" :value="300" />
                <el-option label="30年（360期）" :value="360" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年利率" prop="annualInterestRate" :rules="rules.annualInterestRate">
              <el-input-number
                v-model="form.annualInterestRate"
                :min="0.01"
                :max="20"
                :step="0.01"
                :precision="2"
                style="width: 100%"
                placeholder="请输入年利率"
              />
              <span style="margin-left: 10px; color: #909399;">%</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="还款方式" prop="repaymentType" :rules="rules.repaymentType">
              <el-radio-group v-model="form.repaymentType">
                <el-radio value="EQUAL_INSTALLMENT">等额本息</el-radio>
                <el-radio value="EQUAL_PRINCIPAL">等额本金</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleCalculate" :loading="loading">
            <el-icon><Calculator /></el-icon>
            开始计算
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-if="result" class="result-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="stat-card total-payment">
            <div class="stat-label">还款总额</div>
            <div class="stat-value">{{ formatMoney(result.totalPayment) }}</div>
            <div class="stat-sub">元</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card total-interest">
            <div class="stat-label">支付利息</div>
            <div class="stat-value">{{ formatMoney(result.totalInterest) }}</div>
            <div class="stat-sub">元</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card monthly-payment">
            <div class="stat-label">{{ result.repaymentType === 'EQUAL_INSTALLMENT' ? '每月还款' : '首月还款' }}</div>
            <div class="stat-value">{{ formatMoney(result.firstMonthPayment) }}</div>
            <div class="stat-sub" v-if="result.repaymentType === 'EQUAL_PRINCIPAL'">末月: {{ formatMoney(result.lastMonthPayment) }}元</div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>还款构成分析</span>
            <el-tag type="info">{{ result.repaymentTypeName }}</el-tag>
          </div>
        </template>
        <div ref="chartRef" class="chart-container"></div>
      </el-card>

      <el-card class="plan-card">
        <template #header>
          <div class="card-header">
            <span>还款计划表</span>
            <el-button type="primary" size="small" @click="showSaveDialog">
              <el-icon><Plus /></el-icon>
              保存方案
            </el-button>
          </div>
        </template>
        <el-table :data="result.repaymentPlan.slice(0, 12)" border stripe>
          <el-table-column prop="period" label="期数" width="80" align="center" />
          <el-table-column prop="repaymentDate" label="还款日期" width="140" align="center">
            <template #default="{ row }">
              {{ formatDate(row.repaymentDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="monthlyPayment" label="月供(元)" width="140" align="right">
            <template #default="{ row }">
              {{ formatMoney(row.monthlyPayment) }}
            </template>
          </el-table-column>
          <el-table-column prop="principal" label="本金(元)" width="140" align="right">
            <template #default="{ row }">
              {{ formatMoney(row.principal) }}
            </template>
          </el-table-column>
          <el-table-column prop="interest" label="利息(元)" width="140" align="right">
            <template #default="{ row }">
              {{ formatMoney(row.interest) }}
            </template>
          </el-table-column>
          <el-table-column prop="remainingPrincipal" label="剩余本金(元)" align="right">
            <template #default="{ row }">
              {{ formatMoney(row.remainingPrincipal) }}
            </template>
          </el-table-column>
        </el-table>
        <div v-if="result.repaymentPlan.length > 12" class="more-info">
          ... 共 {{ result.repaymentPlan.length }} 期，仅显示前12期
        </div>
      </el-card>
    </div>

    <el-dialog v-model="saveDialogVisible" title="保存贷款方案" width="500px">
      <el-form :model="saveForm" label-width="100px">
        <el-form-item label="方案名称">
          <el-input v-model="saveForm.name" placeholder="请输入方案名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveScheme">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import * as echarts from 'echarts'
import { calculateLoan, saveScheme } from '../api'

const formRef = ref(null)
const chartRef = ref(null)
let chartInstance = null

const loading = ref(false)
const result = ref(null)
const saveDialogVisible = ref(false)

const form = reactive({
  loanAmount: 1000000,
  loanTermMonths: 360,
  annualInterestRate: 3.1,
  repaymentType: 'EQUAL_INSTALLMENT'
})

const saveForm = reactive({
  name: ''
})

const rules = {
  loanAmount: [{ required: true, message: '请输入贷款金额', trigger: 'blur' }],
  loanTermMonths: [{ required: true, message: '请选择贷款期限', trigger: 'change' }],
  annualInterestRate: [{ required: true, message: '请输入年利率', trigger: 'blur' }],
  repaymentType: [{ required: true, message: '请选择还款方式', trigger: 'change' }]
}

const formatMoney = (value) => {
  if (!value && value !== 0) return '-'
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const handleCalculate = async () => {
  try {
    loading.value = true
    result.value = await calculateLoan(form)
    nextTick(() => {
      initChart()
    })
  } catch (error) {
    ElMessage.error(error.message || '计算失败')
  } finally {
    loading.value = false
  }
}

const initChart = () => {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)

  const principalData = result.value.repaymentPlan.filter((_, i) => i % 12 === 0).map(item => item.principal)
  const interestData = result.value.repaymentPlan.filter((_, i) => i % 12 === 0).map(item => item.interest)
  const xAxisData = result.value.repaymentPlan.filter((_, i) => i % 12 === 0).map(item => `第${item.period}期`)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['本金', '利息'],
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
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 元'
      }
    },
    series: [
      {
        name: '本金',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#67C23A' },
        data: principalData
      },
      {
        name: '利息',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#E6A23C' },
        data: interestData
      }
    ]
  }

  chartInstance.setOption(option)
}

const resetForm = () => {
  formRef.value?.resetFields()
  result.value = null
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

const showSaveDialog = () => {
  saveForm.name = ''
  saveDialogVisible.value = true
}

const handleSaveScheme = async () => {
  if (!saveForm.name) {
    ElMessage.warning('请输入方案名称')
    return
  }

  try {
    await saveScheme({
      name: saveForm.name,
      loanAmount: form.loanAmount,
      loanTermMonths: form.loanTermMonths,
      annualInterestRate: form.annualInterestRate,
      repaymentType: form.repaymentType
    })
    ElMessage.success('方案保存成功')
    saveDialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  }
}

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped>
.calculator-page {
  max-width: 1400px;
  margin: 0 auto;
}

.input-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.result-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card {
  text-align: center;
  margin-bottom: 20px;
  border: none;
  border-radius: 8px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.total-payment {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.total-payment .stat-label,
.total-payment .stat-sub {
  color: rgba(255, 255, 255, 0.8);
}

.total-payment .stat-value {
  color: white;
}

.total-interest {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.total-interest .stat-label,
.total-interest .stat-sub {
  color: rgba(255, 255, 255, 0.8);
}

.total-interest .stat-value {
  color: white;
}

.monthly-payment {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.monthly-payment .stat-label,
.monthly-payment .stat-sub {
  color: rgba(255, 255, 255, 0.8);
}

.monthly-payment .stat-value {
  color: white;
}

.stat-label {
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-sub {
  font-size: 12px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.plan-card {
  margin-bottom: 20px;
}

.more-info {
  text-align: center;
  color: #909399;
  padding: 10px;
  font-size: 13px;
}
</style>
