
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="用户名">
        <el-input v-model="queryForm.username" placeholder="请输入用户名" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="queryForm.nickname" placeholder="请输入昵称" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 120px;">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增用户</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" link @click="handleRole(row)">分配角色</el-button>
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
  username: '',
  nickname: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 5
})

const tableData = ref([
  { id: 1, username: 'admin', nickname: '超级管理员', phone: '13800138000', email: 'admin@example.com', status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 2, username: 'manager', nickname: '店长', phone: '13800138001', email: 'manager@example.com', status: 1, createTime: '2024-01-02 10:00:00' },
  { id: 3, username: 'cashier01', nickname: '收银员01', phone: '13800138002', email: 'cashier01@example.com', status: 1, createTime: '2024-01-03 10:00:00' },
  { id: 4, username: 'tech01', nickname: '技师01', phone: '13800138003', email: 'tech01@example.com', status: 1, createTime: '2024-01-04 10:00:00' },
  { id: 5, username: 'test', nickname: '测试用户', phone: '13800138004', email: 'test@example.com', status: 0, createTime: '2024-01-05 10:00:00' }
])

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.username = ''
  queryForm.nickname = ''
  queryForm.status = ''
  pagination.current = 1
}

const handleAdd = () => {
  console.log('新增用户')
}

const handleEdit = (row) => {
  console.log('编辑用户:', row)
}

const handleRole = (row) => {
  console.log('分配角色:', row)
}

const handleDelete = (row) => {
  console.log('删除用户:', row)
}
</script>
