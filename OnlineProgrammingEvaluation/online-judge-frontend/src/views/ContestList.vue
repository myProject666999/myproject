<template>
  <div class="page-container">
    <div class="page-header">
      <h2>竞赛列表</h2>
    </div>
    <div class="card">
      <el-table :data="contests" stripe>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="标题">
          <template #default="scope">
            <router-link :to="`/contest/detail/${scope.row.id}`" style="color: #409eff; text-decoration: none;">
              {{ scope.row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 2 ? 'warning' : ''" size="small">
              {{ scope.row.type === 2 ? 'CF赛' : '标准赛' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" prop="startTime" width="170" />
        <el-table-column label="结束时间" prop="endTime" width="170" />
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

const getStatusText = (s) => ({ 0: '未开始', 1: '进行中', 2: '已结束' }[s] || '未知')
const getStatusTagType = (s) => ({ 0: 'info', 1: 'success', 2: 'info' }[s] || 'info')

onMounted(fetchData)
</script>
