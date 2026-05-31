<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">工单列表</span>
      <el-button type="primary" @click="$router.push('/order/create')">
        <el-icon><Plus /></el-icon>
        创建工单
      </el-button>
    </div>

    <el-form :inline="true" class="search-bar" size="small">
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable>
          <el-option label="草稿" value="draft" />
          <el-option label="待评审" value="pending_review" />
          <el-option label="待执行" value="pending_execution" />
          <el-option label="执行中" value="executing" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe v-loading="loading">
      <el-table-column prop="orderNo" label="工单编号" width="180" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="dbName" label="目标数据库" width="140" />
      <el-table-column prop="applicantName" label="申请人" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :class="'status-tag ' + row.status" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="riskLevel" label="风险等级" width="100">
        <template #default="{ row }">
          <el-tag :class="'risk-tag ' + row.riskLevel" size="small">{{ getRiskText(row.riskLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="viewDetail(row)">查看</el-button>
          <el-button type="text" size="small" @click="editOrder(row)" v-if="row.status === 'draft' || row.status === 'need_modify'">编辑</el-button>
          <el-button type="text" size="small" @click="cancelOrder(row)" v-if="row.status !== 'executing' && row.status !== 'success'">取消</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, cancelOrder as cancelOrderApi } from '@/api/order'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  status: ''
})

const getStatusText = (status) => {
  const map = {
    draft: '草稿',
    pending_review: '待评审',
    reviewing: '评审中',
    pending_execution: '待执行',
    executing: '执行中',
    success: '成功',
    failed: '失败',
    rollback: '已回滚',
    cancelled: '已取消',
    rejected: '已驳回',
    need_modify: '需修改'
  }
  return map[status] || status
}

const getRiskText = (level) => {
  const map = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '极高风险',
    unknown: '未知'
  }
  return map[level] || level
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOrderList(queryParams.value)
    tableData.value = res.data.records || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    status: ''
  }
  loadData()
}

const handleSizeChange = (size) => {
  queryParams.value.pageSize = size
  loadData()
}

const handleCurrentChange = (page) => {
  queryParams.value.pageNum = page
  loadData()
}

const viewDetail = (row) => {
  router.push(`/order/detail/${row.id}`)
}

const editOrder = (row) => {
  router.push({ path: '/order/create', query: { id: row.id } })
}

const cancelOrder = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消该工单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cancelOrderApi(row.id)
    ElMessage.success('取消成功')
    loadData()
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

<style scoped>
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
