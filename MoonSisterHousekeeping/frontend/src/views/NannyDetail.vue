<template>
  <div>
    <el-button type="text" @click="$router.back()">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <el-card v-if="nanny" class="mt-10">
      <div class="detail-header">
        <el-avatar :size="120">
          <img :src="nanny.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
        </el-avatar>
        <div>
          <h2>{{ nanny.name || `月嫂${nanny.id}` }}</h2>
          <div class="info-row">
            <el-tag type="success">{{ nanny.level }}</el-tag>
            <span>从业{{ nanny.experience }}年</span>
            <span>{{ nanny.age }}岁</span>
            <el-tag :type="nanny.status === 'available' ? 'success' : 'info'">
              {{ nanny.status === 'available' ? '可预约' : '服务中' }}
            </el-tag>
          </div>
          <div class="rating">
            <el-rate v-model="nanny.rating" disabled :max="5" :show-score="true" />
            <span class="order-count">服务订单: {{ nanny.order_count }}单</span>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="detail-section">
        <h3>个人简介</h3>
        <p>{{ nanny.description }}</p>
      </div>

      <div class="detail-section">
        <h3>专业技能</h3>
        <el-tag v-for="skill in nanny.skills" :key="skill.id" class="mr-10">
          {{ skill.name }}
        </el-tag>
      </div>

      <div class="detail-section" v-if="nanny.video_resume">
        <h3>视频简历</h3>
        <video :src="nanny.video_resume" controls style="max-width: 400px"></video>
      </div>

      <el-divider />

      <div class="detail-section">
        <h3>客户评价</h3>
        <el-empty v-if="reviews.length === 0" description="暂无评价" />
        <div v-else>
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <el-avatar :size="40">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div>
                <strong>{{ review.is_anonymous ? '匿名用户' : '客户' }}</strong>
                <el-rate v-model="review.rating" disabled :max="5" size="small" />
              </div>
            </div>
            <p class="review-content">{{ review.content }}</p>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="action-section">
        <el-button type="primary" size="large" @click="handleCreateOrder" :disabled="nanny.status !== 'available'">
          立即预约
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getNannyDetail, getReviews, createOrder as apiCreateOrder } from '@/api'

const route = useRoute()
const router = useRouter()
const nanny = ref(null)
const reviews = ref([])

const loadData = async () => {
  try {
    const [nannyRes, reviewsRes] = await Promise.all([
      getNannyDetail(route.params.id),
      getReviews({ nanny_id: route.params.id })
    ])
    nanny.value = nannyRes.data
    reviews.value = reviewsRes.data
  } catch (error) {
    console.error(error)
  }
}

const handleCreateOrder = async () => {
  try {
    await ElMessageBox.prompt('请输入服务开始日期 (YYYY-MM-DD)', '创建订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^\d{4}-\d{2}-\d{2}$/,
      inputErrorMessage: '请输入正确的日期格式'
    }).then(async ({ value: startDate }) => {
      const endDateRes = await ElMessageBox.prompt('请输入服务结束日期 (YYYY-MM-DD)', '创建订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d{4}-\d{2}-\d{2}$/,
        inputErrorMessage: '请输入正确的日期格式'
      })

      const priceRes = await ElMessageBox.prompt('请输入服务价格 (元)', '创建订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+(\.\d{1,2})?$/,
        inputErrorMessage: '请输入正确的金额'
      })

      await apiCreateOrder({
        nanny_id: nanny.value.id,
        service_type: '月嫂服务',
        start_date: startDate,
        end_date: endDateRes.value,
        price: parseFloat(priceRes.value)
      })

      ElMessage.success('订单创建成功')
      router.push('/orders')
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

onMounted(loadData)
</script>

<style scoped>
.detail-header {
  display: flex;
  gap: 30px;
  align-items: center;
}

.info-row {
  display: flex;
  gap: 15px;
  margin: 15px 0;
  align-items: center;
}

.order-count {
  margin-left: 20px;
  color: #909399;
}

.detail-section {
  margin: 20px 0;
}

.detail-section h3 {
  margin-bottom: 15px;
  color: #303133;
}

.mr-10 {
  margin-right: 10px;
  margin-bottom: 10px;
}

.review-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.review-header {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 10px;
}

.review-content {
  color: #606266;
  margin-left: 55px;
}

.action-section {
  text-align: center;
  padding: 20px;
}
</style>
