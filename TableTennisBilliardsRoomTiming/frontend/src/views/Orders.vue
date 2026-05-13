<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="margin-right: 10px;"
              @change="fetchData"
            />
            <el-button @click="fetchData" :icon="Refresh">刷新</el-button>
          </div>
        </div>
      </template>
      <el-table :data="orders" stripe>
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="table_number" label="球台" width="100" />
        <el-table-column prop="member_name" label="会员" width="100" />
        <el-table-column prop="table_duration" label="时长(分)" width="100" />
        <el-table-column prop="table_fee" label="台费" width="100">
          <template #default="{ row }">¥{{ row.table_fee }}</template>
        </el-table-column>
        <el-table-column prop="product_total" label="商品费" width="100">
          <template #default="{ row }">¥{{ row.product_total }}</template>
        </el-table-column>
        <el-table-column prop="total_amount" label="总金额" width="100">
          <template #default="{ row }">¥{{ row.total_amount }}</template>
        </el-table-column>
        <el-table-column prop="actual_amount" label="实付" width="100">
          <template #default="{ row }">
            <strong style="color: #409EFF;">¥{{ row.actual_amount }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="支付方式" width="100">
          <template #default="{ row }">
            {{ { cash: '现金', wechat: '微信', alipay: '支付宝', member: '会员', other: '其他' }[row.payment_method] }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 'paid' ? 'success' : 'info'">
              {{ { pending: '待付', paid: '已付', cancelled: '取消', refunded: '退款' }[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="170" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import api from '../utils/api'

const orders = ref([])
const dateRange = ref(null)

async function fetchData() {
  try {
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const response = await api.get('/orders', { params })
    orders.value = response.data
  } catch (error) {
    console.error('获取订单列表失败:', error)
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

.header-actions {
  display: flex;
  align-items: center;
}
</style>
