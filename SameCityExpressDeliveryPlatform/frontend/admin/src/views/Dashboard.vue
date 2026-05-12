<template>
  <div class="page-container">
    <div class="page-header">
      <h2>数据统计</h2>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <div class="stats-card">
          <div class="value">{{ stats.totalOrders }}</div>
          <div class="label">总订单数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card">
          <div class="value" style="color: #67c23a">{{ stats.totalRevenue.toFixed(2) }}</div>
          <div class="label">总营收 (¥)</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card">
          <div class="value" style="color: #409eff">{{ stats.totalUsers }}</div>
          <div class="label">总用户数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card">
          <div class="value" style="color: #e6a23c">{{ stats.totalRiders }}</div>
          <div class="label">总骑手数</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>订单状态统计</span>
          </template>
          <div v-if="orderStats.length > 0">
            <el-progress
              v-for="stat in orderStats"
              :key="stat.status"
              :percentage="stat.percentage"
              :format="() => `${stat.label}: ${stat.count}`"
              :color="stat.color"
              style="margin-bottom: 15px"
            />
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>异常工单统计</span>
          </template>
          <div v-if="exceptionStats.length > 0">
            <el-progress
              v-for="stat in exceptionStats"
              :key="stat.status"
              :percentage="stat.percentage"
              :format="() => `${stat.label}: ${stat.count}`"
              :color="stat.color"
              style="margin-bottom: 15px"
            />
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'

const stats = reactive({
  totalOrders: 0,
  totalRevenue: 0,
  totalUsers: 0,
  totalRiders: 0
})

const orderStats = ref<any[]>([])
const exceptionStats = ref<any[]>([])

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

const exceptionLabels: Record<number, string> = {
  0: '待处理',
  1: '处理中',
  2: '已解决',
  3: '已驳回'
}

const statusColors: Record<number, string> = {
  0: '#e6a23c',
  1: '#409eff',
  2: '#409eff',
  3: '#67c23a',
  4: '#67c23a',
  5: '#67c23a',
  6: '#67c23a',
  7: '#f56c6c',
  8: '#f56c6c'
}

const exceptionColors: Record<number, string> = {
  0: '#e6a23c',
  1: '#409eff',
  2: '#67c23a',
  3: '#f56c6c'
}

async function loadStats() {
  try {
    const orders = await request.get('/admin/orders', { params: { page: 1, page_size: 1000 } })
    const users = await request.get('/admin/users', { params: { page: 1, page_size: 1000 } })
    const riders = await request.get('/admin/riders', { params: { page: 1, page_size: 1000 } })
    const exceptions = await request.get('/admin/exception', { params: { page: 1, page_size: 1000 } })

    const ordersList = orders.orders || []
    stats.totalOrders = orders.total || 0
    stats.totalRevenue = ordersList.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0)
    stats.totalUsers = users.total || 0
    stats.totalRiders = riders.total || 0

    const orderStatusCount: Record<number, number> = {}
    ordersList.forEach((o: any) => {
      orderStatusCount[o.status] = (orderStatusCount[o.status] || 0) + 1
    })

    const totalOrderCount = ordersList.length || 1
    orderStats.value = Object.entries(orderStatusCount).map(([status, count]) => ({
      status: parseInt(status),
      count,
      label: statusLabels[parseInt(status)] || '未知',
      percentage: Math.round((count / totalOrderCount) * 100),
      color: statusColors[parseInt(status)] || '#909399'
    }))

    const exceptionsList = exceptions.exceptions || []
    const exceptionStatusCount: Record<number, number> = {}
    exceptionsList.forEach((e: any) => {
      exceptionStatusCount[e.status] = (exceptionStatusCount[e.status] || 0) + 1
    })

    const totalExceptionCount = exceptionsList.length || 1
    exceptionStats.value = Object.entries(exceptionStatusCount).map(([status, count]) => ({
      status: parseInt(status),
      count,
      label: exceptionLabels[parseInt(status)] || '未知',
      percentage: Math.round((count / totalExceptionCount) * 100),
      color: exceptionColors[parseInt(status)] || '#909399'
    }))
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>
