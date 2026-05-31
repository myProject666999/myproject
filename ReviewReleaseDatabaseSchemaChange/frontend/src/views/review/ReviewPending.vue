<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">待我评审</span>
    </div>

    <el-table :data="tableData" stripe v-loading="loading">
      <el-table-column prop="orderNo" label="工单编号" width="180" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="dbName" label="目标数据库" width="140" />
      <el-table-column prop="applicantName" label="申请人" width="100" />
      <el-table-column prop="riskLevel" label="风险等级" width="100">
        <template #default="{ row }">
          <el-tag :class="'risk-tag ' + row.riskLevel" size="small">{{ getRiskText(row.riskLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="viewDetail(row)">查看</el-button>
          <el-button type="text" size="small" @click="openReviewDialog(row)">评审</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="reviewDialogVisible" title="工单评审" width="600px">
      <div class="review-info">
        <p><strong>工单编号：</strong>{{ currentOrder.orderNo }}</p>
        <p><strong>工单标题：</strong>{{ currentOrder.title }}</p>
        <p><strong>风险等级：</strong>
          <el-tag :class="'risk-tag ' + currentOrder.riskLevel" size="small">{{ getRiskText(currentOrder.riskLevel) }}</el-tag>
        </p>
      </div>
      <el-form label-width="100px">
        <el-form-item label="评审结果">
          <el-radio-group v-model="reviewForm.reviewStatus">
            <el-radio value="approved">通过</el-radio>
            <el-radio value="need_modify">需修改</el-radio>
            <el-radio value="rejected">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="评审级别">
          <el-radio-group v-model="reviewForm.reviewLevel">
            <el-radio :value="1">一级评审</el-radio>
            <el-radio :value="2">二级评审</el-radio>
            <el-radio :value="3">三级评审</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="评审意见">
          <el-input v-model="reviewForm.reviewComment" type="textarea" :rows="4" placeholder="请输入评审意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPendingReviewOrders, submitReview as submitReviewApi } from '@/api/review'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const reviewDialogVisible = ref(false)
const currentOrder = ref({})
const reviewForm = reactive({
  orderId: null,
  reviewStatus: 'approved',
  reviewLevel: 1,
  reviewComment: ''
})

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
  loading.value = true
  try {
    const res = await getPendingReviewOrders()
    tableData.value = res.data || []
  } finally {
    loading.value = false
  }
}

const viewDetail = (row) => {
  router.push(`/order/detail/${row.id}`)
}

const openReviewDialog = (row) => {
  currentOrder.value = row
  reviewForm.orderId = row.id
  reviewForm.reviewStatus = 'approved'
  reviewForm.reviewLevel = 1
  reviewForm.reviewComment = ''
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  try {
    await submitReviewApi(reviewForm)
    ElMessage.success('评审成功')
    reviewDialogVisible.value = false
    loadData()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.review-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  p {
    margin: 8px 0;
  }
}
</style>
