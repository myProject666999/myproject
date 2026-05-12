<template>
  <div class="order-detail-page page-container">
    <van-nav-bar
      title="订单详情"
      left-arrow
      @click-left="$router.back()"
    />

    <div v-if="order" class="order-detail">
      <div class="status-section">
        <div class="status-icon">{{ getStatusIcon(order.status) }}</div>
        <div class="status-text">{{ getStatusText(order.status) }}</div>
        <div class="status-desc" v-if="order.status === 4 && order.rider">
          骑手 {{ order.rider.real_name || order.rider.username }} 正在配送中
        </div>
      </div>

      <van-steps :active="getStepActive(order.status)" direction="vertical" active-color="#1989fa">
        <van-step v-for="(track, index) in tracks" :key="index">
          <template #title>{{ track.content }}</template>
          <template #active-icon>
            <van-icon name="checked" />
          </template>
        </van-step>
      </van-steps>

      <van-cell-group inset title="配送信息">
        <van-cell title="取件地址" :value="order.pickup_address" />
        <van-cell title="收件地址" :value="order.delivery_address" />
        <van-cell title="取件人" :value="`${order.pickup_name} ${order.pickup_phone}`" />
        <van-cell title="收件人" :value="`${order.delivery_name} ${order.delivery_phone}`" />
        <van-cell title="配送距离" :value="`${order.distance?.toFixed(2)} km`" />
        <van-cell title="预计时间" :value="`${order.estimated_time} 分钟`" />
      </van-cell-group>

      <van-cell-group inset title="物品信息">
        <van-cell title="物品类型" :value="getItemTypeText(order.item_type)" />
        <van-cell title="物品名称" :value="order.item_name || '-' " />
        <van-cell title="物品重量" :value="`${order.item_weight} kg`" />
        <van-cell title="物品数量" :value="order.item_quantity.toString()" />
        <van-cell title="备注" :value="order.remark || '-'" />
      </van-cell-group>

      <van-cell-group inset title="费用明细">
        <van-cell title="基础费用" :value="`¥${order.base_price}`" />
        <van-cell title="距离费用" :value="`¥${order.distance_price}`" />
        <van-cell title="重量费用" :value="`¥${order.weight_price}`" />
        <van-cell title="时段附加费" :value="`¥${order.time_surcharge}`" />
        <van-cell title="总费用">
          <template #value>
            <span class="price-highlight" style="font-size: 20px">¥{{ order.total_price }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="订单信息">
        <van-cell title="订单号" :value="order.order_no" />
        <van-cell title="下单时间" :value="formatTime(order.created_at)" />
        <van-cell v-if="order.sign_code" title="签收码">
          <template #value>
            <span class="sign-code">{{ order.sign_code }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <div v-if="order.status === 6 && !order.rating" class="rate-section">
        <van-cell-group inset>
          <van-field
            v-model="ratingForm.rating"
            type="number"
            label="评分"
            placeholder="请输入1-5分"
          />
          <van-field
            v-model="ratingForm.comment"
            type="textarea"
            label="评价"
            placeholder="请输入评价内容"
            rows="3"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button round block type="primary" @click="submitRating" :loading="ratingLoading">
            提交评价
          </van-button>
        </div>
      </div>

      <div v-if="order.status < 1" class="action-section">
        <van-button round block type="danger" @click="showCancelDialog = true">
          取消订单
        </van-button>
      </div>

      <div v-if="order.status >= 1 && order.status < 6" class="action-section">
        <van-button round block type="warning" @click="goToException">
          申报异常
        </van-button>
      </div>
    </div>

    <van-dialog
      v-model:show="showCancelDialog"
      title="取消订单"
      show-cancel-button
      @confirm="cancelOrder"
    >
      <van-field
        v-model="cancelReason"
        type="textarea"
        rows="3"
        placeholder="请输入取消原因"
      />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getOrderDetail, getOrderTracks, cancelOrder, rateOrder } from '@/api/order'

const route = useRoute()
const router = useRouter()

const order = ref<any>(null)
const tracks = ref<any[]>([])
const showCancelDialog = ref(false)
const cancelReason = ref('')
const ratingForm = reactive({
  rating: 5,
  comment: ''
})
const ratingLoading = ref(false)

const statusTextMap: Record<number, string> = {
  0: '等待骑手接单',
  1: '骑手已接单',
  2: '骑手正在取件',
  3: '骑手已取件',
  4: '骑手正在配送',
  5: '等待签收',
  6: '订单已完成',
  7: '订单已取消',
  8: '订单异常'
}

const itemTypeMap: Record<number, string> = {
  1: '文件',
  2: '鲜花',
  3: '食品',
  4: '其他'
}

function getStatusIcon(status: number) {
  const iconMap: Record<number, string> = {
    0: '⏳',
    1: '✅',
    2: '🏃',
    3: '📦',
    4: '🚴',
    5: '📬',
    6: '🎉',
    7: '❌',
    8: '⚠️'
  }
  return iconMap[status] || '❓'
}

function getStatusText(status: number) {
  return statusTextMap[status] || '未知状态'
}

function getItemTypeText(type: number) {
  return itemTypeMap[type] || '其他'
}

function getStepActive(status: number) {
  return tracks.value.length > 0 ? tracks.value.length - 1 : 0
}

function formatTime(timeStr: string) {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

async function loadOrderDetail() {
  const id = route.params.id as string
  try {
    order.value = await getOrderDetail(parseInt(id))
    tracks.value = await getOrderTracks(parseInt(id))
  } catch (error) {
    console.error('加载订单详情失败', error)
  }
}

async function cancelOrder() {
  if (!cancelReason.value) {
    showToast('请输入取消原因')
    return
  }

  showLoadingToast({ message: '取消中...', forbidClick: true })
  try {
    await cancelOrder(order.value.id, cancelReason.value)
    showToast('取消成功')
    loadOrderDetail()
  } catch (error: any) {
    showToast(error.message || '取消失败')
  } finally {
    closeToast()
    showCancelDialog.value = false
  }
}

async function submitRating() {
  if (ratingForm.rating < 1 || ratingForm.rating > 5) {
    showToast('请输入1-5的评分')
    return
  }

  ratingLoading.value = true
  try {
    await rateOrder(order.value.id, ratingForm.rating, ratingForm.comment)
    showToast('评价成功')
    loadOrderDetail()
  } catch (error: any) {
    showToast(error.message || '评价失败')
  } finally {
    ratingLoading.value = false
  }
}

function goToException() {
  router.push(`/exception/create/${order.value.id}`)
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.status-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  text-align: center;
  color: #fff;
}

.status-icon {
  font-size: 50px;
  margin-bottom: 10px;
}

.status-text {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 5px;
}

.status-desc {
  font-size: 14px;
  opacity: 0.9;
}

.order-detail {
  padding-bottom: 80px;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: #fff;
}

.sign-code {
  font-size: 24px;
  font-weight: 600;
  color: #1989fa;
  letter-spacing: 5px;
}

.rate-section {
  padding-bottom: 80px;
}
</style>
