<template>
  <div>
    <div class="page-header flex-between">
      <h2>工作记录</h2>
      <el-button type="primary" @click="addDialogVisible = true" v-if="isNanny">
        <el-icon><Plus /></el-icon>
        添加记录
      </el-button>
    </div>

    <el-card>
      <el-timeline>
        <el-timeline-item
          v-for="record in records"
          :key="record.id"
          :timestamp="formatDateTime(record.created_at)"
          placement="top"
        >
          <el-card>
            <div class="record-header">
              <h4>{{ formatDate(record.date) }} 工作记录</h4>
              <el-tag type="info">订单 #{{ record.order_id }}</el-tag>
            </div>

            <el-descriptions :column="1" border>
              <el-descriptions-item label="宝宝护理">{{ record.baby_care || '-' }}</el-descriptions-item>
              <el-descriptions-item label="产妇护理">{{ record.mother_care || '-' }}</el-descriptions-item>
              <el-descriptions-item label="家务">{{ record.housework || '-' }}</el-descriptions-item>
              <el-descriptions-item label="月子餐">{{ record.meals || '-' }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ record.notes || '-' }}</el-descriptions-item>
            </el-descriptions>

            <div class="customer-review" v-if="record.customer_review">
              <el-divider />
              <el-alert
                :title="'客户评价: ' + record.customer_review"
                type="success"
                :closable="false"
              />
            </div>

            <div class="record-actions" v-if="isCustomer && !record.customer_review">
              <el-button type="primary" link @click="openReviewDialog(record)">
                评价今日服务
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-if="records.length === 0" description="暂无工作记录" />
    </el-card>

    <el-dialog v-model="addDialogVisible" title="添加工作记录" width="600px">
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="选择订单">
          <el-select v-model="recordForm.order_id" placeholder="请选择订单" style="width: 100%">
            <el-option v-for="order in orders" :key="order.id" :label="order.order_no" :value="order.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="宝宝护理">
          <el-input v-model="recordForm.baby_care" type="textarea" :rows="2" placeholder="如：喂奶、换尿布、抚触等" />
        </el-form-item>
        <el-form-item label="产妇护理">
          <el-input v-model="recordForm.mother_care" type="textarea" :rows="2" placeholder="如：伤口护理、身体清洁等" />
        </el-form-item>
        <el-form-item label="家务">
          <el-input v-model="recordForm.housework" type="textarea" :rows="2" placeholder="如：打扫卫生、洗衣等" />
        </el-form-item>
        <el-form-item label="月子餐">
          <el-input v-model="recordForm.meals" type="textarea" :rows="2" placeholder="如：早餐、午餐、晚餐菜单" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recordForm.notes" type="textarea" :rows="2" placeholder="其他需要记录的内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecord">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reviewDialogVisible" title="评价服务" width="400px">
      <el-input
        v-model="reviewContent"
        type="textarea"
        :rows="3"
        placeholder="请输入您的评价"
      />
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDailyRecords, createDailyRecord, reviewDailyRecord, getMyOrders } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isNanny = computed(() => userStore.role === 'nanny')
const isCustomer = computed(() => userStore.role === 'customer')

const records = ref([])
const orders = ref([])
const addDialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const currentRecord = ref(null)
const reviewContent = ref('')

const recordForm = reactive({
  order_id: null,
  baby_care: '',
  mother_care: '',
  housework: '',
  meals: '',
  notes: ''
})

const loadData = async () => {
  try {
    const res = await getDailyRecords()
    records.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const loadOrders = async () => {
  try {
    const res = await getMyOrders()
    orders.value = res.data.filter(o => o.status === 'active')
  } catch (error) {
    console.error(error)
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const submitRecord = async () => {
  if (!recordForm.order_id) {
    ElMessage.warning('请选择订单')
    return
  }
  try {
    await createDailyRecord(recordForm)
    ElMessage.success('记录提交成功')
    addDialogVisible.value = false
    Object.assign(recordForm, {
      order_id: null,
      baby_care: '',
      mother_care: '',
      housework: '',
      meals: '',
      notes: ''
    })
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const openReviewDialog = (record) => {
  currentRecord.value = record
  reviewContent.value = ''
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  if (!reviewContent.value.trim()) {
    ElMessage.warning('请输入评价内容')
    return
  }
  try {
    await reviewDailyRecord(currentRecord.value.id, { review: reviewContent.value })
    ElMessage.success('评价成功')
    reviewDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadData()
  if (isNanny.value) {
    loadOrders()
  }
})
</script>

<style scoped>
.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.record-header h4 {
  margin: 0;
}

.customer-review {
  margin-top: 15px;
}

.record-actions {
  margin-top: 15px;
  text-align: right;
}
</style>
