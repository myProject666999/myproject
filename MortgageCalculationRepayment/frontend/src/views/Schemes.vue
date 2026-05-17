<template>
  <div class="schemes-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>贷款方案对比</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增方案
          </el-button>
        </div>
      </template>

      <el-table v-if="schemes.length > 0" :data="schemeDetails" border stripe>
        <el-table-column label="方案名称" prop="name" width="160" fixed="left" />
        <el-table-column label="还款方式" prop="repaymentTypeName" width="120" align="center" />
        <el-table-column label="贷款金额(万元)" width="130" align="right">
          <template #default="{ row }">
            {{ (row.loanAmount / 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="贷款期限(年)" width="120" align="center">
          <template #default="{ row }">
            {{ Math.round(row.loanTermMonths / 12) }}
          </template>
        </el-table-column>
        <el-table-column label="年利率(%)" prop="annualInterestRate" width="110" align="center">
          <template #default="{ row }">
            {{ row.annualInterestRate?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="月供(元)" width="130" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.monthlyPayment) }}
          </template>
        </el-table-column>
        <el-table-column label="还款总额(元)" width="140" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.totalPayment) }}
          </template>
        </el-table-column>
        <el-table-column label="总利息(元)" width="130" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.totalInterest) }}
          </template>
        </el-table-column>
        <el-table-column label="已还本金(元)" width="130" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.paidPrincipal) }}
          </template>
        </el-table-column>
        <el-table-column label="已还利息(元)" width="130" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.paidInterest) }}
          </template>
        </el-table-column>
        <el-table-column label="剩余本金(元)" width="130" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.remainingPrincipal) }}
          </template>
        </el-table-column>
        <el-table-column label="剩余利息(元)" width="130" align="right">
          <template #default="{ row }">
            <el-tag type="danger" size="small" effect="plain">
              {{ formatMoney(row.remainingInterest) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="还款进度" width="180">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.paidPeriods / row.loanTermMonths) * 100)"
              :stroke-width="12"
            />
            <div style="font-size: 12px; color: #909399; margin-top: 4px;">
              {{ row.paidPeriods }}/{{ row.loanTermMonths }} 期
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row.id)">
              详情
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else description="暂无贷款方案，点击右上角新增" />
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="方案详情" width="1000px">
      <template v-if="currentDetail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="方案名称">{{ currentDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="还款方式">{{ currentDetail.repaymentTypeName }}</el-descriptions-item>
          <el-descriptions-item label="年利率">{{ currentDetail.annualInterestRate?.toFixed(2) }}%</el-descriptions-item>
          <el-descriptions-item label="贷款金额">{{ formatMoney(currentDetail.loanAmount) }} 元</el-descriptions-item>
          <el-descriptions-item label="贷款期限">{{ Math.round(currentDetail.loanTermMonths / 12) }} 年</el-descriptions-item>
          <el-descriptions-item label="月供">{{ formatMoney(currentDetail.monthlyPayment) }} 元</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="mini-stat">
              <div class="mini-label">还款总额</div>
              <div class="mini-value">{{ formatMoney(currentDetail.totalPayment) }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="mini-stat">
              <div class="mini-label">总利息</div>
              <div class="mini-value">{{ formatMoney(currentDetail.totalInterest) }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="mini-stat">
              <div class="mini-label">已还本金</div>
              <div class="mini-value success">{{ formatMoney(currentDetail.paidPrincipal) }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="mini-stat">
              <div class="mini-label">剩余利息</div>
              <div class="mini-value danger">{{ formatMoney(currentDetail.remainingInterest) }}</div>
            </el-card>
          </el-col>
        </el-row>

        <el-divider />

        <el-card>
          <template #header>提前还款模拟</template>
          <el-form :model="prepaymentForm" inline label-width="100px">
            <el-form-item label="已还期数">
              <el-input-number v-model="prepaymentForm.paidPeriods" :min="0" :max="currentDetail.loanTermMonths - 1" />
            </el-form-item>
            <el-form-item label="提前还款金额">
              <el-input-number v-model="prepaymentForm.prepaymentAmount" :min="1000" :step="10000" />
              <span style="margin-left: 5px;">元</span>
            </el-form-item>
            <el-form-item label="还款方式">
              <el-radio-group v-model="prepaymentForm.prepaymentType">
                <el-radio value="SHORTEN_TERM">减期</el-radio>
                <el-radio value="REDUCE_PAYMENT">减额</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="simulatePrepayment">模拟计算</el-button>
            </el-form-item>
          </el-form>

          <el-divider v-if="prepaymentResult" />

          <el-card v-if="prepaymentResult" class="prepayment-result">
            <template #header>
              <span>模拟结果 - {{ prepaymentResult.prepaymentTypeName }}</span>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="提前还款金额">{{ formatMoney(prepaymentResult.prepaymentAmount) }} 元</el-descriptions-item>
              <el-descriptions-item label="节省利息">
                <span style="color: #67C23A; font-weight: bold;">{{ formatMoney(prepaymentResult.savedInterest) }} 元</span>
              </el-descriptions-item>
              <el-descriptions-item label="还款前剩余本金">{{ formatMoney(prepaymentResult.remainingPrincipalBefore) }} 元</el-descriptions-item>
              <el-descriptions-item label="还款后剩余本金">{{ formatMoney(prepaymentResult.remainingPrincipalAfter) }} 元</el-descriptions-item>
              <el-descriptions-item label="原剩余期限">{{ prepaymentResult.oldTermMonths }} 期</el-descriptions-item>
              <el-descriptions-item label="新剩余期限">
                <span :style="{ color: prepaymentResult.prepaymentType === 'SHORTEN_TERM' ? '#409EFF' : '' }">
                  {{ prepaymentResult.newTermMonths }} 期
                </span>
                <el-tag v-if="prepaymentResult.prepaymentType === 'SHORTEN_TERM'" type="success" size="small" style="margin-left: 8px;">
                  缩短 {{ prepaymentResult.oldTermMonths - prepaymentResult.newTermMonths }} 期
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="原月供">{{ formatMoney(prepaymentResult.oldMonthlyPayment) }} 元</el-descriptions-item>
              <el-descriptions-item label="新月供">
                <span :style="{ color: prepaymentResult.prepaymentType === 'REDUCE_PAYMENT' ? '#409EFF' : '' }">
                  {{ formatMoney(prepaymentResult.newMonthlyPayment) }} 元
                </span>
                <el-tag v-if="prepaymentResult.prepaymentType === 'REDUCE_PAYMENT'" type="success" size="small" style="margin-left: 8px;">
                  每月少还 {{ formatMoney(prepaymentResult.oldMonthlyPayment - prepaymentResult.newMonthlyPayment) }} 元
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-card>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listSchemes, getSchemeDetail, deleteScheme, simulatePrepayment as simulatePrepaymentApi } from '../api'

const schemes = ref([])
const schemeDetails = ref([])
const detailDialogVisible = ref(false)
const currentDetail = ref(null)
const prepaymentResult = ref(null)

const prepaymentForm = reactive({
  paidPeriods: 0,
  prepaymentAmount: 100000,
  prepaymentType: 'SHORTEN_TERM'
})

const formatMoney = (value) => {
  if (!value && value !== 0) return '-'
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadSchemes = async () => {
  try {
    schemes.value = await listSchemes()
    const details = []
    for (const scheme of schemes.value) {
      const detail = await getSchemeDetail(scheme.id)
      details.push(detail)
    }
    schemeDetails.value = details
  } catch (error) {
    ElMessage.error('加载方案失败')
  }
}

const handleAdd = () => {
  ElMessage.info('请前往计算器页面创建并保存方案')
}

const handleView = async (id) => {
  try {
    currentDetail.value = await getSchemeDetail(id)
    prepaymentForm.paidPeriods = currentDetail.value.paidPeriods || 0
    prepaymentResult.value = null
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载详情失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该方案吗？', '确认删除', {
      type: 'warning'
    })
    await deleteScheme(id)
    ElMessage.success('删除成功')
    loadSchemes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const simulatePrepayment = async () => {
  try {
    prepaymentResult.value = await simulatePrepaymentApi({
      loanAmount: currentDetail.value.loanAmount,
      loanTermMonths: currentDetail.value.loanTermMonths,
      annualInterestRate: currentDetail.value.annualInterestRate,
      repaymentType: currentDetail.value.repaymentType,
      paidPeriods: prepaymentForm.paidPeriods,
      prepaymentAmount: prepaymentForm.prepaymentAmount,
      prepaymentType: prepaymentForm.prepaymentType
    })
  } catch (error) {
    ElMessage.error('模拟计算失败')
  }
}

onMounted(() => {
  loadSchemes()
})
</script>

<style scoped>
.schemes-page {
  max-width: 1600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.mini-stat {
  text-align: center;
  margin-bottom: 10px;
}

.mini-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 5px;
}

.mini-value {
  font-size: 20px;
  font-weight: 600;
}

.mini-value.success {
  color: #67C23A;
}

.mini-value.danger {
  color: #F56C6C;
}

.prepayment-result {
  margin-top: 15px;
  background: #f8f9fa;
}
</style>
