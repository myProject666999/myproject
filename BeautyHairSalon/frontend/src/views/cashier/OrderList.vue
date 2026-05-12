
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="订单编号">
        <el-input v-model="queryForm.orderNo" placeholder="请输入订单编号" clearable style="width: 200px;" />
      </el-form-item>
      <el-form-item label="顾客姓名">
        <el-input v-model="queryForm.customerName" placeholder="请输入姓名" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="订单日期">
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px;"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 130px;">
          <el-option label="待支付" :value="1" />
          <el-option label="已支付" :value="2" />
          <el-option label="已取消" :value="3" />
          <el-option label="已退款" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="orderNo" label="订单编号" width="180" />
      <el-table-column prop="customerName" label="顾客姓名" width="100" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="totalAmount" label="订单金额" width="100">
        <template #default="{ row }">¥{{ row.totalAmount }}</template>
      </el-table-column>
      <el-table-column prop="payableAmount" label="应付金额" width="100">
        <template #default="{ row }">¥{{ row.payableAmount }}</template>
      </el-table-column>
      <el-table-column prop="paidAmount" label="实付金额" width="100">
        <template #default="{ row }">¥{{ row.paidAmount }}</template>
      </el-table-column>
      <el-table-column prop="paymentMethod" label="支付方式" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">详情</el-button>
          <el-button v-if="row.status === 1" type="success" link @click="handlePay(row)">支付</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination-container"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const queryForm = reactive({
  orderNo: '',
  customerName: '',
  dateRange: [],
  status: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 20
})

const tableData = ref([
  { id: 1, orderNo: 'DD202401150001', customerName: '张三', phone: '138****1234', totalAmount: 268, payableAmount: 268, paidAmount: 268, paymentMethod: '微信支付', status: 2, createTime: '2024-01-15 10:30:00' },
  { id: 2, orderNo: 'DD202401150002', customerName: '李四', phone: '139****5678', totalAmount: 198, payableAmount: 198, paidAmount: 0, paymentMethod: '', status: 1, createTime: '2024-01-15 11:00:00' },
  { id: 3, orderNo: 'DD202401150003', customerName: '王五', phone: '137****9012', totalAmount: 596, payableAmount: 596, paidAmount: 596, paymentMethod: '支付宝', status: 2, createTime: '2024-01-15 14:20:00' },
  { id: 4, orderNo: 'DD202401150004', customerName: '赵六', phone: '136****3456', totalAmount: 38, payableAmount: 38, paidAmount: 38, paymentMethod: '现金', status: 2, createTime: '2024-01-15 15:45:00' }
])

const getStatusType = (status) => {
  const map = { 1: 'warning', 2: 'success', 3: 'info', 4: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { 1: '待支付', 2: '已支付', 3: '已取消', 4: '已退款' }
  return map[status] || '未知'
}

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.orderNo = ''
  queryForm.customerName = ''
  queryForm.dateRange = []
  queryForm.status = ''
  pagination.current = 1
}

const handleView = (row) => {
  console.log('查看订单:', row)
}

const handlePay = (row) => {
  console.log('订单支付:', row)
}
</script>
