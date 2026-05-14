<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary">新建订单</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户姓名" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已入园" :value="2" />
            <el-option label="已归还" :value="3" />
            <el-option label="已取消" :value="4" />
            <el-option label="已退款" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border v-loading="loading">
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="customerName" label="客户姓名" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="ticketType" label="票种" />
        <el-table-column prop="equipment" label="雪具" />
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="depositAmount" label="押金" width="100">
          <template #default="{ row }">
            <span style="color: #e6a23c">¥{{ row.depositAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button type="warning" link size="small" v-if="row.status === 0">支付</el-button>
            <el-button type="danger" link size="small" v-if="row.status === 0">取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-20"
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="订单详情" width="800px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusName(currentOrder.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户姓名">{{ currentOrder.customerName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.phone }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ currentOrder.idCard }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="票种">{{ currentOrder.ticketType }}</el-descriptions-item>
        <el-descriptions-item label="雪具">{{ currentOrder.equipment }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span style="color: #f56c6c; font-weight: bold">¥{{ currentOrder.totalAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="押金">
          <span style="color: #e6a23c">¥{{ currentOrder.depositAmount }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const loading = ref(false)
const detailVisible = ref(false)
const currentOrder = ref(null)

const searchForm = reactive({
  orderNo: '',
  customerName: '',
  status: null
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    orderNo: 'ORD202405140001',
    customerName: '张三',
    phone: '13800000001',
    idCard: '110101199001011234',
    ticketType: '周末全日票 x2',
    equipment: '双板套装 x2',
    totalAmount: 1552,
    depositAmount: 1400,
    status: 2,
    createTime: '2024-05-14 09:15:30'
  },
  {
    id: 2,
    orderNo: 'ORD202405140002',
    customerName: '李四',
    phone: '13800000002',
    idCard: '110101199002025678',
    ticketType: '平日全日票 x1',
    equipment: '单板套装 x1, 头盔 x1',
    totalAmount: 788,
    depositAmount: 600,
    status: 1,
    createTime: '2024-05-14 09:30:25'
  },
  {
    id: 3,
    orderNo: 'ORD202405140003',
    customerName: '王五',
    phone: '13800000003',
    idCard: '110101199003039012',
    ticketType: '夜场票 x3',
    equipment: '',
    totalAmount: 294,
    depositAmount: 0,
    status: 0,
    createTime: '2024-05-14 10:05:12'
  },
  {
    id: 4,
    orderNo: 'ORD202405140004',
    customerName: '赵六',
    phone: '13800000004',
    idCard: '110101199004043456',
    ticketType: '周末半日票 x1',
    equipment: '雪鞋 x1, 头盔 x1',
    totalAmount: 318,
    depositAmount: 300,
    status: 3,
    createTime: '2024-05-14 10:20:45'
  },
  {
    id: 5,
    orderNo: 'ORD202405140005',
    customerName: '钱七',
    phone: '13800000005',
    idCard: '110101199005057890',
    ticketType: '节日全日票 x2',
    equipment: '',
    totalAmount: 976,
    depositAmount: 0,
    status: 5,
    createTime: '2024-05-14 10:45:18'
  }
])

const getStatusName = (status) => {
  const map = { 0: '待支付', 1: '已支付', 2: '已入园', 3: '已归还', 4: '已取消', 5: '已退款' }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'info', 4: 'info', 5: 'info' }
  return map[status] || 'info'
}

const handleSearch = () => {}
const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.customerName = ''
  searchForm.status = null
}

const handleDetail = (row) => {
  currentOrder.value = row
  detailVisible.value = true
}
</script>
