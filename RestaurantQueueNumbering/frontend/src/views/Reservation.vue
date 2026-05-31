<template>
  <div class="page-container">
    <van-nav-bar
      title="预约"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="content-wrapper">
      <div v-if="loading" class="loading-center">
        <van-loading size="24px">加载中...</van-loading>
      </div>

      <div v-else>
        <div class="card">
          <h2 style="font-size: 20px; font-weight: 600;">{{ restaurant?.name }}</h2>
          <p class="text-gray" style="margin-top: 8px;">
            <van-icon name="location-o" /> {{ restaurant?.address }}
          </p>
        </div>

        <div class="card">
          <h3 style="font-weight: 600; margin-bottom: 12px;">选择桌型</h3>
          <div
            v-for="table in tableTypes"
            :key="table.id"
            class="table-type-item"
            :class="{ active: selectedTable?.id === table.id }"
            @click="selectTable(table)"
          >
            <div class="flex-between">
              <span style="font-weight: 600;">{{ table.name }}</span>
              <span class="text-gray">{{ table.min_people }}-{{ table.max_people }}人</span>
            </div>
          </div>
        </div>

        <div class="card" v-if="selectedTable">
          <h3 style="font-weight: 600; margin-bottom: 12px;">选择日期</h3>
          <van-calendar
            v-model:show="showCalendar"
            :min-date="minDate"
            :max-date="maxDate"
            color="#1989fa"
            @confirm="onDateConfirm"
          />
          <div class="date-selector" @click="showCalendar = true">
            <span class="text-gray">预约日期</span>
            <div class="flex-between" style="margin-top: 8px;">
              <span style="font-size: 18px; font-weight: 600;">
                {{ selectedDate || '请选择日期' }}
              </span>
              <van-icon name="arrow" />
            </div>
          </div>
        </div>

        <div class="card" v-if="selectedDate && selectedTable">
          <h3 style="font-weight: 600; margin-bottom: 12px;">选择时段</h3>
          <div v-if="timeSlotsLoading" class="loading-center" style="height: 100px;">
            <van-loading size="20px">加载中...</van-loading>
          </div>
          <div v-else class="time-slots">
            <div
              v-for="slot in timeSlots"
              :key="slot.time"
              class="time-slot-item"
              :class="{
                active: selectedTime === slot.time,
                disabled: !slot.available || slot.is_past
              }"
              @click="slot.available && !slot.is_past && (selectedTime = slot.time)"
            >
              <span>{{ slot.time }}</span>
              <span v-if="slot.is_past" class="text-gray">已过期</span>
              <span v-else-if="!slot.available" class="text-gray">已约满</span>
              <span v-else class="text-success">可预约</span>
            </div>
          </div>
        </div>

        <div class="card" v-if="selectedTable">
          <h3 style="font-weight: 600; margin-bottom: 12px;">用餐人数</h3>
          <van-stepper
            v-model="peopleCount"
            :min="selectedTable.min_people"
            :max="selectedTable.max_people"
            input-width="40px"
            button-size="28px"
          />
        </div>

        <van-button
          type="primary"
          size="large"
          block
          :disabled="!canSubmit || submitting"
          class="btn-primary"
          style="margin-top: 20px;"
          @click="submitReservation"
        >
          {{ submitting ? '预约中...' : '立即预约' }}
        </van-button>
      </div>
    </div>

    <van-popup v-model:show="showSuccess" round position="bottom" :style="{ height: '55%' }">
      <div class="success-content">
        <van-icon name="checked" size="64" color="#07c160" />
        <h3 style="text-align: center; margin-top: 16px; color: #333;">预约成功！</h3>
        <div style="text-align: center; margin-top: 16px;">
          <p style="font-size: 24px; font-weight: bold; color: #1989fa;">
            {{ newReservation?.reserve_no }}
          </p>
          <p style="color: #666; margin-top: 12px;">
            {{ newReservation?.reserve_date }} {{ newReservation?.reserve_time }}
          </p>
          <p style="color: #666; margin-top: 8px;">
            核验码：<span class="text-warning" style="font-weight: 600;">
              {{ newReservation?.verify_code }}
            </span>
          </p>
          <p class="text-gray" style="margin-top: 12px; font-size: 13px;">
            请在预约时间前30分钟到店核验取号
          </p>
        </div>
        <div style="padding: 20px;">
          <van-button type="primary" block @click="goToMyReservation">
            查看我的预约
          </van-button>
          <van-button plain block style="margin-top: 10px;" @click="showSuccess = false">
            继续预约
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantApi, reservationApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const restaurantId = ref(route.params.restaurantId)
const loading = ref(true)
const submitting = ref(false)
const timeSlotsLoading = ref(false)
const restaurant = ref(null)
const tableTypes = ref([])
const selectedTable = ref(null)
const selectedDate = ref('')
const selectedTime = ref('')
const peopleCount = ref(1)
const showCalendar = ref(false)
const showSuccess = ref(false)
const newReservation = ref(null)

const minDate = new Date()
const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

const timeSlots = ref([])

const canSubmit = computed(() => {
  return selectedTable.value && selectedDate.value && selectedTime.value
})

onMounted(() => {
  loadData()
})

async function loadData() {
  try {
    loading.value = true
    const data = await restaurantApi.detail(restaurantId.value)
    restaurant.value = data.restaurant
    tableTypes.value = data.table_types
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function selectTable(table) {
  selectedTable.value = table
  selectedDate.value = ''
  selectedTime.value = ''
  peopleCount.value = table.min_people
  timeSlots.value = []
}

function onDateConfirm(date) {
  selectedDate.value = dayjs(date).format('YYYY-MM-DD')
  showCalendar.value = false
  loadTimeSlots()
}

watch([selectedTable, selectedDate], () => {
  if (selectedTable.value && selectedDate.value) {
    loadTimeSlots()
  }
})

async function loadTimeSlots() {
  try {
    timeSlotsLoading.value = true
    timeSlots.value = await reservationApi.getTimeSlots(
      restaurantId.value,
      selectedTable.value.id,
      selectedDate.value
    )
  } catch (e) {
    console.error(e)
  } finally {
    timeSlotsLoading.value = false
  }
}

async function submitReservation() {
  if (!canSubmit.value) {
    showToast('请完善预约信息')
    return
  }

  try {
    submitting.value = true
    newReservation.value = await reservationApi.create({
      restaurant_id: Number(restaurantId.value),
      table_type_id: selectedTable.value.id,
      user_id: userStore.userInfo.id,
      user_phone: userStore.userInfo.phone,
      people_count: peopleCount.value,
      reserve_date: selectedDate.value,
      reserve_time: selectedTime.value + ':00'
    })
    showSuccess.value = true
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

function goToMyReservation() {
  showSuccess.value = false
  router.push('/my-reservation')
}
</script>

<style lang="less" scoped>
.table-type-item {
  padding: 16px;
  border: 2px solid #eee;
  border-radius: 10px;
  margin-bottom: 12px;
  cursor: pointer;

  &.active {
    border-color: #1989fa;
    background: #e8f3ff;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.date-selector {
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.time-slot-item {
  padding: 12px 8px;
  text-align: center;
  border: 2px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &.active {
    border-color: #1989fa;
    background: #e8f3ff;
    color: #1989fa;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  span {
    display: block;
  }
}

.success-content {
  padding: 30px 20px;
  text-align: center;
}
</style>
