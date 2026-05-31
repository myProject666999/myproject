<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">账单缴费</h2>
      <div class="flex gap-12">
        <el-button :icon="Refresh" @click="handleGenerate">生成月度账单</el-button>
        <el-button type="primary" :icon="Plus" @click="handleAdd">手动新增</el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">本月应收</div>
          <div class="stat-card-value text-primary">
            ¥{{ formatMoney(stats.totalReceivable) }}
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">本月已收</div>
          <div class="stat-card-value text-success">
            ¥{{ formatMoney(stats.totalReceived) }}
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">待收金额</div>
          <div class="stat-card-value text-warning">
            ¥{{ formatMoney(stats.totalUnpaid) }}
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">逾期金额</div>
          <div class="stat-card-value text-danger">
            ¥{{ formatMoney(stats.totalOverdue) }}
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="search-bar">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="账单编号/租客/房源"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
          >
            <el-option label="待缴费" value="UNPAID" />
            <el-option label="部分缴费" value="PARTIAL" />
            <el-option label="已缴清" value="PAID" />
            <el-option label="已逾期" value="OVERDUE" />
          </el-select>
        </el-form-item>
        <el-form-item label="账单月份">
          <el-date-picker
            v-model="queryForm.billMonth"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="租客">
          <el-input
            v-model="queryForm.tenantName"
            placeholder="租客姓名"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="billNo" label="账单编号" width="140" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="apartmentNo" label="房源" width="100" />
        <el-table-column prop="billMonth" label="账单月份" width="100" />
        <el-table-column prop="rentAmount" label="房租(元)" width="110">
          <template #default="{ row }">
            ¥{{ formatMoney(row.rentAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="账单总额(元)" width="130">
          <template #default="{ row }">
            <span class="font-medium">¥{{ formatMoney(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已缴(元)" width="100">
          <template #default="{ row }">
            <span class="text-success">¥{{ formatMoney(row.paidAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unpaidAmount" label="待缴(元)" width="100">
          <template #default="{ row }">
            <span :class="row.unpaidAmount > 0 ? 'text-danger' : 'text-success'">
              ¥{{ formatMoney(row.unpaidAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lateFee" label="滞纳金(元)" width="110">
          <template #default="{ row }">
            <span v-if="row.lateFee > 0" class="text-danger">¥{{ formatMoney(row.lateFee) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="缴费截止" width="120">
          <template #default="{ row }">
            {{ formatDate(row.dueDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status, 'bill') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reminderCount" label="提醒次数" width="90" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">详情</el-button>
            <el-button
              v-if="row.status !== 'PAID'"
              type="success"
              link
              @click="handlePay(row)"
            >
              缴费
            </el-button>
            <el-button
              v-if="row.status !== 'PAID'"
              type="warning"
              link
              @click="handleRemind(row)"
            >
              提醒
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>

    <el-dialog
      v-model="payDialogVisible"
      title="缴费登记"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border class="mb-20">
        <el-descriptions-item label="账单编号">{{ payForm.billNo }}</el-descriptions-item>
        <el-descriptions-item label="租客">{{ payForm.tenantName }}</el-descriptions-item>
        <el-descriptions-item label="账单月份">{{ payForm.billMonth }}</el-descriptions-item>
        <el-descriptions-item label="待缴金额">
          <span class="text-danger font-medium">¥{{ formatMoney(payForm.unpaidAmount) }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <el-form :model="payForm" :rules="payRules" ref="payFormRef" label-width="100px">
        <el-form-item label="缴费金额" prop="amount">
          <el-input-number
            v-model="payForm.amount"
            :min="0.01"
            :max="payForm.unpaidAmount"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="payForm.paymentMethod" style="width: 100%">
            <el-option label="微信支付" value="WECHAT" />
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="银行转账" value="BANK" />
            <el-option label="现金" value="CASH" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易流水号">
          <el-input v-model="payForm.paymentTransactionNo" placeholder="请输入交易流水号（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handlePaySubmit">确认缴费</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="账单详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="账单编号">{{ detailData.billNo }}</el-descriptions-item>
        <el-descriptions-item label="合同编号">{{ detailData.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="租客">{{ detailData.tenantName }}</el-descriptions-item>
        <el-descriptions-item label="房源">{{ detailData.apartmentNo }}</el-descriptions-item>
        <el-descriptions-item label="账单月份">{{ detailData.billMonth }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(detailData.status)">
            {{ getStatusText(detailData.status, 'bill') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="计费周期">
          {{ formatDate(detailData.billStartDate) }} 至 {{ formatDate(detailData.billEndDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="缴费截止">{{ formatDate(detailData.dueDate) }}</el-descriptions-item>
        <el-descriptions-item label="房租">¥{{ formatMoney(detailData.rentAmount) }}</el-descriptions-item>
        <el-descriptions-item label="水费">¥{{ formatMoney(detailData.waterFee) }}</el-descriptions-item>
        <el-descriptions-item label="电费">¥{{ formatMoney(detailData.electricityFee) }}</el-descriptions-item>
        <el-descriptions-item label="燃气费">¥{{ formatMoney(detailData.gasFee) }}</el-descriptions-item>
        <el-descriptions-item label="物业费">¥{{ formatMoney(detailData.propertyFee) }}</el-descriptions-item>
        <el-descriptions-item label="网络费">¥{{ formatMoney(detailData.networkFee) }}</el-descriptions-item>
        <el-descriptions-item label="其他费用">¥{{ formatMoney(detailData.otherFee) }}</el-descriptions-item>
        <el-descriptions-item label="滞纳金">
          <span class="text-danger">¥{{ formatMoney(detailData.lateFee) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="账单总额">
          <span class="font-medium text-primary">¥{{ formatMoney(detailData.totalAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已缴金额">
          <span class="text-success">¥{{ formatMoney(detailData.paidAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="待缴金额">
          <span class="text-danger">¥{{ formatMoney(detailData.unpaidAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式" v-if="detailData.paymentMethod">
          {{ { WECHAT: '微信支付', ALIPAY: '支付宝', BANK: '银行转账', CASH: '现金' }[detailData.paymentMethod] }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间" v-if="detailData.paymentTime">
          {{ formatDateTime(detailData.paymentTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="提醒次数">{{ detailData.reminderCount }}次</el-descriptions-item>
        <el-descriptions-item label="最后提醒">
          {{ detailData.lastReminderTime ? formatDateTime(detailData.lastReminderTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, View } from '@element-plus/icons-vue'
import {
  getBillPage,
  payBill,
  sendPaymentReminder,
  generateMonthlyBills,
  getBillDetail
} from '@/api/bill'
import { formatMoney, formatDate, formatDateTime, getStatusTagType, getStatusText } from '@/utils/format'

const loading = ref(false)
const submitLoading = ref(false)
const payDialogVisible = ref(false)
const detailVisible = ref(false)
const payFormRef = ref()
const total = ref(0)
const tableData = ref([])
const detailData = ref({})

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  billMonth: '',
  tenantName: ''
})

const payForm = reactive({
  billId: null,
  billNo: '',
  tenantName: '',
  billMonth: '',
  unpaidAmount: 0,
  amount: null,
  paymentMethod: '',
  paymentTransactionNo: ''
})

const payRules = {
  amount: [{ required: true, message: '请输入缴费金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

const stats = computed(() => {
  let totalReceivable = 0
  let totalReceived = 0
  let totalUnpaid = 0
  let totalOverdue = 0
  
  tableData.value.forEach(item => {
    totalReceivable += Number(item.totalAmount || 0)
    totalReceived += Number(item.paidAmount || 0)
    totalUnpaid += Number(item.unpaidAmount || 0)
    if (item.status === 'OVERDUE') {
      totalOverdue += Number(item.unpaidAmount || 0)
    }
  })
  
  return { totalReceivable, totalReceived, totalUnpaid, totalOverdue }
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getBillPage(queryForm)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  fetchData()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.status = ''
  queryForm.billMonth = ''
  queryForm.tenantName = ''
  handleSearch()
}

function handleGenerate() {
  ElMessageBox.confirm('确定要生成本月度的所有账单吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await generateMonthlyBills()
    ElMessage.success('账单生成成功')
    fetchData()
  }).catch(() => {})
}

function handleAdd() {
  ElMessage.info('手动新增功能开发中')
}

function handlePay(row) {
  Object.assign(payForm, {
    billId: row.id,
    billNo: row.billNo,
    tenantName: row.tenantName,
    billMonth: row.billMonth,
    unpaidAmount: Number(row.unpaidAmount),
    amount: Number(row.unpaidAmount),
    paymentMethod: '',
    paymentTransactionNo: ''
  })
  payDialogVisible.value = true
}

async function handlePaySubmit() {
  if (!payFormRef.value) return
  
  try {
    await payFormRef.value.validate()
    submitLoading.value = true
    
    await payBill({
      billId: payForm.billId,
      amount: payForm.amount,
      paymentMethod: payForm.paymentMethod,
      paymentTransactionNo: payForm.paymentTransactionNo
    })
    
    ElMessage.success('缴费成功')
    payDialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== false) {
      console.error('Pay error:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

function handleRemind(row) {
  ElMessageBox.confirm(`确定要给【${row.tenantName}】发送缴费提醒吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await sendPaymentReminder(row.id)
    ElMessage.success('提醒发送成功')
    fetchData()
  }).catch(() => {})
}

async function handleView(row) {
  const res = await getBillDetail(row.id)
  detailData.value = res.data
  detailVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>
