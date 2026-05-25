<template>
  <div class="my-page">
    <el-card class="my-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#409EFF"><Tickets /></el-icon>
          <span class="card-title">我的报销</span>
        </div>
      </template>

      <div class="filter-bar">
        <el-form :inline="true" :model="filter" class="filter-form">
          <el-form-item label="状态">
            <el-select
              v-model="filter.status"
              placeholder="全部状态"
              clearable
              style="width: 160px"
            >
              <el-option
                v-for="opt in statusOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filter.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 260px"
            />
          </el-form-item>

          <el-form-item label="标题">
            <el-input
              v-model="filter.title"
              placeholder="请输入标题关键字"
              clearable
              style="width: 220px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">
              查询
            </el-button>
            <el-button :icon="RefreshRight" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column
          prop="reimburseNo"
          label="报销单号"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="title"
          label="标题"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="typeName" label="类型" width="120" />
        <el-table-column label="金额(元)" width="130" align="right">
          <template #default="{ row }">
            <span class="amount-value">¥ {{ formatMoney(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="light">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="submitTime"
          label="提交时间"
          width="170"
          align="center"
        />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="row.status === 'DRAFT'"
              type="warning"
              link
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'DRAFT'"
              type="danger"
              link
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
            <el-button
              v-if="row.status === 'REJECTED'"
              type="success"
              link
              :icon="Refresh"
              @click="handleResubmit(row)"
            >
              重新提交
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Tickets,
  Search,
  RefreshRight,
  View,
  Edit,
  Delete,
  Refresh
} from '@element-plus/icons-vue'
import {
  getMyReimbursements,
  deleteReimbursement,
  submitReimbursement
} from '@/api/reimbursement'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])

const filter = reactive({
  status: '',
  dateRange: [],
  title: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const statusOptions = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'PENDING', label: '审批中' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'PAID', label: '已付款' }
]

const statusTagType = (status) => {
  const map = {
    DRAFT: 'info',
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    PAID: 'primary'
  }
  return map[status] || 'info'
}

const statusLabel = (status) => {
  const map = {
    DRAFT: '草稿',
    PENDING: '审批中',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    PAID: '已付款'
  }
  return map[status] || status
}

const formatMoney = (val) => {
  const n = Number(val) || 0
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const buildParams = () => {
  const params = {
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize
  }
  if (filter.status) params.status = filter.status
  if (filter.title) params.title = filter.title
  if (filter.dateRange && filter.dateRange.length === 2) {
    params.startDate = filter.dateRange[0]
    params.endDate = filter.dateRange[1]
  }
  return params
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getMyReimbursements(buildParams())
    if (res.code === 200) {
      const data = res.data || {}
      tableData.value = data.records || data.list || data || []
      pagination.total = data.total || tableData.value.length
    } else {
      ElMessage.error(res.message || '获取列表失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchList()
}

const handleReset = () => {
  filter.status = ''
  filter.dateRange = []
  filter.title = ''
  pagination.pageNum = 1
  fetchList()
}

const handleView = (row) => {
  router.push(`/detail/${row.id}`)
}

const handleEdit = (row) => {
  router.push({
    path: '/submit',
    query: { id: row.id }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认删除报销单「${row.title}」？删除后无法恢复。`,
      '删除确认',
      { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await deleteReimbursement(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      if (tableData.value.length === 1 && pagination.pageNum > 1) {
        pagination.pageNum -= 1
      }
      fetchList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e === 'cancel') return
  }
}

const handleResubmit = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认重新提交报销单「${row.title}」？`,
      '重新提交',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'info' }
    )
    const res = await submitReimbursement(row.id)
    if (res.code === 200) {
      ElMessage.success('已重新提交，进入审批流程')
      fetchList()
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (e) {
    if (e === 'cancel') return
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.my-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.my-card {
  max-width: 1280px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.filter-bar {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
}

.filter-form {
  margin-bottom: 0;
}

.amount-value {
  color: #f56c6c;
  font-weight: 600;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
