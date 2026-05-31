<template>
  <div class="page-container">
    <van-nav-bar
      title="我的预约"
      left-arrow
      @click-left="$router.push('/')"
      fixed
      placeholder
    />

    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46px">
        <van-tab title="全部" :name="null"></van-tab>
        <van-tab title="待使用" :name="1"></van-tab>
        <van-tab title="已完成" :name="4"></van-tab>
        <van-tab title="已取消" :name="2"></van-tab>
      </van-tabs>

      <div v-if="loading" class="loading-center">
        <van-loading size="24px">加载中...</van-loading>
      </div>

      <div v-else-if="reservations.length === 0" class="empty-state">
        <van-icon name="calendar-o" size="48" />
        <p style="margin-top: 12px;">暂无预约记录</p>
        <van-button type="primary" size="small" style="margin-top: 16px;" @click="$router.push('/')">
          去预约
        </van-button>
      </div>

      <div v-else>
        <div
          v-for="reservation in reservations"
          :key="reservation.id"
          class="card"
        >
          <div class="flex-between">
            <div>
              <span style="font-weight: 600; font-size: 16px;">
                {{ getTableName(reservation.table_type_id) }}
              </span>
              <span
                class="badge"
                :class="{
                  'badge-waiting': reservation.status === 0 || reservation.status === 1,
                  'badge-seated': reservation.status === 4,
                  'badge-over': reservation.status === 2 || reservation.status === 3
                }"
                style="margin-left: 10px;"
              >
                {{ getStatusText(reservation.status) }}
              </span>
            </div>
            <span class="text-gray" style="font-size: 13px;">
              {{ reservation.reserve_no }}
            </span>
          </div>

          <div style="margin-top: 12px;">
            <p style="color: #666;">
              <van-icon name="calendar-o" />
              {{ reservation.reserve_date }} {{ formatTime(reservation.reserve_time) }}
            </p>
            <p style="color: #666; margin-top: 6px;">
              <van-icon name="friends-o" />
              {{ reservation.people_count }} 人
            </p>
            <p style="color: #666; margin-top: 6px;" v-if="reservation.status === 1">
              <van-icon name="info-o" class="text-warning" />
              核验码：<span class="text-warning" style="font-weight: 600;">
                {{ reservation.verify_code }}
              </span>
            </p>
          </div>

          <div style="margin-top: 12px; display: flex; gap: 8px;" v-if="reservation.status === 0 || reservation.status === 1">
            <van-button
              size="small"
              block
              @click="cancelReservation(reservation)"
              :disabled="cancelling === reservation.id"
            >
              {{ cancelling === reservation.id ? '取消中...' : '取消预约' }}
            </van-button>
            <van-button
              size="small"
              type="primary"
              block
              @click="goVerify(reservation)"
            >
              去核验
            </van-button>
          </div>

          <div class="text-gray" style="margin-top: 12px; font-size: 12px;">
            预约时间：{{ formatTime(reservation.created_at, true) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { reservationApi, restaurantApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { showConfirmDialog, showToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const reservations = ref([])
const cancelling = ref(null)
const activeTab = ref(null)
const tableTypesMap = ref({})

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  loadReservations()
})

watch(activeTab, () => {
  loadReservations()
})

async function loadReservations() {
  try {
    loading.value = true
    reservations.value = await reservationApi.userReservations(
      userStore.userInfo.id,
      activeTab.value
    )

    const restaurantIds = [...new Set(reservations.value.map(r => r.restaurant_id))]
    for (const rid of restaurantIds) {
      try {
        const data = await restaurantApi.detail(rid)
        data.table_types.forEach(tt => {
          tableTypesMap.value[tt.id] = tt.name
        })
      } catch (e) {}
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function getTableName(tableTypeId) {
  return tableTypesMap.value[tableTypeId] || '未知桌型'
}

function getStatusText(status) {
  const map = {
    0: '待确认',
    1: '已确认',
    2: '已取消',
    3: '已过期',
    4: '已完成'
  }
  return map[status] || '未知'
}

function formatTime(time, withDate = false) {
  if (withDate) {
    return dayjs(time).format('YYYY-MM-DD HH:mm')
  }
  if (typeof time === 'string' && time.includes(':')) {
    return time.substring(0, 5)
  }
  return dayjs(time).format('HH:mm')
}

async function cancelReservation(reservation) {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消预约吗？'
    })
    cancelling.value = reservation.id
    await reservationApi.cancel(reservation.id, userStore.userInfo.id)
    showToast('取消成功')
    loadReservations()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  } finally {
    cancelling.value = null
  }
}

function goVerify(reservation) {
  router.push({
    path: '/verify',
    query: {
      reservation_id: reservation.id,
      verify_code: reservation.verify_code
    }
  })
}
</script>
