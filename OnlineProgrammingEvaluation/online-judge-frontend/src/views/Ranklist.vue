<template>
  <div class="page-container">
    <div class="page-header">
      <h2>排行榜</h2>
      <el-button type="primary" @click="fetchData">刷新</el-button>
    </div>
    <div class="card">
      <el-table :data="ranklist" stripe>
        <el-table-column label="排名" width="100">
          <template #default="scope">
            <span :class="getRankClass(scope.row.rank)" style="font-size: 18px;">
              {{ scope.row.rank }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center;">
              <el-avatar :size="36" :src="scope.row.avatar" style="margin-right: 10px;">
                {{ scope.row.nickname?.charAt(0) }}
              </el-avatar>
              <div>
                <div style="font-weight: bold;">{{ scope.row.nickname }}</div>
                <div style="color: #909399; font-size: 12px;">@{{ scope.row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="通过数" prop="solvedCount" width="100" align="center" />
        <el-table-column label="提交数" prop="submitCount" width="100" align="center" />
        <el-table-column label="通过率" width="120" align="center">
          <template #default="scope">
            {{ scope.row.submitCount > 0 ? ((scope.row.solvedCount / scope.row.submitCount * 100).toFixed(1) + '%') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="积分" prop="rating" width="100" align="center" />
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
import request from '@/utils/request'

const ranklist = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const fetchData = async () => {
  const res = await request.get('/ranklist/list', {
    params: { page: currentPage.value, size: pageSize.value }
  })
  ranklist.value = res.data
  const sizeRes = await request.get('/ranklist/size')
  total.value = sizeRes.data
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const getRankClass = (r) => {
  if (r === 1) return 'rank-gold'
  if (r === 2) return 'rank-silver'
  if (r === 3) return 'rank-bronze'
  return ''
}

onMounted(fetchData)
</script>
