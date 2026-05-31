<template>
  <div class="reports-page">
    <el-card>
      <template #header>
        <span>压测报告</span>
      </template>
      <el-table :data="reports" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="报告名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="total_requests" label="总请求数" width="120" />
        <el-table-column prop="avg_qps" label="平均QPS" width="120">
          <template #default="{ row }">{{ row.avg_qps?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="peak_qps" label="峰值QPS" width="100" />
        <el-table-column prop="p95_rt" label="P95(ms)" width="100" />
        <el-table-column prop="p99_rt" label="P99(ms)" width="100" />
        <el-table-column prop="error_rate" label="错误率" width="100">
          <template #default="{ row }">
            <el-tag :type="row.error_rate > 0 ? 'danger' : 'success'" size="small">
              {{ row.error_rate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewDetail(row)">查看</el-button>
            <el-button size="small" type="danger" @click="deleteReport(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        style="margin-top: 20px; justify-content: flex-end; display: flex"
        @size-change="loadReports"
        @current-change="loadReports"
      />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reportApi } from '@/api'

const router = useRouter()

const loading = ref(false)
const reports = ref([])
const pagination = ref({ page: 1, size: 10, total: 0 })

const loadReports = async () => {
  loading.value = true
  try {
    const res = await reportApi.list({ page: pagination.value.page, page_size: pagination.value.size })
    reports.value = res.list || []
    pagination.value.total = res.total || 0
  } finally {
    loading.value = false
  }
}

const viewDetail = (row) => {
  router.push(`/reports/${row.id}`)
}

const deleteReport = async (row) => {
  await ElMessageBox.confirm('确定删除该报告吗？', '提示', { type: 'warning' })
  await reportApi.remove(row.id)
  ElMessage.success('删除成功')
  loadReports()
}

onMounted(loadReports)
</script>
