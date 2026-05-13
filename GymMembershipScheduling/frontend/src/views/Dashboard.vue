<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.todayMembers || 0 }}</div>
          <div class="stat-label">今日入场人数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.activeCards || 0 }}</div>
          <div class="stat-label">活跃会员卡</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.todayClasses || 0 }}</div>
          <div class="stat-label">今日课程数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.todaySales || 0 }}</div>
          <div class="stat-label">今日销售额</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>近期团体课</span>
            </div>
          </template>
          <el-table :data="upcomingClasses" style="width: 100%">
            <el-table-column prop="courseTypeName" label="课程名称"></el-table-column>
            <el-table-column prop="classDate" label="日期">
              <template #default="{ row }">
                {{ formatDate(row.classDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="时间"></el-table-column>
            <el-table-column prop="coachName" label="教练"></el-table-column>
            <el-table-column label="人数">
              <template #default="{ row }">
                {{ row.currentParticipants }}/{{ row.maxParticipants }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>续卡提醒</span>
              <el-button type="primary" size="small" link>查看全部</el-button>
            </div>
          </template>
          <el-table :data="reminders" style="width: 100%">
            <el-table-column prop="reminderType" label="提醒类型"></el-table-column>
            <el-table-column prop="reminderDate" label="日期"></el-table-column>
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'warning' : 'success'">
                  {{ row.status === 0 ? '未发送' : '已发送' }}
                </el-tag>
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
import { getSchedulePage } from '@/api/groupClass'
import { getReminders } from '@/api/reminder'

const stats = ref({})
const upcomingClasses = ref([])
const reminders = ref([])

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadData = async () => {
  try {
    const [scheduleRes, reminderRes] = await Promise.all([
      getSchedulePage({ pageNum: 1, pageSize: 5, status: 1 }),
      getReminders({ pageNum: 1, pageSize: 5, status: 0 })
    ])
    
    upcomingClasses.value = scheduleRes.data.records || []
    reminders.value = reminderRes.data.records || []
    
    stats.value = {
      todayMembers: 0,
      activeCards: 0,
      todayClasses: upcomingClasses.value.length,
      todaySales: 0
    }
  } catch (error) {
    console.error(error)
  }
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
</style>
