
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="角色名称">
        <el-input v-model="queryForm.roleName" placeholder="请输入角色名称" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="角色编码">
        <el-input v-model="queryForm.roleCode" placeholder="请输入角色编码" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增角色</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="roleName" label="角色名称" width="150" />
      <el-table-column prop="roleCode" label="角色编码" width="150" />
      <el-table-column prop="description" label="描述" />
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
          <el-button type="success" link @click="handlePermission(row)">分配权限</el-button>
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
  roleName: '',
  roleCode: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 4
})

const tableData = ref([
  { id: 1, roleName: '超级管理员', roleCode: 'admin', description: '系统最高权限', status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 2, roleName: '店长', roleCode: 'store_manager', description: '门店管理权限', status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 3, roleName: '收银员', roleCode: 'cashier', description: '收银权限', status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 4, roleName: '技师', roleCode: 'technician', description: '技师权限', status: 1, createTime: '2024-01-01 00:00:00' }
])

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.roleName = ''
  queryForm.roleCode = ''
  pagination.current = 1
}

const handleAdd = () => {
  console.log('新增角色')
}

const handleEdit = (row) => {
  console.log('编辑角色:', row)
}

const handlePermission = (row) => {
  console.log('分配权限:', row)
}

const handleDelete = (row) => {
  console.log('删除角色:', row)
}
</script>
