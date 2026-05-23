<template>
  <div class="page-container">
    <div class="page-header">
      <h2>题目列表</h2>
      <div>
        <el-input v-model="keyword" placeholder="搜索题目" style="width: 200px; margin-right: 10px;" clearable @clear="fetchData" />
        <el-select v-model="difficulty" placeholder="难度" style="width: 120px; margin-right: 10px;" clearable @change="fetchData">
          <el-option label="简单" :value="1" />
          <el-option label="中等" :value="2" />
          <el-option label="困难" :value="3" />
        </el-select>
      </div>
    </div>
    <div class="card">
      <el-table :data="problemList" stripe class="table-container">
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="标题">
          <template #default="scope">
            <router-link :to="`/problem/detail/${scope.row.id}`" style="color: #409eff; text-decoration: none;">
              {{ scope.row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="难度" width="100">
          <template #default="scope">
            <span :class="getDifficultyClass(scope.row.difficulty)">
              {{ getDifficultyText(scope.row.difficulty) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="通过率" width="120">
          <template #default="scope">
            {{ scope.row.submitCount > 0 ? ((scope.row.acceptedCount / scope.row.submitCount * 100).toFixed(1) + '%') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.acStatus === 1" type="success" size="small">已通过</el-tag>
            <el-tag v-else-if="scope.row.acStatus === 0" type="info" size="small">未通过</el-tag>
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
import request from '@/utils/request'

const problemList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const difficulty = ref(null)

const fetchData = async () => {
  const res = await request.get('/problem/list', {
    params: {
      page: currentPage.value,
      size: pageSize.value,
      keyword: keyword.value,
      difficulty: difficulty.value
    }
  })
  problemList.value = res.data.records
  total.value = res.data.total
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const getDifficultyText = (d) => {
  const map = { 1: '简单', 2: '中等', 3: '困难' }
  return map[d] || '未知'
}

const getDifficultyClass = (d) => {
  const map = { 1: 'difficulty-easy', 2: 'difficulty-medium', 3: 'difficulty-hard' }
  return map[d] || ''
}

onMounted(fetchData)
</script>
