
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="员工姓名">
        <el-input v-model="queryForm.employeeName" placeholder="请输入员工姓名" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="结算月份">
        <el-date-picker
          v-model="queryForm.settleMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 130px;">
          <el-option label="待结算" :value="1" />
          <el-option label="已结算" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Money" @click="handleSettleAll">一键结算</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="employeeName" label="员工姓名" width="100" />
      <el-table-column prop="position" label="职位" width="100" />
      <el-table-column prop="orderNo" label="订单编号" width="180" />
      <el-table-column prop="commissionType" label="提成类型" width="100" />
      <el-table-column prop="serviceAmount" label="服务金额" width="100">
        <template #default="{ row }">¥{{ row.serviceAmount }}</template>
      </el-table-column>
      <el-table-column prop="commissionRate" label="提成比例" width="100">
        <template #default="{ row }">{{ row.commissionRate }}%</template>
      </el-table-column>
      <el-table-column prop="commissionAmount" label="提成金额" width="100">
        <template #default="{ row }">
          <span style="color: #67C23A;">¥{{ row.commissionAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="生成时间" width="170" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'warning' : 'success'">
            {{ row.status === 1 ? '待结算' : '已结算' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button v-if="row.status === 1" type="success" link @click="handleSettle(row)">结算</el-button>
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
  employeeName: '',
  settleMonth: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 30
})

const tableData = ref([
  { id: 1, employeeName: '王技师', position: '高级技师', orderNo: 'DD202401150001', commissionType: '剪发提成', serviceAmount: 68, commissionRate: 30, commissionAmount: 20.4, createTime: '2024-01-15 10:30:00', status: 1 },
  { id: 2, employeeName: '李技师', position: '首席技师', orderNo: 'DD202401150002', commissionType: '染发提成', serviceAmount: 198, commissionRate: 35, commissionAmount: 69.3, createTime: '2024-01-15 11:00:00', status: 2 },
  { id: 3, employeeName: '张技师', position: '中级技师', orderNo: 'DD202401150003', commissionType: '烫发提成', serviceAmount: 298, commissionRate: 25, commissionAmount: 74.5, createTime: '2024-01-15 14:20:00', status: 1 },
  { id: 4, employeeName: '王技师', position: '高级技师', orderNo: 'DD202401150004', commissionType: '剪发提成', serviceAmount: 38, commissionRate: 30, commissionAmount: 11.4, createTime: '2024-01-15 15:45:00', status: 1 }
])

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.employeeName = ''
  queryForm.settleMonth = ''
  queryForm.status = ''
  pagination.current = 1
}

const handleSettle = (row) => {
  console.log('结算提成:', row)
}

const handleSettleAll = () => {
  console.log('一键结算')
}
</script>
