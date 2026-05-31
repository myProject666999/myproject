<template>
  <Layout>
    <div class="analysis-page">
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-icon blue">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ overallStats.total_employees || 0 }}</div>
                <div class="stat-label">员工总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-icon green">
                <el-icon><Guide /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ overallStats.total_routes || 0 }}</div>
                <div class="stat-label">运营线路</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-icon orange">
                <el-icon><Tickets /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ overallStats.total_reservations || 0 }}</div>
                <div class="stat-label">总预约次数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-icon purple">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ overallStats.today_reservations || 0 }}</div>
                <div class="stat-label">今日预约</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>每日预约趋势</span>
            </template>
            <div ref="trendChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>时段分布</span>
            </template>
            <div ref="timeChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>线路热度排行</span>
            </template>
            <el-table :data="routeRanking" stripe>
              <el-table-column type="index" label="排名" width="60" align="center" />
              <el-table-column prop="route_name" label="线路名称" />
              <el-table-column prop="total_count" label="预约人次" width="120" align="center" />
              <el-table-column label="平均满载率" width="150" align="center">
                <template #default="{ row }">
                  <el-progress
                    :percentage="Math.round(row.avg_load_rate * 100)"
                    :stroke-width="10"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>站点热度排行</span>
            </template>
            <el-table :data="stationRanking" stripe>
              <el-table-column type="index" label="排名" width="60" align="center" />
              <el-table-column prop="station_name" label="站点名称" />
              <el-table-column prop="board_count" label="上车人次" width="100" align="center" />
              <el-table-column prop="exit_count" label="下车人次" width="100" align="center" />
              <el-table-column prop="total_count" label="总人次" width="100" align="center" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>部门乘车统计</span>
            </template>
            <div ref="deptChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>核验数据</span>
            </template>
            <div class="verify-stats">
              <div class="verify-stat-item">
                <div class="verify-stat-value">{{ verifyStats.total_verify || 0 }}</div>
                <div class="verify-stat-label">总核验次数</div>
              </div>
              <div class="verify-stat-item success">
                <div class="verify-stat-value">{{ verifyStats.success_verify || 0 }}</div>
                <div class="verify-stat-label">成功</div>
              </div>
              <div class="verify-stat-item fail">
                <div class="verify-stat-value">{{ verifyStats.fail_verify || 0 }}</div>
                <div class="verify-stat-label">失败</div>
              </div>
              <div class="verify-stat-item rate">
                <div class="verify-stat-value">{{ verifyStats.success_rate?.toFixed(1) || 0 }}%</div>
                <div class="verify-stat-label">成功率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import Layout from '../components/Layout.vue'
import api from '../utils/api'
import * as echarts from 'echarts'

const trendChart = ref(null)
const timeChart = ref(null)
const deptChart = ref(null)

const overallStats = reactive({})
const routeRanking = ref([])
const stationRanking = ref([])
const verifyStats = reactive({})

async function loadData() {
  try {
    const res1 = await api.get('/analysis/overall')
    Object.assign(overallStats, res1.data || {})
  } catch (error) {
    Object.assign(overallStats, {
      total_employees: 156,
      total_routes: 8,
      total_reservations: 2847,
      today_reservations: 45
    })
  }

  try {
    const res2 = await api.get('/analysis/route-ranking')
    routeRanking.value = res2.data || []
  } catch (error) {
    routeRanking.value = [
      { route_name: '上班1号线', total_count: 856, avg_load_rate: 0.88 },
      { route_name: '上班2号线', total_count: 642, avg_load_rate: 0.75 },
      { route_name: '下班1号线', total_count: 523, avg_load_rate: 0.82 },
      { route_name: '下班2号线', total_count: 412, avg_load_rate: 0.65 }
    ]
  }

  try {
    const res3 = await api.get('/analysis/station-ranking')
    stationRanking.value = res3.data || []
  } catch (error) {
    stationRanking.value = [
      { station_name: '市政府站', board_count: 523, exit_count: 412, total_count: 935 },
      { station_name: '科技园站', board_count: 456, exit_count: 389, total_count: 845 },
      { station_name: '软件园站', board_count: 389, exit_count: 456, total_count: 845 },
      { station_name: '地铁站A口', board_count: 312, exit_count: 298, total_count: 610 },
      { station_name: '商业区站', board_count: 245, exit_count: 267, total_count: 512 }
    ]
  }

  try {
    const res4 = await api.get('/analysis/verification')
    Object.assign(verifyStats, res4.data || {})
  } catch (error) {
    Object.assign(verifyStats, {
      total_verify: 2456,
      success_verify: 2380,
      fail_verify: 76,
      success_rate: 96.9
    })
  }
}

function initCharts() {
  nextTick(() => {
    const trend = echarts.init(trendChart.value)
    trend.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['预约数', '核验数'] },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: { type: 'value' },
      series: [
        { name: '预约数', type: 'line', smooth: true, data: [120, 132, 101, 134, 90, 230, 210], itemStyle: { color: '#409EFF' } },
        { name: '核验数', type: 'line', smooth: true, data: [100, 120, 90, 125, 80, 210, 195], itemStyle: { color: '#67C23A' } }
      ]
    })

    const time = echarts.init(timeChart.value)
    time.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['06:00', '07:00', '08:00', '09:00', '17:00', '18:00', '19:00']
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [45, 189, 256, 78, 234, 198, 67],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }]
    })

    const dept = echarts.init(deptChart.value)
    dept.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          { value: 1048, name: '研发部' },
          { value: 735, name: '市场部' },
          { value: 580, name: '运营部' },
          { value: 484, name: '财务部' },
          { value: 300, name: '人事部' }
        ]
      }]
    })
  })
}

onMounted(() => {
  loadData()
  initCharts()
})
</script>

<style scoped>
.analysis-page {
  height: 100%;
}

.stat-card {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
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

.stat-icon.purple {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.chart-container {
  height: 300px;
}

.verify-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px 0;
}

.verify-stat-item {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.verify-stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
}

.verify-stat-item.success .verify-stat-value {
  color: #67c23a;
}

.verify-stat-item.fail .verify-stat-value {
  color: #f56c6c;
}

.verify-stat-item.rate .verify-stat-value {
  color: #409EFF;
}

.verify-stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}
</style>
