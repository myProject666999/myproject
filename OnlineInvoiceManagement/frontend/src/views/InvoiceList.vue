<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-form :inline="true" :model="filter">
          <el-form-item label="关键字">
            <el-input v-model="filter.keyword" placeholder="发票号码/抬头/税号" clearable style="width: 240px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="invoices" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="invoice_number" label="发票号码" min-width="160" />
        <el-table-column label="抬头名称" min-width="180">
          <template #default="{ row }">{{ row.title?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="税号" min-width="180">
          <template #default="{ row }">{{ row.title?.tax_number || '-' }}</template>
        </el-table-column>
        <el-table-column prop="issued_date" label="开票日期" width="130" />
        <el-table-column prop="total_amount" label="价税合计(¥)" width="140" align="right">
          <template #default="{ row }">{{ formatMoney(row.total_amount) }}</template>
        </el-table-column>
        <el-table-column prop="net_amount" label="金额(¥)" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.net_amount) }}</template>
        </el-table-column>
        <el-table-column prop="tax_amount" label="税额(¥)" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.tax_amount) }}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="$router.push(`/invoices/${row.id}`)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { invoiceApi } from '../api'

const loading = ref(false)
const invoices = ref([])
const filter = ref({ keyword: '' })

const loadData = async () => {
  loading.value = true
  try {
    const res = await invoiceApi.list(filter.value.keyword)
    invoices.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filter.value = { keyword: '' }
  loadData()
}

const formatMoney = (v) => Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', { hour12: false })
}

onMounted(loadData)
</script>

<style scoped>
.page-container {
  padding: 0;
}

.filter-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.filter-bar .el-form {
  margin-bottom: 0;
}
</style>