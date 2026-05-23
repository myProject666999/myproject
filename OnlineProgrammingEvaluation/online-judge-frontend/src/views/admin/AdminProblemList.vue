<template>
  <div class="page-container">
    <div class="page-header">
      <h2>题库管理</h2>
      <el-button type="primary" @click="$router.push('/admin/problem/create')">新建题目</el-button>
    </div>
    <div class="card">
      <el-table :data="problems" stripe>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="标题" prop="title" />
        <el-table-column label="难度" width="100">
          <template #default="scope">
            <span :class="getDifficultyClass(scope.row.difficulty)">
              {{ getDifficultyText(scope.row.difficulty) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '公开' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="通过率" width="120">
          <template #default="scope">
            {{ scope.row.submitCount > 0 ? ((scope.row.acceptedCount / scope.row.submitCount * 100).toFixed(1) + '%') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="$router.push(`/admin/problem/edit/${scope.row.id}`)">编辑</el-button>
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

const problems = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchData = async () => {
  const res = await request.get('/problem/page', {
    params: { page: currentPage.value, size: pageSize.value }
  })
  problems.value = res.data.records
  total.value = res.data.total
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这道题目吗？', '提示', { type: 'warning' })
    await request.delete(`/problem/delete/${id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {
    // cancelled
  }
}

const getDifficultyText = (d) => ({ 1: '简单', 2: '中等', 3: '困难' }[d] || '未知')
const getDifficultyClass = (d) => ({ 1: 'difficulty-easy', 2: 'difficulty-medium', 3: 'difficulty-hard' }[d] || '')

onMounted(fetchData)
</script>
