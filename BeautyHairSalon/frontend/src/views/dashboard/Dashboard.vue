
<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
          <div class="stat-icon" :class="stat.type">
            <el-icon :size="28">
              <component :is="stat.icon" />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span style="font-weight: bold;">今日预约趋势</span>
          </template>
          <div style="height: 300px;">
            <el-empty v-if="!hasCharts" description="暂无数据" />
            <div v-else style="font-size: 14px; color: #909399; text-align: center; line-height: 300px;">
              营业数据图表区域
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span style="font-weight: bold;">会员分布</span>
          </template>
          <div style="height: 300px;">
            <el-empty v-if="!hasCharts" description="暂无数据" />
            <div v-else style="font-size: 14px; color: #909399; text-align: center; line-height: 300px;">
              会员数据图表区域
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span style="font-weight: bold;">最近预约</span>
          </template>
          <el-table :data="recentAppointments" stripe>
            <el-table-column prop="appointmentNo" label="预约编号" width="150" />
            <el-table-column prop="customerName" label="顾客姓名" width="120" />
            <el-table-column prop="phone" label="联系电话" width="130" />
            <el-table-column prop="serviceName" label="预约项目" />
            <el-table-column prop="appointmentDate" label="预约日期" width="120" />
            <el-table-column prop="appointmentTime" label="预约时间" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Wallet, Calendar, TrendCharts } from '@element-plus/icons-vue'
import { getDashboardData } from '@/api/dashboard'
import { getAppointmentPage } from '@/api/appointment'
import { ElMessage } from 'element-plus'

const hasCharts = ref(false)

const stats = ref([
  { title: '今日营业额', value: '¥0', type: 'primary', icon: Wallet, key: 'todayRevenue', prefix: '¥' },
  { title: '会员总数', value: '0', type: 'success', icon: User, key: 'totalMembers' },
  { title: '今日预约数', value: '0', type: 'warning', icon: Calendar, key: 'todayAppointments' },
  { title: '今日生日会员', value: '0', type: 'danger', icon: User, key: 'todayBirthdays' }
])

const recentAppointments = ref([])

const loadDashboardData = async () => {
  try {
    const res = await getDashboardData()
    if (res.code === 200 && res.data) {
      const { statistics, last7DaysRevenue } = res.data
      
      stats.value.forEach(stat => {
        if (stat.key && statistics[stat.key] !== undefined) {
          let value = statistics[stat.key]
          if (stat.prefix) {
            stat.value = stat.prefix + value
          } else {
            stat.value = value
          }
        }
      })
      
      if (last7DaysRevenue && last7DaysRevenue.length > 0) {
        hasCharts.value = true
      }
    }
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  }
}

const loadRecentAppointments = async () => {
  try {
    const res = await getAppointmentPage({ page: 1, size: 5 })
    if (res.code === 200 && res.data) {
      recentAppointments.value = res.data.records || []
    }
  } catch (error) {
    console.error('加载预约数据失败:', error)
  }
}

onMounted(() => {
  loadDashboardData()
  loadRecentAppointments()
})

const getStatusType = (status) => {
  const map = { 1: 'info', 2: 'primary', 3: 'warning', 4: 'success', 5: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { 1: '待确认', 2: '已确认', 3: '已到店', 4: '已完成', 5: '已取消' }
  return map[status] || '未知'
}
</script>

<style scoped>
.dashboard {
  width: 100%;
}
</style>
