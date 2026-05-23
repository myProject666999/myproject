<template>
  <div class="page-container">
    <div class="page-header">
      <h2>提交记录</h2>
    </div>
    <div class="card">
      <el-form :inline="true" style="margin-bottom: 20px;">
        <el-form-item label="用户ID">
          <el-input v-model="filter.userId" placeholder="用户ID" style="width: 120px;" clearable @change="fetchData" />
        </el-form-item>
        <el-form-item label="题目ID">
          <el-input v-model="filter.problemId" placeholder="题目ID" style="width: 120px;" clearable @change="fetchData" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部" style="width: 150px;" clearable @change="fetchData">
            <el-option label="Pending" :value="0" />
            <el-option label="Judging" :value="1" />
            <el-option label="Accepted" :value="2" />
            <el-option label="Wrong Answer" :value="3" />
            <el-option label="Time Limit Exceeded" :value="4" />
            <el-option label="Memory Limit Exceeded" :value="5" />
            <el-option label="Runtime Error" :value="6" />
            <el-option label="Compile Error" :value="7" />
          </el-select>
        </el-form-item>
        <el-form-item label="语言">
          <el-select v-model="filter.language" placeholder="全部" style="width: 120px;" clearable @change="fetchData">
            <el-option label="C++" value="C++" />
            <el-option label="C" value="C" />
            <el-option label="Java" value="Java" />
            <el-option label="Python" value="Python" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-table :data="submissions" stripe>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="用户" width="120">
          <template #default="scope">
            <router-link v-if="scope.row.user" :to="`/user/profile/${scope.row.userId}`">
              {{ scope.row.user.nickname || scope.row.user.username }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="题目" width="200">
          <template #default="scope">
            <router-link :to="`/problem/detail/${scope.row.problemId}`">
              {{ scope.row.problem?.title || `#${scope.row.problemId}` }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="语言" prop="language" width="80" />
        <el-table-column label="状态" width="150">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.status)">{{ scope.row.statusText }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用时" width="80">
          <template #default="scope">
            {{ scope.row.timeUsed ? scope.row.timeUsed + 'ms' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="内存" width="80">
          <template #default="scope">
            {{ scope.row.memoryUsed ? scope.row.memoryUsed + 'MB' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="提交时间" prop="createTime" width="170" />
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <router-link :to="`/submission/detail/${scope.row.id}`">查看</router-link>
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

const submissions = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const filter = ref({
  userId: null,
  problemId: null,
  status: null,
  language: null
})

const fetchData = async () => {
  const params = {
    page: currentPage.value,
    size: pageSize.value
  }
  if (filter.value.userId) params.userId = filter.value.userId
  if (filter.value.problemId) params.problemId = filter.value.problemId
  if (filter.value.status !== null) params.status = filter.value.status
  if (filter.value.language) params.language = filter.value.language
  const res = await request.get('/submission/list', { params })
  submissions.value = res.data.records
  total.value = res.data.total
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const getStatusClass = (s) => {
  if (s === 2) return 'status-accepted'
  if (s === 0 || s === 1) return 'status-pending'
  return 'status-error'
}

onMounted(fetchData)
</script>
