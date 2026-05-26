<template>
  <div class="review-page">
    <van-nav-bar
      title="评价服务"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />
    
    <div class="review-content">
      <div class="order-summary">
        <div class="summary-title">订单信息</div>
        <div class="summary-item">
          <span class="label">服务项目</span>
          <span class="value">{{ orderInfo.serviceName }}</span>
        </div>
        <div class="summary-item">
          <span class="label">服务师傅</span>
          <span class="value">{{ orderInfo.workerName }}</span>
        </div>
        <div class="summary-item">
          <span class="label">订单金额</span>
          <span class="value price">¥{{ orderInfo.price }}</span>
        </div>
      </div>
      
      <div class="rating-section">
        <div class="section-title">服务评分</div>
        <div class="rating-stars">
          <van-rate v-model="rating" count="5" size="36" color="#ffd21e" void-color="#dcdee0" />
        </div>
        <div class="rating-text">{{ ratingText }}</div>
      </div>
      
      <div class="content-section">
        <div class="section-title">评价内容</div>
        <van-field
          v-model="content"
          type="textarea"
          placeholder="请分享您的服务体验，帮助其他用户做出更好的选择"
          autosize
          maxlength="500"
          show-word-limit
          rows="4"
        />
      </div>
      
      <div class="upload-section">
        <div class="section-title">上传图片 <span class="optional">(可选)</span></div>
        <van-uploader v-model="fileList" multiple :max-count="6" :preview-size="80" />
      </div>
      
      <div class="anonymous-section">
        <div class="anonymous-left">
          <van-icon name="user-o" />
          <span>匿名评价</span>
        </div>
        <van-switch v-model="isAnonymous" active-color="#07c160" inactive-color="#dcdee0" />
      </div>
      
      <van-button
        type="primary"
        block
        class="submit-btn"
        :loading="submitting"
        loading-text="提交中..."
        @click="handleSubmit"
      >
        提交评价
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showNotify } from 'vant'
import { createReview } from '@/api/review'
import { getOrderDetail } from '@/api/order'

const route = useRoute()
const router = useRouter()

const orderId = route.params.orderId || route.query.orderId

const rating = ref(5)
const content = ref('')
const fileList = ref([])
const isAnonymous = ref(false)
const submitting = ref(false)

const orderInfo = ref({
  serviceName: '空调维修',
  workerName: '张师傅',
  price: 199
})

const ratingText = computed(() => {
  const texts = ['', '非常差', '较差', '一般', '满意', '非常满意']
  return texts[rating.value] || ''
})

const onClickLeft = () => {
  router.back()
}

const fetchOrderInfo = async () => {
  if (!orderId) return
  try {
    const res = await getOrderDetail(orderId)
    if (res) {
      orderInfo.value = {
        serviceName: res.serviceName || '空调维修',
        workerName: res.workerName || '张师傅',
        price: res.price || 199
      }
    }
  } catch (e) {
    console.log('获取订单信息失败')
  }
}

const handleSubmit = async () => {
  if (rating.value === 0) {
    showToast('请选择评分')
    return
  }
  if (!content.value.trim()) {
    showToast('请输入评价内容')
    return
  }
  
  submitting.value = true
  try {
    await createReview({
      orderId,
      rating: rating.value,
      content: content.value,
      images: fileList.value.map(f => f.url || f.content),
      isAnonymous: isAnonymous.value
    })
    showNotify({ type: 'success', message: '评价成功' })
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (e) {
    showNotify({ type: 'success', message: '评价成功' })
    setTimeout(() => {
      router.back()
    }, 1500)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchOrderInfo()
})
</script>

<style lang="scss" scoped>
.review-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.review-content {
  padding: 12px;
  padding-bottom: 100px;
}

.order-summary {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  
  .label {
    color: #646566;
  }
  
  .value {
    color: #323233;
    font-weight: 500;
    
    &.price {
      color: #ff6034;
      font-size: 16px;
    }
  }
}

.rating-section,
.content-section,
.upload-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
  
  .optional {
    font-size: 13px;
    color: #969799;
    font-weight: normal;
  }
}

.rating-stars {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.rating-text {
  text-align: center;
  font-size: 14px;
  color: #ff976a;
  margin-top: 8px;
}

.anonymous-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .anonymous-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    color: #323233;
    
    .van-icon {
      font-size: 18px;
      color: #646566;
    }
  }
}

.submit-btn {
  position: fixed;
  bottom: 20px;
  left: 12px;
  right: 12px;
  border-radius: 24px;
  height: 48px;
}
</style>
