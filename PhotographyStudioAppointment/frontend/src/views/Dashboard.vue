<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stats-card">
          <el-statistic title="总订单数" :value="stats.totalAppointments" value-style="color: #409eff;">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <el-statistic title="本月订单" :value="stats.todayAppointments" value-style="color: #67c23a;">
            <template #prefix>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <el-statistic title="总营业额" :value="stats.totalAmount" :precision="2" suffix="元" value-style="color: #e6a23c;">
            <template #prefix>
              <el-icon><Money /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <el-statistic title="待处理工单" :value="pendingWorkOrders" value-style="color: #f56c6c;">
            <template #prefix>
              <el-icon><Tickets /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>订单状态统计</span>
            </div>
          </template>
          <el-table :data="statusList" style="width: 100%">
            <el-table-column label="状态" width="150">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="count">
              <template #default="{ row }">
                <strong>{{ row.count }}</strong>
              </template>
            </el-table-column>
            <el-table-column label="占比">
              <template #default="{ row }">
                <el-progress :percentage="getPercentage(row.count)" :stroke-width="12" :show-text="false" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>快捷操作</span>
            </div>
          </template>
          <el-row :gutter="10" style="margin-bottom: 10px;">
            <el-col :span="12">
              <el-button type="primary" style="width: 100%" @click="goTo('/appointments')">
                <el-icon><Plus /></el-icon>
                新建预约
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button type="success" style="width: 100%" @click="goTo('/schedule')">
                <el-icon><Clock /></el-icon>
                查看档期
              </el-button>
            </el-col>
          </el-row>
          <el-row :gutter="10" style="margin-bottom: 10px;">
            <el-col :span="12">
              <el-button type="warning" style="width: 100%" @click="goTo('/photos')">
                <el-icon><Picture /></el-icon>
                客片管理
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button type="danger" style="width: 100%" @click="goTo('/work-orders')">
                <el-icon><Tickets /></el-icon>
                工单处理
              </el-button>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-button style="width: 100%" @click="goTo('/packages')">
                <el-icon><ShoppingBag /></el-icon>
                套餐管理
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button style="width: 100%" @click="goTo('/deliveries')">
                <el-icon><Goods /></el-icon>
                成品交付
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAppointmentStats, getWorkOrders } from '@/api'

const router = useRouter()

const stats = ref({
  totalAppointments: 0,
  totalAmount: 0,
  todayAppointments: 0,
  statusCounts: []
})

const pendingWorkOrders = ref(0)

const statusList = computed(() => {
  if (!stats.value.statusCounts || stats.value.statusCounts.length === 0) {
    return []
  }
  return stats.value.statusCounts.map(item => ({
    status: item.status,
    count: parseInt(item.count)
  }))
})

const getStatusText = (status) => {
  const map = {
    pending: '待确认',
    confirmed: '已确认',
    shooting: '拍摄中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'primary',
    shooting: 'success',
    completed: 'info',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const getPercentage = (count) => {
  const total = stats.value.totalAppointments || 1
  return Math.round((count / total) * 100)
}

const fetchStats = async () => {
  try {
    const data = await getAppointmentStats()
    stats.value = data
  } catch (error) {
    console.error(error)
  }
}

const fetchWorkOrders = async () => {
  try {
    const data = await getWorkOrders({ status: 'pending', pageSize: 1 })
    pendingWorkOrders.value = data.total || 0
  } catch (error) {
    console.error(error)
  }
}

const goTo = (path) => {
  router.push(path)
}

onMounted(() => {
  fetchStats()
  fetchWorkOrders()
})
</script>
