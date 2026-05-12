
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="预约编号">
        <el-input v-model="queryForm.appointmentNo" placeholder="请输入预约编号" clearable style="width: 200px;" />
      </el-form-item>
      <el-form-item label="顾客姓名">
        <el-input v-model="queryForm.customerName" placeholder="请输入姓名" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="预约日期">
        <el-date-picker
          v-model="queryForm.appointmentDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 130px;">
          <el-option label="待确认" :value="1" />
          <el-option label="已确认" :value="2" />
          <el-option label="已到店" :value="3" />
          <el-option label="已完成" :value="4" />
          <el-option label="已取消" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增预约</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="appointmentNo" label="预约编号" width="150" />
      <el-table-column prop="customerName" label="顾客姓名" width="100" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="appointmentDate" label="预约日期" width="120" />
      <el-table-column prop="appointmentTime" label="预约时间" width="100" />
      <el-table-column prop="serviceName" label="服务项目" />
      <el-table-column prop="technician" label="技师" width="100" />
      <el-table-column prop="estimatedAmount" label="预计金额" width="100">
        <template #default="{ row }">
          ¥{{ row.estimatedAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">详情</el-button>
          <el-button v-if="row.status === 1" type="success" link @click="handleConfirm(row)">确认</el-button>
          <el-button v-if="row.status === 2" type="warning" link @click="handleArrive(row)">到店</el-button>
          <el-button v-if="row.status === 3" type="success" link @click="handleComplete(row)">完成</el-button>
          <el-button v-if="row.status < 4" type="danger" link @click="handleCancel(row)">取消</el-button>
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
  appointmentNo: '',
  customerName: '',
  appointmentDate: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 10
})

const tableData = ref([
  { id: 1, appointmentNo: 'YY20240101001', customerName: '张三', phone: '138****1234', appointmentDate: '2024-01-15', appointmentTime: '10:00', serviceName: '精剪', technician: '王技师', estimatedAmount: 68, status: 1 },
  { id: 2, appointmentNo: 'YY20240101002', customerName: '李四', phone: '139****5678', appointmentDate: '2024-01-15', appointmentTime: '11:00', serviceName: '染发', technician: '李技师', estimatedAmount: 198, status: 2 },
  { id: 3, appointmentNo: 'YY20240101003', customerName: '王五', phone: '137****9012', appointmentDate: '2024-01-15', appointmentTime: '14:00', serviceName: '冷烫', technician: '张技师', estimatedAmount: 298, status: 3 },
  { id: 4, appointmentNo: 'YY20240101004', customerName: '赵六', phone: '136****3456', appointmentDate: '2024-01-15', appointmentTime: '15:30', serviceName: '洗剪吹', technician: '王技师', estimatedAmount: 38, status: 4 },
  { id: 5, appointmentNo: 'YY20240101005', customerName: '钱七', phone: '135****7890', appointmentDate: '2024-01-15', appointmentTime: '16:00', serviceName: '热烫', technician: '刘技师', estimatedAmount: 498, status: 5 }
])

const getStatusType = (status) => {
  const map = { 1: 'info', 2: 'primary', 3: 'warning', 4: 'success', 5: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { 1: '待确认', 2: '已确认', 3: '已到店', 4: '已完成', 5: '已取消' }
  return map[status] || '未知'
}

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.appointmentNo = ''
  queryForm.customerName = ''
  queryForm.appointmentDate = ''
  queryForm.status = ''
  pagination.current = 1
}

const handleAdd = () => {
  console.log('新增预约')
}

const handleView = (row) => {
  console.log('查看预约:', row)
}

const handleConfirm = (row) => {
  console.log('确认预约:', row)
}

const handleArrive = (row) => {
  console.log('顾客到店:', row)
}

const handleComplete = (row) => {
  console.log('完成服务:', row)
}

const handleCancel = (row) => {
  console.log('取消预约:', row)
}
</script>
