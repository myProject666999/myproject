<template>
  <div class="page-container">
    <div class="card mb-20">
      <div class="page-header">
        <div class="page-title">已读统计</div>
      </div>

      <el-form :inline="true" :model="filters">
        <el-form-item label="选择公告">
          <el-select
            v-model="filters.announcementId"
            placeholder="请选择公告"
            style="width: 400px"
            filterable
            @change="loadStatistics"
          >
            <el-option
              v-for="item in announcementList"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="statistics" class="card">
      <el-row :gutter="20" class="mb-20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon blue">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">总人数</div>
              <div class="stat-value">{{ statistics.totalCount }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon green">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">已读人数</div>
              <div class="stat-value">{{ statistics.readCount }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon orange">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">未读人数</div>
              <div class="stat-value">{{ statistics.totalCount - statistics.readCount }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon purple">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">已读率</div>
              <div class="stat-value">{{ statistics.readRate }}%</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="section-title mb-10">
            <el-icon><PieChart /></el-icon>
            阅读情况
          </div>
          <div ref="chart1" style="height: 300px;"></div>
        </el-col>
        <el-col :span="12">
          <div class="section-title mb-10">
            <el-icon><Histogram /></el-icon>
            各部门已读情况
          </div>
          <div ref="chart2" style="height: 300px;"></div>
        </el-col>
      </el-row>

      <el-tabs v-model="activeTab" class="mt-30">
        <el-tab-pane label="已读人员" name="read">
          <el-table :data="statistics.readList" border stripe>
            <el-table-column prop="userName" label="姓名" width="120" />
            <el-table-column prop="departmentId" label="部门ID" width="100" />
            <el-table-column prop="readTime" label="阅读时间" width="200">
              <template #default="{ row }">
                {{ formatDate(row.readTime) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="未读人员" name="unread">
          <el-table :data="statistics.unreadList" border stripe>
            <el-table-column prop="realName" label="姓名" width="120" />
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="departmentId" label="部门ID" width="100" />
            <el-table-column prop="phone" label="手机号" width="150" />
            <el-table-column prop="email" label="邮箱" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-empty v-else description="请选择一个公告查看统计数据" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getReadStatistics, getAnnouncements } from '@/api'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const route = useRoute()

const filters = reactive({
  announcementId: route.query.announcementId || null
})

const announcementList = ref([])
const statistics = ref(null)
const activeTab = ref('read')
const chart1 = ref()
const chart2 = ref()
let chartInstance1 = null
let chartInstance2 = null

onMounted(async () => {
  await loadAnnouncements()
  if (filters.announcementId) {
    await loadStatistics()
  }
})

async function loadAnnouncements() {
  try {
    const res = await getAnnouncements({ pageNum: 1, pageSize: 100 })
    announcementList.value = res.data.list || []
  } catch (e) {}
}

async function loadStatistics() {
  if (!filters.announcementId) return
  try {
    const res = await getReadStatistics(filters.announcementId)
    statistics.value = res.data
    await nextTick()
    renderCharts()
  } catch (e) {}
}

function renderCharts() {
  if (!statistics.value) return

  if (chartInstance1) chartInstance1.dispose()
  if (chartInstance2) chartInstance2.dispose()

  chartInstance1 = echarts.init(chart1.value)
  chartInstance1.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: statistics.value.readCount, name: '已读', itemStyle: { color: '#67c23a' } },
        { value: statistics.value.totalCount - statistics.value.readCount, name: '未读', itemStyle: { color: '#f56c6c' } }
      ]
    }]
  })

  chartInstance2 = echarts.init(chart2.value)
  chartInstance2.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: (statistics.value.deptStatistics || []).map((d, i) => `部门${d.departmentId}`),
      axisTick: { alignWithLabel: true }
    },
    yAxis: { type: 'value', max: 100 },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: (statistics.value.deptStatistics || []).map(d => d.rate),
      itemStyle: {
        color: function(params) {
          const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9b59b6', '#1abc9c']
          return colors[params.dataIndex % colors.length]
        }
      },
      label: { show: true, position: 'top', formatter: '{c}%' }
    }]
  })
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

watch(() => filters.announcementId, () => {
  statistics.value = null
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 30px;
  color: #fff;
}

.stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-icon.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.purple { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  gap: 6px;
}

.mt-30 {
  margin-top: 30px;
}
</style>
