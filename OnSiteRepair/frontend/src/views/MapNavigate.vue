<template>
  <div class="page-container map-page">
    <van-nav-bar title="导航" left-text="返回" @click-left="onClickLeft" />
    
    <div id="map-container" class="map-container"></div>
    
    <div class="map-info">
      <van-cell-group inset>
        <van-cell title="目的地" :value="order?.address" />
        <van-cell title="联系人" :value="order?.contactName + ' - ' + order?.contactPhone" />
      </van-cell-group>
      
      <div class="action-buttons">
        <van-button type="primary" block @click="openAmap">打开高德地图导航</van-button>
        <van-button v-if="order?.status === 2" type="success" block @click="completeService">完成服务</van-button>
      </div>
    </div>

    <van-dialog v-model:show="showComplete" title="完成服务" show-cancel-button @confirm="submitComplete">
      <van-cell-group>
        <van-cell title="维修后照片">
          <van-uploader v-model="afterImages" multiple :max-count="9" />
        </van-cell>
        <van-cell title="服务录音">
          <van-uploader v-model="recordingFile" :max-count="1" accept="audio/*" />
        </van-cell>
      </van-cell-group>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { getOrderDetail, completeOrder } from '@/api/order'

const router = useRouter()
const route = useRoute()

const order = ref(null)
const showComplete = ref(false)
const afterImages = ref([])
const recordingFile = ref([])

const onClickLeft = () => {
  router.back()
}

const loadDetail = async () => {
  try {
    order.value = await getOrderDetail(route.params.orderId)
  } catch (e) {
    console.error(e)
  }
}

const openAmap = () => {
  if (order.value && order.value.latitude && order.value.longitude) {
    const url = `https://uri.amap.com/navigation?to=${order.value.longitude},${order.value.latitude},目的地&mode=car&policy=1&src=onsiterepair&coordinate=gaode&callnative=1`
    window.open(url)
  } else {
    showToast('未获取到目的地位置')
  }
}

const completeService = () => {
  showComplete.value = true
}

const submitComplete = async () => {
  try {
    const images = afterImages.value.map(img => img.content || img.url).join(',')
    const recording = recordingFile.value[0]?.content || recordingFile.value[0]?.url || ''
    
    await completeOrder(route.params.orderId, {
      afterImages: images,
      recordingUrl: recording
    })
    
    showSuccessToast('服务完成')
    router.replace('/orders')
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.map-container {
  flex: 1;
  min-height: 300px;
  background: #e5e3df;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #969799;
}

.map-info {
  background: #f7f8fa;
  padding-bottom: 20px;
}

.action-buttons {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
