<template>
  <div>
    <el-button type="text" @click="$router.back()">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <el-card v-if="order" class="mt-10">
      <div class="order-header">
        <h2>订单详情</h2>
        <el-tag :type="getStatusType(order.status)" size="large">{{ getStatusText(order.status) }}</el-tag>
      </div>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ order.order_no }}</el-descriptions-item>
        <el-descriptions-item label="服务类型">{{ order.service_type }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatDate(order.start_date) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatDate(order.end_date) }}</el-descriptions-item>
        <el-descriptions-item label="服务天数">{{ order.total_days }}天</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ order.price }}</el-descriptions-item>
        <el-descriptions-item label="服务地址">{{ order.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ order.notes || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <div class="contract-section">
        <h3>合同信息</h3>
        <el-empty v-if="!contract" description="暂无合同" />
        <div v-else>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="合同编号">{{ contract.contract_no }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="contract.status === 'signed' ? 'success' : 'warning'">
                {{ contract.status === 'signed' ? '已签署' : '待签署' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="客户签署">
              {{ contract.customer_signed ? '已签署' : '待签署' }}
              <span v-if="contract.customer_sign_at">
                ({{ formatDateTime(contract.customer_sign_at) }})
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="月嫂签署">
              {{ contract.nanny_signed ? '已签署' : '待签署' }}
              <span v-if="contract.nanny_sign_at">
                ({{ formatDateTime(contract.nanny_sign_at) }})
              </span>
            </el-descriptions-item>
          </el-descriptions>

          <el-collapse class="mt-20">
            <el-collapse-item title="合同内容" name="content">
              <div v-html="contract.content"></div>
            </el-collapse-item>
          </el-collapse>

          <div class="mt-20">
            <el-button type="primary" @click="handleSignContract" :disabled="contract.status === 'signed'">
              签署合同
            </el-button>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="actions">
        <el-button type="primary" @click="goToAttendance" v-if="order.status === 'active'">
          服务打卡
        </el-button>
        <el-button type="primary" @click="goToDailyRecords">
          工作记录
        </el-button>
        <el-button type="warning" @click="openReviewDialog" v-if="order.status === 'completed'">
          发表评价
        </el-button>
        <el-button type="danger" @click="openDisputeDialog">
          纠纷申诉
        </el-button>
      </div>
    </el-card>

    <el-dialog v-model="reviewVisible" title="发表评价" width="500px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate v-model="reviewForm.rating" :max="5" />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="reviewForm.content" type="textarea" :rows="4" placeholder="请输入您的评价" />
        </el-form-item>
        <el-form-item label="匿名评价">
          <el-switch v-model="reviewForm.is_anonymous" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="disputeVisible" title="纠纷申诉" width="500px">
      <el-form :model="disputeForm" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="disputeForm.type" placeholder="请选择">
            <el-option label="服务质量" value="service" />
            <el-option label="费用问题" value="price" />
            <el-option label="时间问题" value="time" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="disputeForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="disputeForm.description" type="textarea" :rows="4" placeholder="请详细描述问题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="disputeVisible = false">取消</el-button>
        <el-button type="danger" @click="submitDispute">提交申诉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderDetail, getContract, signContract as apiSignContract, createReview as apiCreateReview, createDispute as apiCreateDispute } from '@/api'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const contract = ref(null)
const reviewVisible = ref(false)
const disputeVisible = ref(false)

const reviewForm = reactive({
  rating: 5,
  content: '',
  is_anonymous: false
})

const disputeForm = reactive({
  type: '',
  title: '',
  description: ''
})

const loadData = async () => {
  try {
    const [orderRes, contractRes] = await Promise.all([
      getOrderDetail(route.params.id),
      getContract(route.params.id).catch(() => ({ data: null }))
    ])
    order.value = orderRes.data
    contract.value = contractRes.data
  } catch (error) {
    console.error(error)
  }
}

const getStatusType = (status) => {
  const map = { pending: 'warning', active: 'primary', completed: 'success', cancelled: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '待确认', active: '进行中', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const handleSignContract = async () => {
  try {
    await apiSignContract(contract.value.id)
    ElMessage.success('签署成功')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const goToAttendance = () => {
  router.push('/attendance')
}

const goToDailyRecords = () => {
  router.push('/daily-records')
}

const openReviewDialog = () => {
  reviewForm.rating = 5
  reviewForm.content = ''
  reviewVisible.value = true
}

const submitReview = async () => {
  try {
    await apiCreateReview({
      order_id: order.value.id,
      nanny_id: order.value.nanny_id,
      ...reviewForm
    })
    ElMessage.success('评价提交成功')
    reviewVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

const openDisputeDialog = () => {
  disputeForm.type = ''
  disputeForm.title = ''
  disputeForm.description = ''
  disputeVisible.value = true
}

const submitDispute = async () => {
  try {
    await apiCreateDispute({
      order_id: order.value.id,
      ...disputeForm
    })
    ElMessage.success('申诉提交成功')
    disputeVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

onMounted(loadData)
</script>

<style scoped>
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.actions {
  display: flex;
  gap: 10px;
}
</style>
