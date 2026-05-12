
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
            <span style="font-weight: bold;">会员增长趋势</span>
          </template>
          <div style="height: 300px;">
            <el-empty description="请先选择日期范围查看数据" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span style="font-weight: bold;">会员等级分布</span>
          </template>
          <div style="height: 300px;">
            <el-empty description="请先选择日期范围查看数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <span style="font-weight: bold;">会员活跃度排行 TOP 10</span>
      </template>
      <el-table :data="activeMembers" stripe>
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="memberNo" label="会员编号" width="120" />
        <el-table-column prop="memberName" label="姓名" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="level" label="会员等级" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="consumptionCount" label="消费次数" width="100" />
        <el-table-column prop="totalAmount" label="消费总金额" width="120">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="lastConsumeTime" label="最近消费" width="170" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, UserFilled, Wallet, Clock } from '@element-plus/icons-vue'

const queryForm = reactive({
  dateRange: []
})

const summaryStats = ref([
  { label: '会员总数', value: '1,256', type: 'primary', icon: User },
  { label: '新增会员', value: '45', type: 'success', icon: UserFilled },
  { label: '活跃会员', value: '856', type: 'warning', icon: Wallet },
  { label: '沉睡会员', value: '156', type: 'danger', icon: Clock }
])

const activeMembers = ref([
  { rank: 1, memberNo: 'HY00003', memberName: '王五', phone: '137****9012', level: '钻石会员', consumptionCount: 68, totalAmount: 58600, lastConsumeTime: '2024-01-15 14:20:00' },
  { rank: 2, memberNo: 'HY00001', memberName: '张三', phone: '138****1234', level: '金卡会员', consumptionCount: 52, totalAmount: 32500, lastConsumeTime: '2024-01-15 10:30:00' },
  { rank: 3, memberNo: 'HY00002', memberName: '李四', phone: '139****5678', level: '银卡会员', consumptionCount: 35, totalAmount: 18200, lastConsumeTime: '2024-01-14 16:45:00' },
  { rank: 4, memberNo: 'HY00008', memberName: '钱七', phone: '135****7890', level: '金卡会员', consumptionCount: 30, totalAmount: 15800, lastConsumeTime: '2024-01-13 11:30:00' },
  { rank: 5, memberNo: 'HY00010', memberName: '周八', phone: '134****2345', level: '银卡会员', consumptionCount: 25, totalAmount: 12500, lastConsumeTime: '2024-01-12 15:00:00' }
])

const handleSearch = () => {
  console.log('查询会员报表')
}

const handleReset = () => {
  queryForm.dateRange = []
}

const handleExport = () => {
  console.log('导出会员报表')
}
</script>
