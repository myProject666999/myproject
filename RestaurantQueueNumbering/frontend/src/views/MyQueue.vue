<template>
  <div class="page-container">
    <van-nav-bar
      title="我的排队"
      left-arrow
      @click-left="$router.push('/')"
      fixed
      placeholder
    />

    <div class="content-wrapper">
      <div v-if="loading" class="loading-center">
        <van-loading size="24px">加载中...</van-loading>
      </div>

      <div v-else-if="queues.length === 0" class="empty-state">
        <van-icon name="orders-o" size="48" />
        <p style="margin-top: 12px;">暂无排队记录</p>
        <van-button type="primary" size="small" style="margin-top: 16px;" @click="$router.push('/')">
          去取号
        </van-button>
      </div>

      <div v-else>
        <div
          v-for="queue in queues"
          :key="queue.id"
          class="card"
          @click="viewQueue(queue)"
        >
          <div class="flex-between">
            <div>
              <span class="queue-no">{{ queue.queue_no }}</span>
              <span
                class="badge"
                :class="{
                  'badge-waiting': queue.status === 0,
                  'badge-calling': queue.status === 1,
                  'badge-seated': queue.status === 2,
                  'badge-over': queue.status === 3
                }"
                style="margin-left: 10px;"
              >
                {{ getStatusText(queue.status) }}
              </span>
            </div>
            <span v-if="queue.is_reservation" class="badge badge-waiting">预约号</span>
          </div>

          <div v-if="queue.status === 0 || queue.status === 1" style="margin-top: 16px;">
            <div class="stat-row">
              <div class="stat-item">
                <div class="stat-value text-primary">{{ queue.position > 0 ? queue.position : '-' }}</div>
                <div class="stat-label">当前位次</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-warning">{{ queue.estimated_wait_time || '-' }}</div>
                <div class="stat-label">预估等待(分钟)</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ queue.people_count }}</div>
                <div class="stat-label">用餐人数</div>
              </div>
            </div>
          </div>

          <div v-if="queue.status === 1" style="margin-top: 16px;">
            <van-notice-bar mode="closeable" left-icon="volume-o" type="warning">
              请您尽快前往餐厅入座！
            </van-notice-bar>
          </div>

          <div style="margin-top: 16px; display: flex; gap: 8px;" v-if="queue.status === 0 || queue.status === 1">
            <van-button
              size="small"
              block
              @click.stop="cancelQueue(queue)"
              :disabled="cancelling === queue.id"
            >
              {{ cancelling === queue.id ? '取消中...' : '取消排队' }}
            </van-button>
          </div>

          <div class="text-gray" style="margin-top: 12px; font-size: 12px;">
            取号时间：{{ formatTime(queue.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { queueApi } from '@/api'
import { useUserStore } from '@/stores/user'
import wsClient from '@/utils/websocket'
import { showConfirmDialog, showToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const queues = ref([])
const cancelling = ref(null)

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  loadQueues()
  wsClient.connect()
  wsClient.on('queue_update', handleQueueUpdate)
  wsClient.on('call_notify', handleCallNotify)
})

onUnmounted(() => {
  wsClient.off('queue_update', handleQueueUpdate)
  wsClient.off('call_notify', handleCallNotify)
})

async function loadQueues() {
  try {
    loading.value = true
    queues.value = await queueApi.userQueues(userStore.userInfo.id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handleQueueUpdate(data) {
  loadQueues()
}

function handleCallNotify(data) {
  showToast({
    message: `您的号码 ${data.queue.queue_no} 已叫号，请尽快前往！`,
    duration: 5000,
    type: 'warning'
  })
  loadQueues()
}

function getStatusText(status) {
  const map = {
    0: '等待中',
    1: '叫号中',
    2: '已入座',
    3: '已过号',
    4: '已取消',
    5: '已完成'
  }
  return map[status] || '未知'
}

function formatTime(time) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

async function cancelQueue(queue) {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消排队吗？'
    })
    cancelling.value = queue.id
    await queueApi.cancel(queue.id, userStore.userInfo.id)
    showToast('取消成功')
    loadQueues()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  } finally {
    cancelling.value = null
  }
}

function viewQueue(queue) {
  if (queue.status === 0 || queue.status === 1) {
    loadQueues()
  }
}
</script>

<style lang="less" scoped>
.queue-no {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
}

.stat-row {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}
</style>
