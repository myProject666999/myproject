<template>
  <div>
    <div class="page-header">
      <span class="page-title">执行结果</span>
    </div>
    
    <div class="card-wrapper">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="任务ID">
          <el-input v-model="searchForm.task_id" placeholder="任务ID" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
            <el-option label="执行中" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="task_name" label="任务名称" min-width="150" />
        <el-table-column prop="execution_id" label="执行ID" width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 0 ? 'danger' : 'warning'" size="small">
              {{ row.status === 1 ? '成功' : row.status === 0 ? '失败' : '执行中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时(ms)" width="100" />
        <el-table-column prop="retry_times" label="重试次数" width="100" />
        <el-table-column prop="error_message" label="错误信息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="created_at" label="执行时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.page_size"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="执行详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="任务名称">{{ detail.task_name }}</el-descriptions-item>
        <el-descriptions-item label="执行ID">{{ detail.execution_id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detail.status === 1 ? 'success' : 'danger'" size="small">
            {{ detail.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ detail.duration }}ms</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ detail.started_at }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ detail.ended_at }}</el-descriptions-item>
        <el-descriptions-item label="错误信息" v-if="detail.error_message">{{ detail.error_message }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="detail.result_data" style="margin-top: 20px;">
        <div style="font-weight: 600; margin-bottom: 10px;">结果数据:</div>
        <pre style="background: #f5f7fa; padding: 15px; border-radius: 4px; max-height: 300px; overflow: auto;">{{ JSON.stringify(detail.result_data, null, 2) }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getResults, getResult } from '@/api'

const searchForm = reactive({
  page: 1,
  page_size: 10,
  task_id: '',
  status: ''
})

const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const detail = ref({})

const loadData = async () => {
  try {
    const params = { ...searchForm }
    if (params.task_id) params.task_id = Number(params.task_id)
    if (params.status) params.status = Number(params.status)
    const res = await getResults(params)
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error(error)
  }
}

const viewDetail = async (row) => {
  detail.value = row
  detailVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>
