<template>
  <div class="page-container">
    <van-nav-bar title="发表评价" left-text="返回" @click-left="onClickLeft" />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset title="服务评分">
        <van-rate v-model="form.rating" :count="5" color="#ffd21e" void-icon="star" void-color="#eee" size="32" />
      </van-cell-group>

      <van-cell-group inset title="评价内容">
        <van-field
          v-model="form.content"
          type="textarea"
          placeholder="请输入您的评价..."
          autosize
          rows="4"
        />
      </van-cell-group>

      <van-cell-group inset title="上传图片">
        <van-uploader v-model="form.images" multiple :max-count="9" />
      </van-cell-group>

      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          提交评价
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import request from '@/utils/request'
import { getOrderDetail } from '@/api/order'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const form = reactive({
  rating: 5,
  content: '',
  images: []
})

const onClickLeft = () => {
  router.back()
}

const onSubmit = async () => {
  if (!form.rating) {
    showToast('请选择评分')
    return
  }
  
  try {
    loading.value = true
    showLoadingToast({ message: '提交中...', duration: 0 })
    
    const order = await getOrderDetail(route.params.orderId)
    const images = form.images.map(img => img.content || img.url).join(',')
    
    await request.post('/review/create', {
      orderId: route.params.orderId,
      workerId: order.workerId,
      rating: form.rating,
      content: form.content,
      images
    })
    
    closeToast()
    showToast('评价成功')
    router.back()
  } catch (e) {
    closeToast()
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
