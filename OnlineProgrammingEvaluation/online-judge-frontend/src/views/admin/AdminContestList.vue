<template>
  <div class="page-container">
    <div class="page-header">
      <h2>竞赛管理</h2>
      <el-button type="primary" @click="$router.push('/admin/contest/create')">新建竞赛</el-button>
    </div>
    <div class="card">
      <el-table :data="contests" stripe>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="标题" prop="title" />
        <el-table-column label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 2 ? 'warning' : ''">
              {{ scope.row.type === 2 ? 'CF赛' : '标准赛' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" prop="startTime" width="170" />
        <el-table-column label="结束时间" prop="endTime" width="170" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="$router.push(`/admin/contest/edit/${scope.row.id}`)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const contests = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchData = async () => {
  const res = await request.get('/contest/list', {
    params: { page: currentPage.value, size: pageSize.value }
  })
  contests.value = res.data.records
  total.value = res.data.total
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个竞赛吗？', '提示', { type: 'warning' })
    await request.delete(`/contest/delete/${id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {
    // cancelled
  }
}

const getStatusText = (s) => ({ 0: '未开始', 1: '进行中', 2: '已结束' }[s] || '未知')
const getStatusTagType = (s) => ({ 0: 'info', 1: 'success', 2: 'info' }[s] || 'info')

onMounted(fetchData)
</script>
