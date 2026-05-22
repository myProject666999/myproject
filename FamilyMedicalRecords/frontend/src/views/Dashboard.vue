<template>
  <div class="page-container">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <el-icon :size="40" color="#409eff"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-label">家庭成员</div>
              <div class="stat-value">{{ memberCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <el-icon :size="40" color="#67c23a"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-label">就诊记录</div>
              <div class="stat-value">{{ visitCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <el-icon :size="40" color="#e6a23c"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-label">过敏史</div>
              <div class="stat-value">{{ allergyCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <el-icon :size="40" color="#f56c6c"><Bell /></el-icon>
            <div class="stat-info">
              <div class="stat-label">待复诊</div>
              <div class="stat-value">{{ reminderCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header" style="margin-bottom:0;">
              <span class="card-title">即将复诊</span>
              <el-button type="primary" link @click="$router.push('/reminders')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="upcomingReminders" stripe>
            <el-table-column prop="remindDate" label="复诊日期" width="120" />
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'warning' : 'success'" size="small">
                  {{ row.status === 0 ? '待提醒' : '已完成' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header" style="margin-bottom:0;">
              <span class="card-title">最近就诊</span>
              <el-button type="primary" link @click="$router.push('/members')">查看成员</el-button>
            </div>
          </template>
          <el-table :data="recentVisits" stripe>
            <el-table-column prop="visitDate" label="日期" width="120" />
            <el-table-column prop="hospital" label="医院" show-overflow-tooltip />
            <el-table-column prop="diagnosis" label="诊断" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { memberApi, visitApi, allergyApi, reminderApi } from '../api'

const memberCount = ref(0)
const visitCount = ref(0)
const allergyCount = ref(0)
const reminderCount = ref(0)
const upcomingReminders = ref([])
const recentVisits = ref([])

onMounted(async () => {
  try {
    const [members, visits, allergies] = await Promise.all([
      memberApi.list(),
      visitApi.list(),
      allergyApi.list()
    ])
    memberCount.value = members.data?.length || 0
    visitCount.value = visits.data?.length || 0
    allergyCount.value = allergies.data?.length || 0
    recentVisits.value = (visits.data || []).slice(0, 5)

    const today = new Date().toISOString().split('T')[0]
    const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    const reminders = await reminderApi.list({ from: today, to: in30 })
    upcomingReminders.value = reminders.data || []
    reminderCount.value = upcomingReminders.value.length
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.stat-row {
  margin-bottom: 0;
}
.stat-card {
  border-radius: 12px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 20px;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-label {
  font-size: 14px;
  color: #909399;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}
</style>
