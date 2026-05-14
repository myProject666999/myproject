<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statsCards" :key="item.title">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: item.bgColor }">
              <el-icon :size="30" :color="item.iconColor"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>今日入园人数</span>
            </div>
          </template>
          <div ref="chart1" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>门票销售统计</span>
            </div>
          </template>
          <div ref="chart2" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新订单</span>
              <el-button type="primary" text size="small">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" border>
            <el-table-column prop="orderNo" label="订单编号" width="160" />
            <el-table-column prop="customerName" label="客户姓名" width="100" />
            <el-table-column prop="ticketType" label="票种" />
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">¥{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.statusType">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="下单时间" width="160" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
            </div>
          </template>
          <div class="notice-list">
            <div v-for="(item, index) in notices" :key="index" class="notice-item">
              <el-icon><Bell /></el-icon>
              <span>{{ item }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chart1 = ref(null)
const chart2 = ref(null)

const statsCards = [
  { title: '今日入园人数', value: '156', icon: 'User', bgColor: '#409EFF', iconColor: '#fff' },
  { title: '今日销售额', value: '¥45,890', icon: 'Money', bgColor: '#67C23A', iconColor: '#fff' },
  { title: '雪具在租数', value: '89', icon: 'Goods', bgColor: '#E6A23C', iconColor: '#fff' },
  { title: '待处理事项', value: '12', icon: 'Warning', bgColor: '#F56C6C', iconColor: '#fff' }
]

const recentOrders = [
  { orderNo: 'ORD202405140001', customerName: '张三', ticketType: '周末全日票', amount: 388, status: '已支付', statusType: 'success', createTime: '2024-05-14 09:15:30' },
  { orderNo: 'ORD202405140002', customerName: '李四', ticketType: '平日全日票', amount: 288, status: '已入园', statusType: 'primary', createTime: '2024-05-14 09:30:25' },
  { orderNo: 'ORD202405140003', customerName: '王五', ticketType: '夜场票', amount: 98, status: '待支付', statusType: 'warning', createTime: '2024-05-14 10:05:12' },
  { orderNo: 'ORD202405140004', customerName: '赵六', ticketType: '周末半日票', amount: 158, status: '已支付', statusType: 'success', createTime: '2024-05-14 10:20:45' },
  { orderNo: 'ORD202405140005', customerName: '钱七', ticketType: '节日全日票', amount: 488, status: '已退款', statusType: 'info', createTime: '2024-05-14 10:45:18' }
]

const notices = [
  '雪道A区域今日开放时间调整为10:00',
  '新增教练预约功能，请及时更新教练排班',
  '系统将于今晚22:00进行维护升级',
  '请各部门及时完成本周数据报表',
  '下周将进行雪具盘点，请提前做好准备'
]

onMounted(() => {
  initCharts()
})

const initCharts = () => {
  const chartInstance1 = echarts.init(chart1.value)
  chartInstance1.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(64, 158, 255, 0.3)' },
      lineStyle: { color: '#409EFF' },
      itemStyle: { color: '#409EFF' },
      data: [12, 35, 28, 42, 38, 25, 18]
    }]
  })

  const chartInstance2 = echarts.init(chart2.value)
  chartInstance2.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: 1048, name: '平日全日票' },
        { value: 735, name: '周末全日票' },
        { value: 580, name: '夜场票' },
        { value: 484, name: '周末半日票' },
        { value: 300, name: '节日全日票' }
      ]
    }]
  })
}
</script>

<style scoped>
.dashboard-container {
  padding: 0;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
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
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.notice-list {
  max-height: 300px;
  overflow-y: auto;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
  font-size: 14px;
}

.notice-item:last-child {
  border-bottom: none;
}
</style>
