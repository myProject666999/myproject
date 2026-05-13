<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>营收统计</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="fetchData"
            />
          </div>
        </div>
      </template>
      <el-table :data="statistics" stripe>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="totalOrders" label="订单数" width="100" />
        <el-table-column prop="totalRevenue" label="总营收" width="120">
          <template #default="{ row }">¥{{ row.totalRevenue || 0 }}</template>
        </el-table-column>
        <el-table-column prop="netRevenue" label="实收" width="120">
          <template #default="{ row }">
            <strong style="color: #409EFF;">¥{{ row.netRevenue || 0 }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="tableRevenue" label="台费" width="120">
          <template #default="{ row }">¥{{ row.tableRevenue || 0 }}</template>
        </el-table-column>
        <el-table-column prop="productRevenue" label="商品费" width="120">
          <template #default="{ row }">¥{{ row.productRevenue || 0 }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px;" v-if="statistics.length > 0">
      <template #header>
        <span>汇总数据</span>
      </template>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="订单总数">
          {{ totalStats.totalOrders }} 笔
        </el-descriptions-item>
        <el-descriptions-item label="总营收">
          ¥{{ totalStats.totalRevenue }}
        </el-descriptions-item>
        <el-descriptions-item label="总实收">
          <strong style="color: #409EFF;">¥{{ totalStats.netRevenue }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="优惠总额">
          ¥{{ totalStats.discount }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../utils/api'

const statistics = ref([])
const dateRange = ref(null)

const totalStats = computed(() => {
  if (statistics.value.length === 0) {
    return { totalOrders: 0, totalRevenue: 0, netRevenue: 0, discount: 0 }
  }
  return statistics.value.reduce(
    (acc, item) => ({
      totalOrders: acc.totalOrders + (item.totalOrders || 0),
      totalRevenue: acc.totalRevenue + (Number(item.totalRevenue) || 0),
      netRevenue: acc.netRevenue + (Number(item.netRevenue) || 0),
      discount: acc.discount + ((Number(item.totalRevenue) || 0) - (Number(item.netRevenue) || 0))
    }),
    { totalOrders: 0, totalRevenue: 0, netRevenue: 0, discount: 0 }
  )
})

async function fetchData() {
  try {
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const response = await api.get('/reports/statistics', { params })
    statistics.value = response.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
