<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Document /></el-icon>
        借用记录
      </h2>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card-title">总记录数</div>
        <div class="stat-card-value">{{ stats.total_borrows || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">借出中</div>
        <div class="stat-card-value" style="color: #e6a23c;">{{ stats.active_borrows || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">已超期</div>
        <div class="stat-card-value" style="color: #f56c6c;">{{ stats.overdue_borrows || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">已归还</div>
        <div class="stat-card-value" style="color: #67c23a;">{{ stats.returned_borrows || 0 }}</div>
      </div>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索借用人或物品"
        clearable
        style="width: 250px;"
        :prefix-icon="Search"
      />
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px;">
        <el-option label="借出中" value="borrowed" />
        <el-option label="已归还" value="returned" />
        <el-option label="已超期" value="overdue" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
      />
      <el-button type="primary" :icon="Search" @click="loadRecords">搜索</el-button>
      <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
    </div>

    <el-table :data="records" v-loading="loading" style="width: 100%;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="item.name" label="物品名称" />
      <el-table-column prop="borrower_name" label="借用人" />
      <el-table-column prop="borrower_id" label="学号/工号" />
      <el-table-column prop="phone" label="联系电话" />
      <el-table-column prop="borrow_date" label="借出日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.borrow_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="expected_return_date" label="预计归还" width="120">
        <template #default="{ row }">
          <span :class="{ 'overdue-date': isOverdue(row) }">
            {{ formatDate(row.expected_return_date) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="actual_return_date" label="实际归还" width="120">
        <template #default="{ row }">
          {{ row.actual_return_date ? formatDate(row.actual_return_date) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
    </el-table>

    <el-empty v-if="!loading && records.length === 0" description="暂无记录" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Refresh, Document } from '@element-plus/icons-vue'
import { borrowApi } from '@/api'

const records = ref([])
const stats = ref({})
const loading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const dateRange = ref([])

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const isOverdue = (borrow) => {
  if (borrow.status !== 'borrowed') return false
  if (!borrow.expected_return_date) return false
  return new Date(borrow.expected_return_date) < new Date()
}

const getStatusType = (status) => {
  const map = {
    borrowed: 'warning',
    returned: 'success',
    overdue: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    borrowed: '借出中',
    returned: '已归还',
    overdue: '已超期'
  }
  return map[status] || status
}

const loadStats = async () => {
  try {
    const res = await borrowApi.getStats()
    stats.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadRecords = async () => {
  loading.value = true
  try {
    const params = {}
    if (filterStatus.value) params.status = filterStatus.value
    const res = await borrowApi.getBorrows(params)
    
    let data = res.data
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      data = data.filter(b =>
        b.borrower_name?.toLowerCase().includes(keyword) ||
        b.item?.name?.toLowerCase().includes(keyword) ||
        b.borrower_id?.toLowerCase().includes(keyword)
      )
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      const start = new Date(dateRange.value[0])
      const end = new Date(dateRange.value[1])
      end.setHours(23, 59, 59, 999)
      data = data.filter(b => {
        const borrowDate = new Date(b.borrow_date)
        return borrowDate >= start && borrowDate <= end
      })
    }
    
    records.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  dateRange.value = []
  loadRecords()
}

onMounted(() => {
  loadStats()
  loadRecords()
})
</script>

<style scoped>
.overdue-date {
  color: #f56c6c;
  font-weight: 500;
}
</style>
