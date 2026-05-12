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
      </div>

      <van-steps :active="getStepActive(order.status)" direction="vertical" active-color="#07c160">
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
      </van-cell-group>

      <van-cell-group inset title="物品信息">
        <van-cell title="物品类型" :value="getItemTypeText(order.item_type)" />
        <van-cell title="物品名称" :value="order.item_name || '-'" />
        <van-cell title="物品重量" :value="`${order.item_weight} kg`" />
        <van-cell title="物品数量" :value="order.item_quantity.toString()" />
        <van-cell title="备注" :value="order.remark || '-'" />
      </van-cell-group>

      <van-cell-group inset title="费用信息">
        <van-cell title="订单金额" :value="`¥${order.total_price}`" />
        <van-cell title="我的收入">
          <template #value>
            <span class="price-highlight" style="font-size: 18px">+¥{{ order.rider_income }}</span>
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

      <div v-if="order.status === 1 || order.status === 2" class="action-section">
        <van-button round block type="primary" @click="pickupOrder" :loading="actionLoading">
          确认取件
        </van-button>
      </div>

      <div v-if="order.status === 3 || order.status === 4" class="action-section">
        <van-field
          v-model="signCodeForm.signCode"
          label="签收码"
          placeholder="请输入6位签收码"
          maxlength="6"
        />
        <van-button
          round
          block
          type="success"
          style="margin-top: 15px"
          @click="deliverOrder"
          :loading="actionLoading"
        >
          确认送达
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getOrderDetail, getOrderTracks, pickupOrder as pickupOrderApi, deliverOrder as deliverOrderApi } from '@/api/order'

const route = useRoute()

const order = ref<any>(null)
const tracks = ref<any[]>([])
const actionLoading = ref(false)

const signCodeForm = reactive({
  signCode: ''
})

const statusTextMap: Record<number, string> = {
  0: '等待接单',
  1: '已接单，前往取件',
  2: '取件中',
  3: '已取件，配送中',
  4: '配送中',
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
    1: '🏃',
    2: '📍',
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

async function pickupOrder() {
  actionLoading.value = true
  showLoadingToast({ message: '确认取件中...', forbidClick: true })

  try {
    await pickupOrderApi(order.value.id, '')
    showToast('取件成功')
    loadOrderDetail()
  } catch (error: any) {
    showToast(error.message || '取件失败')
  } finally {
    closeToast()
    actionLoading.value = false
  }
}

async function deliverOrder() {
  if (!signCodeForm.signCode || signCodeForm.signCode.length !== 6) {
    showToast('请输入6位签收码')
    return
  }

  actionLoading.value = true
  showLoadingToast({ message: '确认送达中...', forbidClick: true })

  try {
    await deliverOrderApi(order.value.id, signCodeForm.signCode, '')
    showToast('送达成功')
    loadOrderDetail()
  } catch (error: any) {
    showToast(error.message || '送达失败')
  } finally {
    closeToast()
    actionLoading.value = false
  }
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.status-section {
  background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
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
}

.order-detail {
  padding-bottom: 150px;
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
  color: #07c160;
  letter-spacing: 5px;
}
</style>
