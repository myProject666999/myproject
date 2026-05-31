<template>
  <div class="comparisons-page">
    <el-card>
      <template #header><span>对比分析</span></template>
      <el-table :data="comparisons" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="对比名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="baseline_id" label="基线ID" width="100" />
        <el-table-column prop="report_id" label="报告ID" width="100" />
        <el-table-column label="是否告警" width="100">
          <template #default="{ row }">
            <el-tag :type="row.has_alarm ? 'danger' : 'success'" size="small">
              {{ row.has_alarm ? '有告警' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        style="margin-top: 20px; justify-content: flex-end; display: flex"
        @size-change="loadComparisons"
        @current-change="loadComparisons"
      />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { comparisonApi } from '@/api'

const loading = ref(false)
const comparisons = ref([])
const pagination = ref({ page: 1, size: 10, total: 0 })

const loadComparisons = async () => {
  loading.value = true
  try {
    const res = await comparisonApi.list({ page: pagination.value.page, page_size: pagination.value.size })
    comparisons.value = res.list || []
    pagination.value.total = res.total || 0
  } finally {
    loading.value = false
  }
}

onMounted(loadComparisons)
</script>
