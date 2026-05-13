<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>当前进行中订单</span>
          <el-button type="primary" @click="loadOrders" :icon="Refresh">刷新</el-button>
        </div>
      </template>
      <el-table :data="orders" border>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="tableNo" label="桌台" width="100" />
        <el-table-column prop="memberName" label="会员" width="100">
          <template #default="{ row }">
            {{ row.memberName || '散客' }}
          </template>
        </el-table-column>
        <el-table-column label="开台时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="已使用时长" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailDialog" title="订单详情" width="600px">
      <div v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="桌台">{{ detail.tableNo }}</el-descriptions-item>
          <el-descriptions-item label="会员">{{ detail.memberName || '散客' }}</el-descriptions-item>
          <el-descriptions-item label="开台时间">{{ formatTime(detail.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="当前时长">{{ formatDuration(detail.startTime) }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <h4>商品清单</h4>
        <el-table :data="detail.orderItems || []" size="small">
          <el-table-column prop="productName" label="商品" />
          <el-table-column prop="price" label="单价" />
          <el-table-column prop="quantity" label="数量" />
          <el-table-column prop="totalPrice" label="小计" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getActiveOrders, getOrderDetail } from '../api'
import { Refresh } from '@element-plus/icons-vue'

const orders = ref([])
const detailDialog = ref(false)
const detail = ref(null)

async function loadOrders() {
  try {
    orders.value = await getActiveOrders()
  } catch (e) {
    console.error(e)
  }
}

async function viewDetail(row) {
  try {
    detail.value = await getOrderDetail(row.id)
    detailDialog.value = true
  } catch (e) {
    console.error(e)
  }
}

function formatTime(time) {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

function formatDuration(startTime) {
  if (!startTime) return ''
  const start = new Date(startTime)
  const now = new Date()
  const diff = Math.floor((now - start) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return h + '小时' + m + '分'
}

onMounted(() => {
  loadOrders()
})
</script>
