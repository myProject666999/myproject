
<template>
  <div class="page-container">
    <el-form :inline="true" class="search-form">
      <el-form-item>
        <el-button type="success" icon="Plus" @click="handleAdd">新增菜单</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container" row-key="id" default-expand-all>
      <el-table-column prop="permissionName" label="权限名称" width="200" />
      <el-table-column prop="permissionCode" label="权限编码" width="200" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'primary' : 'success'">
            {{ row.type === 1 ? '菜单' : '按钮' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" />
      <el-table-column prop="component" label="组件路径" />
      <el-table-column prop="icon" label="图标" width="100" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" link v-if="row.type === 1" @click="handleAddChild(row)">添加子菜单</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  {
    id: 1,
    permissionName: '系统管理',
    permissionCode: 'system',
    type: 1,
    path: '/system',
    component: 'Layout',
    icon: 'Setting',
    sort: 1,
    status: 1,
    children: [
      { id: 2, permissionName: '用户管理', permissionCode: 'system:user', type: 1, path: '/system/user', component: 'system/user/index', icon: 'User', sort: 1, status: 1 },
      { id: 3, permissionName: '角色管理', permissionCode: 'system:role', type: 1, path: '/system/role', component: 'system/role/index', icon: 'Peoples', sort: 2, status: 1 },
      { id: 4, permissionName: '权限管理', permissionCode: 'system:permission', type: 1, path: '/system/permission', component: 'system/permission/index', icon: 'Key', sort: 3, status: 1 }
    ]
  },
  {
    id: 5,
    permissionName: '基础信息',
    permissionCode: 'base',
    type: 1,
    path: '/base',
    component: 'Layout',
    icon: 'Document',
    sort: 2,
    status: 1,
    children: [
      { id: 6, permissionName: '员工管理', permissionCode: 'base:employee', type: 1, path: '/base/employee', component: 'base/employee/index', icon: 'UserFilled', sort: 1, status: 1 },
      { id: 7, permissionName: '服务项目', permissionCode: 'base:service', type: 1, path: '/base/service', component: 'base/service/index', icon: 'Service', sort: 2, status: 1 },
      { id: 8, permissionName: '商品管理', permissionCode: 'base:product', type: 1, path: '/base/product', component: 'base/product/index', icon: 'Goods', sort: 3, status: 1 }
    ]
  }
])

const handleAdd = () => {
  console.log('新增菜单')
}

const handleAddChild = (row) => {
  console.log('添加子菜单:', row)
}

const handleEdit = (row) => {
  console.log('编辑权限:', row)
}

const handleDelete = (row) => {
  console.log('删除权限:', row)
}
</script>
