<template>
  <div class="page-container merchant-page">
    <van-nav-bar
      :title="restaurant?.name + ' - 叫号台'"
      left-arrow
      @click-left="handleBack"
      fixed
      placeholder
    />

    <div class="content-wrapper">
      <div v-if="loading" class="loading-center">
        <van-loading size="24px">加载中...</van-loading>
      </div>

      <div v-else>
        <van-tabs v-model:active="activePrefix" sticky offset-top="46px">
          <van-tab
            v-for="tt in tableTypes"
            :key="tt.queue_prefix"
            :title="tt.name + '(' + (queueCounts[tt.queue_prefix] || 0) + ')'"
            :name="tt.queue_prefix"
          ></van-tab>
        </van-tabs>

        <div class="calling-section card">
          <div class="current-calling">
            <p class="text-gray">当前叫号</p>
            <div class="queue-number-display" v-if="currentCalling">
              {{ currentCalling.queue_no }}
            </div>
            <div v-else class="empty-number">
              暂无叫号
            </div>
          </div>

          <van-button
            type="primary"
            size="large"
            block
            :disabled="calling || !activePrefix || (queueCounts[activePrefix] || 0) === 0"
            class="btn-primary"
            @click="callNext"
          >
            {{ calling ? '叫号中...' : '叫下一号' }}
          </van-button>
        </div>

        <div class="card" v-if="currentCalling">
          <h3 style="font-weight: 600; margin-bottom: 12px;">当前叫号详情</h3>
          <div class="detail-row">
            <span class="text-gray">排队号</span>
            <span style="font-weight: 600;">{{ currentCalling.queue_no }}</span>
          </div>
          <div class="detail-row">
            <span class="text-gray">用餐人数</span>
            <span>{{ currentCalling.people_count }} 人</span>
          </div>
          <div class="detail-row">
            <span class="text-gray">手机号</span>
            <span>{{ maskPhone(currentCalling.user_phone) }}</span>
          </div>
          <div class="detail-row">
            <span class="text-gray">叫号时间</span>
            <span>{{ formatTime(currentCalling.called_at) }}</span>
          </div>
          <div class="detail-row" v-if="currentCalling.is_reservation">
            <span class="text-gray">号源类型</span>
            <span class="text-primary">预约号</span>
          </div>

          <div style="margin-top: 16px; display: flex; gap: 8px;">
            <van-button
              size="small"
              type="success"
              block
              @click="markSeated(currentCalling.id)"
            >
              已入座
            </van-button>
            <van-button
              size="small"
              type="warning"
              block
              @click="markOver(currentCalling.id)"
            >
              过号
            </van-button>
          </div>
        </div>

        <div class="card">
          <h3 style="font-weight: 600; margin-bottom: 12px;">等待队列 ({{ waitingQueues.length }})</h3>
          <div v-if="waitingQueues.length === 0" class="text-gray text-center py-4">
            暂无等待
          </div>
          <div
            v-for="(queue, index) in waitingQueues"
            :key="queue.id"
            class="waiting-item"
          >
            <div class="waiting-no">{{ index + 1 }}</div>
            <div class="waiting-info">
              <div class="flex-between">
                <span style="font-weight: 600;">{{ queue.queue_no }}</span>
                <span v-if="queue.is_reservation" class="badge badge-waiting" style="font-size: 11px;">
                  预约
                </span>
              </div>
              <div class="text-gray" style="font-size: 12px; margin-top: 4px;">
                {{ queue.people_count }}人 · 取号于 {{ formatTime(queue.created_at) }}
              </div>
            </div>
            <div class="waiting-time">
              约{{ (index + 1) * getAvgServeTime() }}分钟
            </div>
          </div>
        </div>

        <div class="card">
          <h3 style="font-weight: 600; margin-bottom: 12px;">最近叫号</h3>
          <div v-if="calledQueues.length === 0" class="text-gray text-center py-4">
            暂无叫号记录
          </div>
          <div
            v-for="queue in calledQueues"
            :key="queue.id"
            class="called-item"
          >
            <span class="called-no">{{ queue.queue_no }}</span>
            <span
              class="badge"
              :class="{
                'badge-calling': queue.status === 1,
                'badge-seated': queue.status === 2,
                'badge-over': queue.status === 3
              }"
            >
              {{ getStatusText(queue.status) }}
            </span>
            <span class="text-gray" style="font-size: 12px;">
              {{ formatTime(queue.called_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantApi, queueApi } from '@/api'
import { useUserStore } from '@/stores/user'
import wsClient from '@/utils/websocket'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const restaurantId = ref(Number(route.params.restaurantId))
const loading = ref(true)
const calling = ref(false)
const restaurant = ref(null)
const tableTypes = ref([])
const activePrefix = ref('')
const queueCounts = ref({})
const waitingQueues = ref([])
const calledQueues = ref([])
const currentCalling = ref(null)

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  loadData()
  wsClient.connect()
  wsClient.on('queue_update', handleQueueUpdate)
})

