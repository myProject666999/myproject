<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">待执行工单</span>
    </div>

    <el-table :data="tableData" stripe v-loading="loading">
      <el-table-column prop="orderNo" label="工单编号" width="180" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="dbName" label="目标数据库" width="140" />
      <el-table-column prop="applicantName" label="申请人" width="100" />
      <el-table-column prop="riskLevel" label="风险等级" width="100">
        <template #default="{ row }">
          <el-tag :class="'risk-tag ' + row.riskLevel" size="small">{{ getRiskText(row.riskLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :class="'status-tag ' + row.status" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="viewDetail(row)">详情</el-button>
          <el-button type="primary" size="small" @click="startExecution(row)" v-if="row.status === 'pending_execution'">执行</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList } from '@/api/order'
import { startExecution as startExecutionApi } from '@/api/execution'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])

const getStatusText = (status) => {
  const map = {
    pending_execution: '待执行',
    executing: '执行中',
    success: '成功',
    failed: '失败'
  }
  return map[status] || status
}

const getRiskText = (level) => {
  const map = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '极高风险'
  }
  return map[level] || level
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOrderList({ pageNum: 1, pageSize: 100, status: 'pending_execution' })
    tableData.value = res.data.records || []
  } finally {
    loading.value = false
  }
}

const viewDetail = (row) => {
  router.push(`/order/detail/${row.id}`)
}

const startExecution = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要执行该工单吗？执行后将不可撤销，请确认SQL和回滚预案已准备好。',
      '确认执行',
      {
        confirmButtonText: '确定执行',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )
    const res = await startExecutionApi(row.id)
    ElMessage.success('已开始执行')
    router.push(`/execution/detail/${res.data.id}`)
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>
