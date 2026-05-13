<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">今日订单数</div>
            <div class="stat-value">{{ data.revenue?.totalOrders || 0 }}</div>
          </div>
          <el-icon class="stat-icon"><Document /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">今日总营收</div>
            <div class="stat-value">¥{{ data.revenue?.totalRevenue || 0 }}</div>
          </div>
          <el-icon class="stat-icon"><Wallet /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">新增会员</div>
            <div class="stat-value">{{ data.newMemberCount || 0 }}</div>
          </div>
          <el-icon class="stat-icon"><UserPlus /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">会员充值</div>
            <div class="stat-value">¥{{ data.memberRecharge?.totalRecharge || 0 }}</div>
          </div>
          <el-icon class="stat-icon"><CreditCard /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>营收构成</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="球台收入">
              ¥{{ data.revenue?.tableRevenue || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="商品收入">
              ¥{{ data.revenue?.productRevenue || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="优惠减免">
              ¥{{ (data.revenue?.totalRevenue || 0) - (data.revenue?.netRevenue || 0) }}
            </el-descriptions-item>
            <el-descriptions-item label="实际收入">
              <strong style="color: #409EFF;">¥{{ data.revenue?.netRevenue || 0 }}</strong>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>支付方式分布</span>
          </template>
          <el-table :data="data.paymentMethods || []" stripe>
            <el-table-column prop="payment_method" label="支付方式" />
            <el-table-column prop="count" label="订单数" />
            <el-table-column prop="total" label="金额" :formatter="formatCurrency" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>热销商品 TOP10</span>
      </template>
      <el-table :data="data.topProducts || []" stripe>
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="totalQuantity" label="销售数量" />
        <el-table-column prop="totalAmount" label="销售金额" :formatter="formatCurrency" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'

const data = ref({})

async function fetchData() {
  try {
    const response = await api.get('/reports/today')
    data.value = response.data
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

function formatCurrency(row) {
  return '¥' + row.total
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.stat-card {
  cursor: pointer;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-icon {
  font-size: 48px;
  color: #409EFF;
  opacity: 0.5;
}
</style>
