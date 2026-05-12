
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="统计日期">
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px;"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Download" @click="handleExport">导出报表</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6" v-for="stat in summaryStats" :key="stat.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-info">
            <div class="stat-title">{{ stat.label }}</div>
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

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span style="font-weight: bold;">每日营业额趋势</span>
          </template>
          <div style="height: 300px;">
            <el-empty description="请先选择日期范围查看数据" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span style="font-weight: bold;">服务项目占比</span>
          </template>
          <div style="height: 300px;">
            <el-empty description="请先选择日期范围查看数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <span style="font-weight: bold;">详细数据</span>
      </template>
      <el-table :data="tableData" stripe>
        <el-table-column prop="statDate" label="日期" width="120" />
        <el-table-column prop="orderCount" label="订单数" width="100" />
        <el-table-column prop="memberCount" label="会员消费数" width="120" />
        <el-table-column prop="totalAmount" label="总营业额" width="120">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="memberAmount" label="会员消费额" width="120">
          <template #default="{ row }">¥{{ row.memberAmount }}</template>
        </el-table-column>
        <el-table-column prop="cashAmount" label="现金收入" width="120">
          <template #default="{ row }">¥{{ row.cashAmount }}</template>
        </el-table-column>
        <el-table-column prop="cardAmount" label="会员卡收入" width="120">
          <template #default="{ row }">¥{{ row.cardAmount }}</template>
        </el-table-column>
        <el-table-column prop="rechargeAmount" label="充值金额" width="120">
          <template #default="{ row }">¥{{ row.rechargeAmount }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Money, Tickets, Wallet, TrendCharts } from '@element-plus/icons-vue'

const queryForm = reactive({
  dateRange: []
})

const summaryStats = ref([
  { label: '总营业额', value: '¥125,800', type: 'primary', icon: Money },
  { label: '总订单数', value: '456', type: 'success', icon: Tickets },
  { label: '会员充值', value: '¥28,500', type: 'warning', icon: Wallet },
  { label: '平均客单价', value: '¥275', type: 'danger', icon: TrendCharts }
])

const tableData = ref([
  { statDate: '2024-01-15', orderCount: 45, memberCount: 32, totalAmount: 12580, memberAmount: 9800, cashAmount: 2780, cardAmount: 0, rechargeAmount: 5000 },
  { statDate: '2024-01-14', orderCount: 38, memberCount: 28, totalAmount: 10200, memberAmount: 7800, cashAmount: 2400, cardAmount: 0, rechargeAmount: 3000 },
  { statDate: '2024-01-13', orderCount: 42, memberCount: 30, totalAmount: 11500, memberAmount: 8500, cashAmount: 3000, cardAmount: 0, rechargeAmount: 1000 },
  { statDate: '2024-01-12', orderCount: 35, memberCount: 25, totalAmount: 9800, memberAmount: 7200, cashAmount: 2600, cardAmount: 0, rechargeAmount: 0 },
  { statDate: '2024-01-11', orderCount: 40, memberCount: 30, totalAmount: 10800, memberAmount: 8000, cashAmount: 2800, cardAmount: 0, rechargeAmount: 2000 }
])

const handleSearch = () => {
  console.log('查询报表')
}

const handleReset = () => {
  queryForm.dateRange = []
}

const handleExport = () => {
  console.log('导出报表')
}
</script>
