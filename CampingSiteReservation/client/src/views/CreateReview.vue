<template>
  <div class="page-container">
    <van-nav-bar title="发表评价" left-arrow @click-left="router.back()" />
    
    <van-cell-group inset>
      <van-cell :title="order.campsite_name" :value="order.checkin_date + ' 至 ' + order.checkout_date" />
    </van-cell-group>

    <div class="rating-section">
      <div class="rating-title">服务评分</div>
      <van-rate v-model="form.rating" :count="5" size="32" color="#ffd21e" void-icon="star" void-color="#eee" />
    </div>

    <van-cell-group inset>
      <van-field
        v-model="form.content"
        type="textarea"
        label="评价内容"
        placeholder="请输入您的评价..."
        rows="4"
        maxlength="500"
        show-word-limit
      />
    </van-cell-group>

    <van-submit-bar
      button-text="提交评价"
      :loading="submitting"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { createReview } from '@/api/reviews'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const order = ref({
  id: route.query.orderId || 1,
  campsite_name: route.query.campsiteName || '',
  checkin_date: route.query.checkin || '',
  checkout_date: route.query.checkout || ''
})

const form = reactive({
  rating: 5,
  content: ''
})

const submitting = ref(false)

const onSubmit = async () => {
  if (form.rating === 0) {
    showToast('请选择评分')
    return
  }
  if (!form.content.trim()) {
    showToast('请输入评价内容')
    return
  }
  if (!userStore.isLogin) {
    showToast('请先登录')
    router.push('/profile')
    return
  }

  try {
    submitting.value = true
    const response = await createReview({
      reservation_id: parseInt(order.value.id),
      rating: form.rating,
      content: form.content
    })
    
    if (response && response.success) {
      showToast('评价提交成功')
      router.replace('/reviews')
    }
  } catch (error) {
    console.error('提交评价失败:', error)
    if (error.response && error.response.status === 401) {
      showToast('请先登录')
      userStore.logout()
      router.push('/profile')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  userStore.restoreLogin()
})
</script>

<style scoped>
.rating-section {
  background: #fff;
  margin: 12px;
  padding: 16px;
  border-radius: 12px;
}

.rating-title {
  font-size: 14px;
  color: #323233;
  margin-bottom: 12px;
  font-weight: 500;
}
</style>
