<template>
  <div class="my-orders-page">
    <div class="page-header">
      <h2>我的订单</h2>
    </div>
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待支付" name="0" />
      <el-tab-pane label="已支付" name="1" />
      <el-tab-pane label="已退款" name="2" />
      <el-tab-pane label="已取消" name="3" />
    </el-tabs>
    <div v-loading="loading">
      <el-table
        v-if="orders.length > 0"
        :data="orders"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="订单编号" width="120">
          <template #default="{ row }">
            <span class="order-id">#{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-cell">
              <div class="product-thumb">
                <el-image
                  :src="row.productImage"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 6px;"
                >
                  <template #error>
                    <div class="thumb-placeholder">
                      <el-icon :size="28"><Goods /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="product-text">
                <div class="product-name">{{ row.productName || '团购商品' }}</div>
                <div class="order-extra" v-if="row.groupId">
                  团购 #{{ row.groupId }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount || row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createTime || row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              type="danger"
              size="small"
              link
              :loading="refundingId === row.id"
              @click="handleRefund(row)"
            >
              申请退款
            </el-button>
            <el-button
              v-else
              type="primary"
              size="small"
              link
              disabled
            >
              无操作
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无订单记录" />
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchOrders"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi } from '@/api'

const orders = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const activeTab = ref('all')
const refundingId = ref(null)

async function fetchOrders() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await orderApi.getList(params)
    orders.value = res.data || []
    total.value = orders.value.length
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  currentPage.value = 1
  fetchOrders()
}

function handleSizeChange() {
  currentPage.value = 1
  fetchOrders()
}

async function handleRefund(order) {
  try {
    await ElMessageBox.confirm(
      `确定要申请退款吗？订单号：#${order.id}`,
      '申请退款',
      {
        confirmButtonText: '确定退款',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }
  refundingId.value = order.id
  try {
    await orderApi.refund(order.id, { reason: '用户申请退款' })
    ElMessage.success('退款申请已提交')
    fetchOrders()
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    refundingId.value = null
  }
}

function statusTagType(status) {
  const map = {
    0: 'warning',
    1: 'success',
    2: 'info',
    3: 'danger'
  }
  return map[status] || 'info'
}

function statusText(status) {
  const map = {
    0: '待支付',
    1: '已支付',
    2: '已退款',
    3: '已取消'
  }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.my-orders-page {
  padding: 10px 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.order-id {
  font-family: monospace;
  color: #606266;
}

.product-cell {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-thumb {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f5f7fa;
  flex-shrink: 0;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.product-text {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.order-extra {
  font-size: 12px;
  color: #909399;
}

.amount {
  font-weight: 600;
  color: #f56c6c;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
