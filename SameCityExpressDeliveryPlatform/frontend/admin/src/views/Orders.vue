<template>
  <div class="page-container">
    <div class="page-header">
      <h2>订单管理</h2>
      <el-button type="primary" @click="loadData">刷新</el-button>
    </div>

    <el-card style="margin-bottom: 20px">
      <el-form :inline="true" :model="filters">
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 150px">
            <el-option
              v-for="(label, value) in statusLabels"
              :key="value"
              :label="label"
              :value="parseInt(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="orders" v-loading="loading" stripe>
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="user.username" label="用户" width="120" />
        <el-table-column prop="rider.username" label="骑手" width="120">
          <template #default="{ row }">
            {{ row.rider?.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="物品类型" width="100">
          <template #default="{ row }">
            {{ itemTypeLabels[row.item_type] || '其他' }}
          </template>
        </el-table-column>
        <el-table-column prop="distance" label="距离(km)" width="100">
          <template #default="{ row }">
            {{ row.distance?.toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_price" label="金额(¥)" width="100">
          <template #default="{ row }">
            <span style="color: #ff6034; font-weight: 600">{{ row.total_price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <span :class="['status-tag', getStatusClass(row.status)]">
              {{ statusLabels[row.status] || '未知' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; text-align: right"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'

const loading = ref(false)
const orders = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filters = reactive({
  status: undefined as number | undefined
})

const statusLabels: Record<number, string> = {
  0: '待接单',
  1: '已接单',
  2: '取件中',
  3: '已取件',
  4: '配送中',
  5: '待签收',
  6: '已完成',
  7: '已取消',
  8: '异常'
}

const itemTypeLabels: Record<number, string> = {
  1: '文件',
  2: '鲜花',
  3: '食品',
  4: '其他'
}

function getStatusClass(status: number) {
  if (status === 0) return 'status-pending'
  if (status >= 1 && status <= 5) return 'status-accepted'
  if (status === 6) return 'status-completed'
  return 'status-cancelled'
}

function formatTime(timeStr: string) {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

async function loadData() {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      page_size: pageSize.value
    }
    if (filters.status !== undefined) {
      params.status = filters.status
    }

    const res = await request.get('/admin/orders', { params })
    orders.value = res.orders || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载订单失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
