<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">支付记录</h2>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="支付类型">
          <el-select v-model="searchForm.payment_type" placeholder="全部" clearable @change="fetchList">
            <el-option label="临时停车费" :value="1" />
            <el-option label="月卡续费" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="searchForm.pay_method" placeholder="全部" clearable @change="fetchList">
            <el-option label="现金" value="现金" />
            <el-option label="微信" value="微信" />
            <el-option label="支付宝" value="支付宝" />
            <el-option label="月卡" value="月卡" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchList">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="payment_number" label="支付单号" width="200" />
      <el-table-column label="支付类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.payment_type === 1 ? 'info' : 'success'">
            {{ row.payment_type === 1 ? '临时停车费' : '月卡续费' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100">
        <template #default="{ row }">
          <span class="amount">¥{{ row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="pay_method" label="支付方式" width="100" />
      <el-table-column label="支付状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.pay_status === 1" type="success">已支付</el-tag>
          <el-tag v-else-if="row.pay_status === 2" type="info">已退款</el-tag>
          <el-tag v-else type="warning">待支付</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.pay_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" />
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.page_size"
      :page-sizes="[10, 20, 50]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="fetchList"
      @current-change="fetchList"
      style="margin-top: 20px; justify-content: flex-end"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getPaymentList } from '@/api'

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const searchForm = reactive({
  payment_type: '',
  pay_method: ''
})
const dateRange = ref([])

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    
    const res = await getPaymentList(params)
    if (res.code === 0) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.payment_type = ''
  searchForm.pay_method = ''
  dateRange.value = []
  pagination.page = 1
  fetchList()
}

const handleDateChange = () => {
  pagination.page = 1
  fetchList()
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.amount {
  font-weight: 600;
  color: #f56c6c;
}
</style>
