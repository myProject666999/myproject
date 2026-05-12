
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="员工姓名">
        <el-input v-model="queryForm.employeeName" placeholder="请输入员工姓名" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="queryForm.phone" placeholder="请输入手机号" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="职位">
        <el-select v-model="queryForm.position" placeholder="请选择" clearable style="width: 130px;">
          <el-option label="店长" value="店长" />
          <el-option label="技师" value="技师" />
          <el-option label="收银员" value="收银员" />
          <el-option label="助理" value="助理" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增员工</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="employeeNo" label="员工编号" width="120" />
      <el-table-column prop="employeeName" label="姓名" width="100" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="position" label="职位" width="100" />
      <el-table-column prop="isTechnician" label="是否技师" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isTechnician === 1 ? 'success' : 'info'">
            {{ row.isTechnician === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="技师级别" width="100" />
      <el-table-column prop="commissionRate" label="提成比例" width="100">
        <template #default="{ row }">{{ row.commissionRate }}%</template>
      </el-table-column>
      <el-table-column prop="joinDate" label="入职日期" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '在职' : '离职' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
  phone: '',
  position: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 20
})

const tableData = ref([
  { id: 1, employeeNo: 'EMP001', employeeName: '王技师', phone: '13800138001', position: '技师', isTechnician: 1, level: '高级技师', commissionRate: 30, joinDate: '2022-05-10', status: 1 },
  { id: 2, employeeNo: 'EMP002', employeeName: '李技师', phone: '13800138002', position: '技师', isTechnician: 1, level: '首席技师', commissionRate: 35, joinDate: '2021-08-15', status: 1 },
  { id: 3, employeeNo: 'EMP003', employeeName: '张技师', phone: '13800138003', position: '技师', isTechnician: 1, level: '中级技师', commissionRate: 25, joinDate: '2023-02-20', status: 1 },
  { id: 4, employeeNo: 'EMP004', employeeName: '刘技师', phone: '13800138004', position: '技师', isTechnician: 1, level: '高级技师', commissionRate: 30, joinDate: '2022-11-05', status: 1 },
  { id: 5, employeeNo: 'EMP005', employeeName: '陈收银', phone: '13800138005', position: '收银员', isTechnician: 0, level: '', commissionRate: 0, joinDate: '2023-06-10', status: 1 }
])

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.employeeName = ''
  queryForm.phone = ''
  queryForm.position = ''
  pagination.current = 1
}

const handleAdd = () => {
  console.log('新增员工')
}

const handleEdit = (row) => {
  console.log('编辑员工:', row)
}

const handleDelete = (row) => {
  console.log('删除员工:', row)
}
</script>
