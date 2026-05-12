<template>
  <div class="page-container">
    <van-nav-bar title="待抢订单" left-text="返回" @click-left="onClickLeft" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多订单了"
        @load="onLoad"
      >
        <van-cell-group v-for="order in orders" :key="order.id" class="order-card">
          <van-cell
            :title="order.category + ' - ' + order.faultType"
            is-link
            @click="goDetail(order.id)"
          >
            <template #label>
              <div class="order-info">
                <van-icon name="location-o" />
                <span>{{ order.address }}</span>
              </div>
              <div class="order-info">
                <van-icon name="clock-o" />
                <span>{{ order.createTime }}</span>
              </div>
              <div class="order-desc">
                {{ order.faultDesc }}
              </div>
              <div v-if="order.images" class="order-images">
                <van-image
                  v-for="(img, idx) in order.images.split(',').slice(0, 4)"
                  :key="idx"
                  :src="img"
                  width="60"
                  height="60"
                  fit="cover"
                  radius="4"
                />
              </div>
            </template>
          </van-cell>
          
          <div class="order-actions">
            <van-button type="primary" block @click="grabOrder(order)">
              立即抢单
            </van-button>
          </div>
        </van-cell-group>

        <van-empty v-if="!loading && orders.length === 0" description="暂无待抢订单" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import { getWorkerOrders, grabOrder as grabOrderApi } from '@/api/order'

const router = useRouter()

const orders = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const onClickLeft = () => {
  router.back()
}

const goDetail = (id) => {
  router.push(`/order/${id}`)
}

const loadOrders = async () => {
  try {
    const data = await getWorkerOrders(0)
    orders.value = data || []
    finished.value = true
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  finished.value = false
  loadOrders().then(() => {
    refreshing.value = false
  })
}

const onLoad = () => {
  loadOrders()
}

const grabOrder = async (order) => {
  try {
    await showConfirmDialog({
      title: '确认抢单',
      message: '确定要抢该订单吗？'
    })
    await grabOrderApi(order.id)
    showSuccessToast('抢单成功')
    onRefresh()
  } catch (e) {
    if (e !== 'cancel') {
      showToast(e.message || '抢单失败')
    }
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-card {
  margin: 10px;
  border-radius: 8px;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #969799;
  margin-top: 5px;
}

.order-desc {
  font-size: 13px;
  color: #646566;
  margin-top: 8px;
  line-height: 1.5;
}

.order-images {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.order-actions {
  padding: 10px 15px;
}
</style>
