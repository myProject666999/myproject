<template>
  <div class="payment-list-container">
    <el-card>
      <template #header>
        <span>Payment Management</span>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Event">
          <el-select v-model="searchForm.eventId" placeholder="Select event" clearable style="width: 200px">
            <el-option v-for="event in events" :key="event.id" :label="event.title" :value="event.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="Select status" clearable style="width: 150px">
            <el-option label="Pending" value="PENDING" />
            <el-option label="Paid" value="PAID" />
            <el-option label="Refund Pending" value="REFUND_PENDING" />
            <el-option label="Refunded" value="REFUNDED" />
            <el-option label="Cancelled" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="Payment Type">
          <el-select v-model="searchForm.paymentType" placeholder="Select type" clearable style="width: 150px">
            <el-option label="WeChat" value="WECHAT" />
            <el-option label="Alipay" value="ALIPAY" />
            <el-option label="Bank Transfer" value="BANK" />
            <el-option label="Cash" value="CASH" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">Search</el-button>
          <el-button @click="resetSearch">Reset</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="paymentNo" label="Payment No." width="180" />
        <el-table-column prop="businessName" label="Business Name" min-width="150" />
        <el-table-column prop="stallCode" label="Stall Code" width="120" />
        <el-table-column prop="amount" label="Amount" width="120">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="paymentType" label="Payment Type" width="120" />
        <el-table-column prop="status" label="Status" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="Pay Time" width="180" :formatter="formatDate" />
        <el-table-column label="Actions" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" @click="handleConfirm(row)" v-if="row.status === 'PENDING'">Confirm Payment</el-button>
            <el-button link type="warning" @click="handleRequestRefund(row)" v-if="row.status === 'PAID'">Request Refund</el-button>
            <el-button link type="primary" @click="handleProcessRefund(row, true)" v-if="row.status === 'REFUND_PENDING'">Approve</el-button>
            <el-button link type="danger" @click="handleProcessRefund(row, false)" v-if="row.status === 'REFUND_PENDING'">Reject</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPaymentList, confirmPayment, requestRefund, processRefund } from '@/api/payment'
import { getEventList } from '@/api/event'
import dayjs from 'dayjs'

const loading = ref(false)
const tableData = ref([])
const events = ref([])
const searchForm = ref({
  eventId: '',
  status: '',
  paymentType: ''
})
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const getStatusType = (status) => {
  const typeMap = {
    PENDING: 'warning',
    PAID: 'success',
    REFUND_PENDING: 'warning',
    REFUNDED: 'info',
    CANCELLED: 'danger'
  }
  return typeMap[status] || 'info'
}

const formatDate = (row, column, cellValue) => {
  return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm') : '-'
}

const fetchEvents = async () => {
  try {
    const res = await getEventList({ pageNum: 1, pageSize: 100 })
    events.value = res.data.list || res.data.records || []
  } catch (err) {
    console.error(err)
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    }
    const res = await getPaymentList(params)
    tableData.value = res.data.list || res.data.records || []
    pagination.value.total = res.data.total || 0
  } catch (err) {
    ElMessage.error('Failed to fetch payments')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.value = { eventId: '', status: '', paymentType: '' }
  pagination.value.pageNum = 1
  fetchList()
}

const handleConfirm = async (row) => {
  try {
    await ElMessageBox.confirm('Confirm this payment has been received?', 'Confirm', {
      type: 'warning'
    })
    await confirmPayment(row.paymentNo)
    ElMessage.success('Payment confirmed')
    fetchList()
  } catch {
  }
}

const handleRequestRefund = async (row) => {
  try {
    await ElMessageBox.confirm('Request refund for this payment?', 'Confirm', {
      type: 'warning'
    })
    await requestRefund({ paymentId: row.id, reason: 'User request' })
    ElMessage.success('Refund requested')
    fetchList()
  } catch {
  }
}

const handleProcessRefund = async (row, approved) => {
  const action = approved ? 'approve' : 'reject'
  try {
    await ElMessageBox.confirm(`Are you sure you want to ${action} this refund?`, 'Confirm', {
      type: 'warning'
    })
    await processRefund(row.id, approved)
    ElMessage.success(`Refund ${action}d`)
    fetchList()
  } catch {
  }
}

onMounted(() => {
  fetchEvents()
  fetchList()
})
</script>

<style scoped>
.payment-list-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}
</style>
