<template>
  <div>
    <h2 style="margin-bottom: 20px">数据看板</h2>
    
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>宠物总数</span>
              <el-icon><Dog /></el-icon>
            </div>
          </template>
          <div class="text item">
            <h3>{{ stats.petCount }}</h3>
            <span>只</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>今日预约</span>
              <el-icon><Calendar /></el-icon>
            </div>
          </template>
          <div class="text item">
            <h3>{{ stats.todayAppointments }}</h3>
            <span>单</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>今日营收</span>
              <el-icon><Wallet /></el-icon>
            </div>
          </template>
          <div class="text item">
            <h3>¥{{ stats.todayRevenue.toFixed(2) }}</h3>
            <span>元</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>待处理提醒</span>
              <el-icon><Bell /></el-icon>
            </div>
          </template>
          <div class="text item">
            <h3>{{ stats.pendingReminders }}</h3>
            <span>条</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>即将到期提醒</span>
          </template>
          <el-table :data="upcomingReminders" style="width: 100%">
            <el-table-column prop="pet.name" label="宠物" width="100" />
            <el-table-column prop="title" label="提醒内容" />
            <el-table-column prop="reminderDate" label="提醒日期" width="120" />
            <el-table-column label="类型" width="80">
              <template #default="scope">
                <el-tag :type="getReminderTagType(scope.row.type)">
                  {{ getReminderTypeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>车辆状态</span>
          </template>
          <el-table :data="vehicles" style="width: 100%">
            <el-table-column prop="plateNumber" label="车牌号" width="120" />
            <el-table-column prop="driverName" label="司机" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getVehicleTagType(scope.row.status)">
                  {{ getVehicleStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="currentLocation" label="当前位置" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPets } from '@/api/pet'
import { getAppointments } from '@/api/appointment'
import { getVehicles } from '@/api/vehicle'
import { getUpcomingReminders } from '@/api/reminder'
import { getConsumptions } from '@/api/consumption'

const stats = ref({
  petCount: 0,
  todayAppointments: 0,
  todayRevenue: 0,
  pendingReminders: 0
})

const upcomingReminders = ref([])
const vehicles = ref([])

const getReminderTypeLabel = (type) => {
  const map = { vaccine: '疫苗', grooming: '洗护', custom: '自定义' }
  return map[type] || type
}

const getReminderTagType = (type) => {
  const map = { vaccine: 'danger', grooming: 'warning', custom: 'info' }
  return map[type] || 'info'
}

const getVehicleStatusLabel = (status) => {
  const map = { idle: '空闲', travelling: '行驶中', maintenance: '维修中' }
  return map[status] || status
}

const getVehicleTagType = (status) => {
  const map = { idle: 'success', travelling: 'primary', maintenance: 'danger' }
  return map[status] || 'info'
}

const loadData = async () => {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [pets, appointments, reminders, vehicleList, consumptions] = await Promise.all([
    getPets(),
    getAppointments({ startDate: today, endDate: tomorrow }),
    getUpcomingReminders(7),
    getVehicles(),
    getConsumptions({ startDate: today, endDate: tomorrow })
  ])

  stats.value.petCount = pets.length
  stats.value.todayAppointments = appointments.length
  stats.value.todayRevenue = consumptions.reduce((sum, item) => sum + parseFloat(item.actualAmount || 0), 0)
  stats.value.pendingReminders = reminders.filter(r => r.status === 'pending').length
  upcomingReminders.value = reminders
  vehicles.value = vehicleList
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text.item {
  text-align: center;
}
.text.item h3 {
  font-size: 32px;
  color: #409eff;
  margin: 10px 0;
}
.text.item span {
  color: #909399;
}
</style>