onUnmounted(() => {
  wsClient.off('queue_update', handleQueueUpdate)
})

watch(activePrefix, () => {
  if (activePrefix.value) {
    loadQueueData()
  }
})

async function loadData() {
  try {
    loading.value = true
    const data = await restaurantApi.detail(restaurantId.value)
    restaurant.value = data.restaurant
    tableTypes.value = data.table_types

    if (data.table_types.length > 0) {
      activePrefix.value = data.table_types[0].queue_prefix
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadQueueData() {
  try {
    const counts = {}
    for (const tt of tableTypes.value) {
      const list = await queueApi.waitingList(restaurantId.value, tt.queue_prefix)
      counts[tt.queue_prefix] = list.length
    }
    queueCounts.value = counts

    waitingQueues.value = await queueApi.waitingList(restaurantId.value, activePrefix.value)

    const called = await queueApi.calledList(restaurantId.value, 10)
    calledQueues.value = called

    const callingNow = called.find(q => q.status === 1)
    currentCalling.value = callingNow || null
  } catch (e) {
    console.error(e)
  }
}

function handleQueueUpdate(data) {
  loadQueueData()

  if (data.action === 'call_queue') {
    showToast({
      message: `叫号：${data.queue.queue_no}`,
      type: 'success'
    })
  }
}

async function callNext() {
  if (!activePrefix.value) return

  try {
    calling.value = true
    const tableType = tableTypes.value.find(t => t.queue_prefix === activePrefix.value)
    const result = await queueApi.call({
      restaurant_id: restaurantId.value,
      table_type_id: tableType.id,
      queue_prefix: activePrefix.value
    })
    currentCalling.value = result
    loadQueueData()
  } catch (e) {
    console.error(e)
  } finally {
    calling.value = false
  }
}

async function markSeated(queueId) {
  try {
    await showConfirmDialog({
      title: '确认入座',
      message: '确认该顾客已入座？'
    })
    await queueApi.markSeated(queueId)
    showToast('已确认入座')
    loadQueueData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

async function markOver(queueId) {
  try {
    await showConfirmDialog({
      title: '确认过号',
      message: '确认标记为过号？过号后将延后3位'
    })
    await queueApi.markOver(queueId)
    showToast('已标记过号')
    loadQueueData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

function getAvgServeTime() {
  const tt = tableTypes.value.find(t => t.queue_prefix === activePrefix.value)
  return tt ? tt.avg_serve_time : 15
}

function getStatusText(status) {
  const map = {
    1: '叫号中',
    2: '已入座',
    3: '已过号',
    5: '已完成'
  }
  return map[status] || '未知'
}

function formatTime(time) {
  if (!time) return '-'
  return dayjs(time).format('HH:mm')
}

function maskPhone(phone) {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function handleBack() {
  userStore.logout()
  router.push('/login')
}
</script>

<style lang="less" scoped>
.merchant-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.calling-section {
  background: linear-gradient(135deg, #1989fa 0%, #007dff 100%);
  color: #fff;
  text-align: center;
  padding: 24px 16px;
}

.current-calling {
  margin-bottom: 20px;

  p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
  }
}

.queue-number-display {
  font-size: 64px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 10px 0;
}

.empty-number {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
  padding: 30px 0;
}

.btn-primary {
  background: #fff;
  color: #1989fa;
  border: none;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.waiting-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.waiting-no {
  width: 36px;
  height: 36px;
  background: #e8f3ff;
  color: #1989fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
}

.waiting-info {
  flex: 1;
}

.waiting-time {
  color: #ff976a;
  font-size: 12px;
}

.called-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.called-no {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
</style>
