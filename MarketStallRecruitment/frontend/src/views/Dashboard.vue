<template>
  <div class="dashboard-container">
    <h2 class="page-title">Dashboard</h2>
    <el-row :gutter="20">
      <el-col :span="4" v-for="(stat, key) in stats" :key="key">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :class="'icon-' + key">
            <el-icon :size="30"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="actions-card" style="margin-top: 20px">
      <template #header>
        <span>Quick Actions</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" size="large" @click="goToEventList" style="width: 100%">
            <el-icon><List /></el-icon>
            Event List
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" size="large" @click="goToStallManagement" style="width: 100%">
            <el-icon><Grid /></el-icon>
            Stall Management
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboard } from '@/api/dashboard'
import { List, Grid, Tickets, Calendar, Document, Money, Clock } from '@element-plus/icons-vue'

const router = useRouter()
const stats = ref({
  totalEvents: { value: 0, label: 'Total Events', icon: Calendar },
  activeEvents: { value: 0, label: 'Active Events', icon: Tickets },
  totalRegistrations: { value: 0, label: 'Total Registrations', icon: Document },
  totalRevenue: { value: 0, label: 'Total Revenue', icon: Money },
  pendingAuditCount: { value: 0, label: 'Pending Audit', icon: Clock }
})

const fetchDashboard = async () => {
  try {
    const res = await getDashboard()
    stats.value.totalEvents.value = res.data.totalEvents || 0
    stats.value.activeEvents.value = res.data.activeEvents || 0
    stats.value.totalRegistrations.value = res.data.totalRegistrations || 0
    stats.value.totalRevenue.value = res.data.totalRevenue || 0
    stats.value.pendingAuditCount.value = res.data.pendingAuditCount || 0
  } catch (err) {
    console.error(err)
  }
}

const goToEventList = () => {
  router.push('/event/list')
}

const goToStallManagement = () => {
  router.push('/event/list')
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
}

.icon-totalEvents {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.icon-activeEvents {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.icon-totalRegistrations {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.icon-totalRevenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.icon-pendingAuditCount {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.actions-card .el-button {
  height: 60px;
  font-size: 16px;
}
</style>
