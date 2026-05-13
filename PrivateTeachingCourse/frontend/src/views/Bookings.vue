<template>
  <div class="page-container">
    <van-tabs v-model:active="activeStatus" sticky>
      <van-tab title="全部" name="">
        <BookingList />
      </van-tab>
      <van-tab title="待上课" name="confirmed">
        <BookingList status="confirmed" />
      </van-tab>
      <van-tab title="已上课" name="attended">
        <BookingList status="attended" />
      </van-tab>
      <van-tab title="已取消" name="cancelled">
        <BookingList status="cancelled" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { showConfirmDialog, showDialog, Toast } from 'vant'
import { bookingAPI, checkinAPI } from '@/api'

const BookingList = defineComponent({
  props: ['status'],
  setup(props) {
    const route = useRoute()
    const loading = ref(true)
    const bookings = ref([])

    const loadBookings = async () => {
      loading.value = true
      try {
        const params = props.status ? { status: props.status } : {}
        const res = await bookingAPI.getMyBookings(params)
        bookings.value = res.bookings
      } finally {
        loading.value = false
      }
    }

    const getStatusText = (status) => {
      const map = { confirmed: '待上课', waitlist: '候补中', attended: '已上课', cancelled: '已取消' }
      return map[status] || status
    }

    const getStatusClass = (status) => {
      const map = { confirmed: 'text-primary', waitlist: 'text-warning', attended: 'text-success', cancelled: 'text-muted' }
      return map[status] || ''
    }

    const handleCancel = async (booking) => {
      try {
        await showConfirmDialog({
          title: '确认取消',
          message: '确定要取消此预约吗？'
        })
        await bookingAPI.cancel(booking.id)
        Toast.success('已取消')
        loadBookings()
      } catch (e) {
        if (e !== 'cancel') console.error(e)
      }
    }

    const generateQR = async (booking) => {
      try {
        const res = await checkinAPI.generateQR(booking.id)
        route.router.push(`/checkin-qr/${booking.id}`)
      } catch (e) {
        console.error(e)
      }
    }

    watch(() => props.status, loadBookings)
    onMounted(loadBookings)

    return { loading, bookings, getStatusText, getStatusClass, handleCancel, generateQR }
  },
  template: `
    <van-loading v-if="loading" class="flex-center" style="padding: 20px" />
    <van-empty v-else-if="bookings.length === 0" description="暂无预约记录" />
    <div v-else>
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <div class="booking-header flex-between">
          <span :class="getStatusClass(booking.status)">{{ getStatusText(booking.status) }}</span>
          <span v-if="booking.status === 'waitlist'" class="text-warning">候补 #{{ booking.waitlistOrder }}</span>
        </div>
        <div class="course-name" @click="route.router.push('/courses')">{{ booking.Course?.name }}</div>
        <div class="booking-info">
          <van-icon name="calendar" /> {{ booking.Course?.date }} {{ booking.Course?.startTime }}-{{ booking.Course?.endTime }}
        </div>
        <div class="booking-info">
          <van-icon name="location-o" /> {{ booking.Course?.location || '待定' }}
        </div>
        <div class="booking-info">
          <van-icon name="user-o" /> {{ booking.Course?.Coach?.User?.name }}
        </div>
        <div class="booking-actions mt-12" v-if="booking.status === 'confirmed'">
          <van-button size="small" round plain type="danger" @click="handleCancel(booking)">取消预约</van-button>
          <van-button size="small" round type="primary" @click="generateQR(booking)">签到二维码</van-button>
        </div>
      </div>
    </div>
  `
})

export default {
  components: { BookingList },
  setup() {
    const activeStatus = ref('')
    return { activeStatus }
  }
}
</script>

<style scoped>
.booking-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}
.booking-header {
  margin-bottom: 8px;
  font-size: 13px;
}
.course-name {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
}
.booking-info {
  font-size: 13px;
  color: #646566;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.booking-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
