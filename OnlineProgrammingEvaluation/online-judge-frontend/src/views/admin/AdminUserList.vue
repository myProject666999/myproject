<template>
  <div class="page-container">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>
    <div class="card">
      <el-input v-model="keyword" placeholder="搜索用户名/昵称" style="width: 200px; margin-bottom: 20px;" clearable @change="fetchData" />
      <el-table :data="users" stripe>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="用户名" prop="username" width="150" />
        <el-table-column label="昵称" prop="nickname" width="150" />
        <el-table-column label="邮箱" prop="email" width="200" />
        <el-table-column label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 1 ? 'danger' : ''">
              {{ scope.row.role === 1 ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="通过数" prop="solvedCount" width="100" />
        <el-table-column label="提交数" prop="submitCount" width="100" />
        <el-table-column label="积分" prop="rating" width="100" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
              :type="scope.row.role === 1 ? 'info' : 'primary'"
              size="small"
              @click="handleRoleChange(scope.row)"
            >
              {{ scope.row.role === 1 ? '取消管理员' : '设为管理员' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top: 20px; justify-content: center;"
        layout="prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const fetchData = async () => {
  const res = await request.get('/user/page', {
    params: { page: currentPage.value, size: pageSize.value, keyword: keyword.value }
  })
  users.value = res.data.records
  total.value = res.data.total
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleStatusChange = async (row) => {
  try {
    await request.put(`/user/status/${row.id}`, null, { params: { status: row.status } })
    ElMessage.success('更新成功')
  } catch (e) {
    // error handled
  }
}

const handleRoleChange = async (row) => {
  try {
    const newRole = row.role === 1 ? 0 : 1
    await request.put(`/user/role/${row.id}`, null, { params: { role: newRole } })
    row.role = newRole
    ElMessage.success('更新成功')
  } catch (e) {
    // error handled
  }
}

onMounted(fetchData)
</script>
