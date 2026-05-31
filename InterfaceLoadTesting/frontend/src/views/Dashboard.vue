<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon blue">
              <el-icon><List /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalTasks }}</div>
              <div class="stat-label">压测任务总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon green">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.runningTasks }}</div>
              <div class="stat-label">运行中任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon orange">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalReports }}</div>
              <div class="stat-label">压测报告总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon red">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingAlarms }}</div>
              <div class="stat-label">待处理告警</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近任务</span>
          </template>
          <el-table :data="recentTasks" size="small">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="任务名称" show-overflow-tooltip />
            <el-table-column prop="concurrency" label="并发数" width="100" />
            <el-table-column prop="duration" label="时长(s)" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近报告</span>
          </template>
          <el-table :data="recentReports" size="small">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="报告名称" show-overflow-tooltip />
            <el-table-column prop="avg_qps" label="平均QPS" width="120">
              <template #default="{ row }">{{ row.avg_qps?.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="p95_rt" label="P95(ms)" width="100" />
            <el-table-column prop="error_rate" label="错误率" width="100">
              <template #default="{ row }">{{ row.error_rate }}%</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { taskApi, reportApi, alarmApi } from '@/api'

const stats = ref({
  totalTasks: 0,
  runningTasks: 0,
  totalReports: 0,
  pendingAlarms: 0
})

const recentTasks = ref([])
const recentReports = ref([])

const getStatusType = (status) => {
  const types = ['', 'success', 'info', 'warning', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待执行', '执行中', '已完成', '已中止', '失败']
  return texts[status] || '未知'
}

const loadData = async () => {
  try {
    const [tasksRes, reportsRes, alarmsRes] = await Promise.all([
      taskApi.list({ page: 1, page_size: 100 }),
      reportApi.list({ page: 1, page_size: 100 }),
      alarmApi.list({ page: 1, page_size: 100, status: 0 })
    ])

    stats.value.totalTasks = tasksRes.total || 0
    stats.value.runningTasks = (tasksRes.list || []).filter(t => t.status === 1).length
    stats.value.totalReports = reportsRes.total || 0
    stats.value.pendingAlarms = alarmsRes.total || 0

    recentTasks.value = (tasksRes.list || []).slice(0, 5)
    recentReports.value = (reportsRes.list || []).slice(0, 5)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.red {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}
</style>
