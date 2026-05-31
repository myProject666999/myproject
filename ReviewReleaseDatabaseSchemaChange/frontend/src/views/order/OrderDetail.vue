<template>
  <div class="order-detail">
    <el-page-header @back="$router.back()" :content="orderDetail.title" />

    <el-card class="card-section" style="margin-top: 20px;">
      <template #header><span class="section-title">基本信息</span></template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单编号">{{ orderDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :class="'status-tag ' + orderDetail.status" size="small">{{ getStatusText(orderDetail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请人">{{ orderDetail.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :class="'risk-tag ' + orderDetail.riskLevel" size="small">{{ getRiskText(orderDetail.riskLevel) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标数据库">{{ orderDetail.dbName }}</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ getPriorityText(orderDetail.priority) }}</el-descriptions-item>
        <el-descriptions-item label="变更类型">{{ getChangeTypeText(orderDetail.changeType) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ orderDetail.createTime }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 15px;">
        <strong>变更描述：</strong>{{ orderDetail.description }}
      </div>
    </el-card>

    <el-card class="card-section">
      <template #header>
        <span class="section-title">风险检测报告</span>
        <el-tag type="danger" size="small" v-if="risks.length > 0">共 {{ risks.length }} 项风险</el-tag>
        <el-tag type="success" size="small" v-else>无风险</el-tag>
      </template>
      <el-table :data="risks" stripe size="small" v-if="risks.length > 0">
        <el-table-column prop="riskTitle" label="风险项" width="200" />
        <el-table-column prop="riskLevel" label="等级" width="100">
          <template #default="{ row }">
            <el-tag :class="'risk-tag ' + row.riskLevel" size="small">{{ getRiskText(row.riskLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="riskDetail" label="详情" show-overflow-tooltip />
        <el-table-column prop="suggestion" label="建议" show-overflow-tooltip />
        <el-table-column prop="tableName" label="涉及表" width="120" />
      </el-table>
      <el-empty description="暂无风险数据" v-else />
    </el-card>

    <el-card class="card-section">
      <template #header><span class="section-title">SQL内容</span></template>
      <el-table :data="sqlList" stripe size="small">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="sqlType" label="类型" width="100" />
        <el-table-column prop="tableName" label="表名" width="120" />
        <el-table-column prop="sqlContent" label="SQL内容" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input type="textarea" :model-value="row.sqlContent" readonly :rows="3" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :class="'status-tag ' + row.status" size="small">{{ getSqlStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="card-section">
      <template #header><span class="section-title">回滚预案</span></template>
      <el-input type="textarea" :model-value="orderDetail.rollbackSql" readonly :rows="4" placeholder="暂无回滚SQL" />
    </el-card>

    <el-card class="card-section">
      <template #header><span class="section-title">评审记录</span></template>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in reviewRecords"
          :key="index"
          :timestamp="item.reviewTime"
          placement="top"
        >
          <el-card>
            <h4>{{ item.reviewerName }} ({{ item.reviewerRole }})</h4>
            <el-tag :type="item.reviewStatus === 'approved' ? 'success' : item.reviewStatus === 'rejected' ? 'danger' : 'warning'">
              {{ getReviewStatusText(item.reviewStatus) }}
            </el-tag>
            <p style="margin-top: 10px;">{{ item.reviewComment || '无评审意见' }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <div class="action-bar">
      <el-button @click="$router.back()">返回</el-button>
      <el-button type="primary" @click="goReview" v-if="orderDetail.status === 'pending_review'">去评审</el-button>
      <el-button type="success" @click="goExecute" v-if="orderDetail.status === 'pending_execution'">执行变更</el-button>
      <el-button type="warning" @click="editOrder" v-if="orderDetail.status === 'draft' || orderDetail.status === 'need_modify'">编辑工单</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrderDetail, getOrderSqlList, getOrderRisks } from '@/api/order'
import { getReviewRecords } from '@/api/review'

const router = useRouter()
const route = useRoute()

const orderDetail = ref({})
const sqlList = ref([])
const risks = ref([])
const reviewRecords = ref([])

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

const getPriorityText = (p) => {
  const map = { low: '低', normal: '中', high: '高', urgent: '紧急' }
  return map[p] || p
}

const getChangeTypeText = (t) => {
  const map = { ddl: 'DDL-结构变更', dml: 'DML-数据变更', dcl: 'DCL-权限变更' }
  return map[t] || t
}

const getSqlStatusText = (s) => {
  const map = { pending: '待执行', executing: '执行中', success: '成功', failed: '失败', skipped: '已跳过' }
  return map[s] || s
}

const getReviewStatusText = (s) => {
  const map = { approved: '通过', rejected: '驳回', need_modify: '需修改' }
  return map[s] || s
}

const goReview = () => {
  router.push('/review/pending')
}

const goExecute = () => {
  router.push('/execution/list')
}

const editOrder = () => {
  router.push({ path: '/order/create', query: { id: orderDetail.value.id } })
}

const loadData = async () => {
  const id = route.params.id
  try {
    const [orderRes, sqlRes, riskRes, reviewRes] = await Promise.all([
      getOrderDetail(id),
      getOrderSqlList(id),
      getOrderRisks(id),
      getReviewRecords(id)
    ])
    orderDetail.value = orderRes.data
    sqlList.value = sqlRes.data || []
    risks.value = riskRes.data || []
    reviewRecords.value = reviewRes.data || []
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.order-detail {
  .card-section {
    margin-bottom: 20px;
  }
  
  .action-bar {
    text-align: right;
    button {
      margin-left: 10px;
    }
  }
}
</style>
