<template>
  <div class="home">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon blue"><el-icon size="32"><Document /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalOrders }}</div>
              <div class="stat-label">总工单数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon orange"><el-icon size="32"><Clock /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingReview }}</div>
              <div class="stat-label">待评审</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon green"><el-icon size="32"><CircleCheck /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.success }}</div>
              <div class="stat-label">执行成功</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon red"><el-icon size="32"><Warning /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.highRisk }}</div>
              <div class="stat-label">高风险工单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近工单</span>
            <el-button type="text" style="float: right" @click="$router.push('/order/list')">查看全部</el-button>
          </template>
          <el-table :data="recentOrders" stripe size="small">
            <el-table-column prop="orderNo" label="工单编号" width="160" />
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column prop="applicantName" label="申请人" width="90" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :class="'status-tag ' + row.status" size="small">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>待评审工单</span>
            <el-button type="text" style="float: right" @click="$router.push('/review/pending')">前往评审</el-button>
          </template>
          <el-table :data="pendingOrders" stripe size="small">
            <el-table-column prop="orderNo" label="工单编号" width="160" />
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column prop="applicantName" label="申请人" width="90" />
            <el-table-column prop="riskLevel" label="风险等级" width="90">
              <template #default="{ row }">
                <el-tag :class="'risk-tag ' + row.riskLevel" size="small">{{ getRiskText(row.riskLevel) }}</el-tag>
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
import { getOrderList } from '@/api/order'
import { getPendingReviewOrders } from '@/api/review'

const stats = ref({
  totalOrders: 0,
  pendingReview: 0,
  success: 0,
  highRisk: 0
})

const recentOrders = ref([])
const pendingOrders = ref([])

const getStatusText = (status) => {
  const map = {
    draft: '草稿',
    pending_review: '待评审',
    reviewing: '评审中',
    pending_execution: '待执行',
    executing: '执行中',
    success: '成功',
    failed: '失败',
    rollback: '已回滚',
    cancelled: '已取消',
    rejected: '已驳回',
    need_modify: '需修改'
  }
  return map[status] || status
}

const getRiskText = (level) => {
  const map = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '极高风险',
    unknown: '未知'
  }
  return map[level] || level
}

const loadData = async () => {
  try {
    const res = await getOrderList({ pageNum: 1, pageSize: 5 })
    recentOrders.value = res.data.records || []
    stats.value.totalOrders = res.data.total || 0
  } catch (e) {
    console.error(e)
  }

  try {
    const res = await getPendingReviewOrders()
    pendingOrders.value = res.data || []
    stats.value.pendingReview = pendingOrders.value.length
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home {
  .stat-cards {
    margin-bottom: 20px;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    
    &.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    &.orange { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
    &.green { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
    &.red { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
  }
  
  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
  }
  
  .content-row {
  }
}
</style>
