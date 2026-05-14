<template>
  <div class="page-container detail-page">
    <van-nav-bar title="营位详情" left-arrow @click-left="router.back()" />
    
    <van-loading v-if="loading" class="loading-container" type="spinner" />
    
    <template v-else>
      <van-swipe class="detail-swipe" :autoplay="3000">
        <van-swipe-item v-for="(image, index) in images" :key="index">
          <van-image :src="image" fit="cover" class="detail-image" />
        </van-swipe-item>
      </van-swipe>

      <van-cell-group inset>
        <van-cell :title="campsite.name" :value="campsite.type === 'tent' ? '帐篷区' : '房车区'" />
        <van-cell title="平日价格" :value="'¥' + campsite.price + '/晚'" />
        <van-cell title="周末价格" :value="'¥' + campsite.weekend_price + '/晚'" />
        <van-cell title="最大容纳" :value="campsite.max_capacity + '人'" />
      </van-cell-group>

      <div class="section-title">营位描述</div>
      <van-cell-group inset>
        <van-cell :value="campsite.description" />
      </van-cell-group>

      <div class="section-title">选择入住日期</div>
      <van-cell-group inset>
        <van-cell title="入住日期" :value="checkinDate || '请选择'" is-link @click="showCalendar = true" />
        <van-cell title="离店日期" :value="checkoutDate || '请选择'" is-link @click="showCalendar = true" />
        <van-cell title="入住人数" is-link @click="showGuests = true">
          <template #value>
            <span>{{ guests }}人</span>
          </template>
        </van-cell>
      </van-cell-group>

      <van-calendar
        v-model:show="showCalendar"
        type="range"
        :min-date="minDate"
        color="#07c160"
        @confirm="onDateConfirm"
        @cancel="showCalendar = false"
      />

      <van-popup v-model:show="showGuests" position="bottom" :style="{ height: '30%' }">
        <van-picker
          :columns="guestOptions"
          @confirm="onGuestConfirm"
          @cancel="showGuests = false"
        />
      </van-popup>

      <van-submit-bar
        :price="totalPrice * 100"
        button-text="立即预订"
        @submit="onSubmit"
      >
        <van-submit-bar-text>共{{ nights }}晚</van-submit-bar-text>
        <van-submit-bar-text v-if="isWeekendIncluded">
          <van-tag type="warning" size="small">含周末</van-tag>
        </van-submit-bar-text>
      </van-submit-bar>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getCampsiteDetail } from '@/api/campsites'

const router = useRouter()
const route = useRoute()

const campsite = ref({
  id: route.params.id,
  name: '',
  type: 'tent',
  price: 0,
  weekend_price: 0,
  max_capacity: 2,
  description: ''
})
const loading = ref(true)

const images = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scenic%20camping%20view%20with%20tent%20at%20sunset&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20tent%20under%20starry%20night%20sky&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=morning%20sunrise%20over%20campsite%20with%20mountains&image_size=landscape_16_9'
]

const checkinDate = ref('')
const checkoutDate = ref('')
const guests = ref(2)
const showCalendar = ref(false)
const showGuests = ref(false)

const minDate = new Date()
const defaultDate = computed(() => {
  if (checkinDate.value && checkoutDate.value) {
    return [new Date(checkinDate.value), new Date(checkoutDate.value)]
  }
  return null
})

const guestOptions = Array.from({ length: 8 }, (_, i) => ({
  text: `${i + 1}人`,
  value: i + 1
}))

const nights = computed(() => {
  if (!checkinDate.value || !checkoutDate.value) return 0
  const start = new Date(checkinDate.value)
  const end = new Date(checkoutDate.value)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const isWeekendIncluded = computed(() => {
  if (!checkinDate.value || !checkoutDate.value) return false
  const start = new Date(checkinDate.value)
  for (let i = 0; i < nights.value; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return true
  }
  return false
})

const totalPrice = computed(() => {
  if (!nights.value) return campsite.value.price || 0
  
  let total = 0
  const start = new Date(checkinDate.value)
  for (let i = 0; i < nights.value; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    total += isWeekend ? campsite.value.weekend_price : campsite.value.price
  }
  return total
})

const loadCampsiteDetail = async () => {
  try {
    loading.value = true
    const response = await getCampsiteDetail(route.params.id)
    if (response && response.success) {
      campsite.value = response.data || campsite.value
    }
  } catch (error) {
    console.error('加载营位详情失败:', error)
  } finally {
    loading.value = false
  }
}

const onDateConfirm = (value) => {
  console.log('日历确认事件值:', value)
  
  let dates = []
  if (Array.isArray(value)) {
    dates = value
  } else if (value) {
    if (Array.isArray(value.selectedValues)) {
      dates = value.selectedValues
    } else if (Array.isArray(value.value)) {
      dates = value.value
    } else if (value.startDate && value.endDate) {
      dates = [value.startDate, value.endDate]
    }
  }
  
  console.log('解析后的日期数组:', dates)
  
  if (dates.length >= 2) {
    const [start, end] = dates
    if (start instanceof Date && end instanceof Date) {
      const startYear = start.getFullYear()
      const startMonth = String(start.getMonth() + 1).padStart(2, '0')
      const startDay = String(start.getDate()).padStart(2, '0')
      const endYear = end.getFullYear()
      const endMonth = String(end.getMonth() + 1).padStart(2, '0')
      const endDay = String(end.getDate()).padStart(2, '0')
      
      checkinDate.value = `${startYear}-${startMonth}-${startDay}`
      checkoutDate.value = `${endYear}-${endMonth}-${endDay}`
      console.log('设置的日期:', checkinDate.value, checkoutDate.value)
    }
  }
  showCalendar.value = false
}

const onGuestConfirm = ({ selectedOptions }) => {
  guests.value = selectedOptions[0].value
  showGuests.value = false
}

const onSubmit = () => {
  if (!checkinDate.value || !checkoutDate.value) {
    showToast('请选择入住日期')
    return
  }
  
  router.push({
    path: '/order',
    query: {
      campsiteId: campsite.value.id,
      checkin: checkinDate.value,
      checkout: checkoutDate.value,
      guests: guests.value
    }
  })
}

onMounted(() => {
  loadCampsiteDetail()
})
</script>

<style scoped>
.detail-page {
  padding-bottom: 50px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.detail-swipe {
  height: 250px;
}

.detail-image {
  width: 100%;
  height: 100%;
}
</style>
