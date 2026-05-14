<template>
  <div class="page-container">
    <van-nav-bar title="确认订单" left-arrow @click-left="router.back()" />
    
    <van-empty
      v-if="!isLogin"
      description="请先登录后再预订"
    >
      <van-button type="primary" round @click="goToLogin">
        去登录
      </van-button>
    </van-empty>
    
    <template v-else>
      <div class="order-section">
        <div class="section-header">
          <van-icon name="location-o" />
          <span>营位信息</span>
        </div>
        <van-cell-group inset>
          <van-cell title="营位" :value="campsite.name" />
          <van-cell title="类型" :value="campsite.type === 'tent' ? '帐篷区' : '房车区'" />
          <van-cell title="入住日期" :value="checkin" />
          <van-cell title="离店日期" :value="checkout" />
          <van-cell title="入住人数" :value="guests + '人'" />
          <van-cell title="入住晚数" :value="nights + '晚'" />
        </van-cell-group>
      </div>

      <div class="order-section" v-if="equipments.length > 0">
        <div class="section-header">
          <van-icon name="shopping-cart-o" />
          <span>租赁装备</span>
        </div>
        <van-cell-group inset>
          <van-cell
            v-for="item in equipments"
            :key="item.id"
            :title="item.name"
            :value="'¥' + item.price + ' × ' + item.quantity"
          />
        </van-cell-group>
      </div>

      <div class="order-section" v-if="activities.length > 0">
        <div class="section-header">
          <van-icon name="star-o" />
          <span>参与活动</span>
        </div>
        <van-cell-group inset>
          <van-cell
            v-for="item in activities"
            :key="item.id"
            :title="item.name"
            :value="'¥' + item.price + ' × ' + item.participants + '人'"
          />
        </van-cell-group>
      </div>

      <div class="order-section">
        <div class="section-header">
          <van-icon name="receipt" />
          <span>费用明细</span>
        </div>
        <van-cell-group inset>
          <van-cell title="营位费用" :value="'¥' + campsitePrice" />
          <van-cell v-if="equipmentsPrice > 0" title="装备费用" :value="'¥' + equipmentsPrice" />
          <van-cell v-if="activitiesPrice > 0" title="活动费用" :value="'¥' + activitiesPrice" />
          <van-cell title="总计">
            <template #value>
              <span class="total-price">¥{{ totalPrice }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <van-submit-bar
        :price="totalPrice * 100"
        button-text="提交订单"
        :loading="submitting"
        @submit="onSubmit"
      >
        <van-checkbox v-model="agreed" shape="square">
          我已阅读并同意<a href="#" style="color: #07c160">《预订须知》</a>
        </van-checkbox>
      </van-submit-bar>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getCampsiteDetail } from '@/api/campsites'
import { createReservation } from '@/api/reservations'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const campsite = ref({
  id: route.query.campsiteId || 1,
  name: '',
  type: 'tent',
  price: 0,
  weekend_price: 0
})

const checkin = ref(route.query.checkin || '')
const checkout = ref(route.query.checkout || '')
const guests = ref(parseInt(route.query.guests) || 2)
const agreed = ref(false)
const submitting = ref(false)
const loading = ref(true)

const equipments = ref([])
const activities = ref([])

const isLogin = computed(() => userStore.isLogin)

const nights = computed(() => {
  if (!checkin.value || !checkout.value) return 1
  const start = new Date(checkin.value)
  const end = new Date(checkout.value)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1
})

const campsitePrice = computed(() => {
  if (!campsite.value.price || !checkin.value || !checkout.value) return 0
  let total = 0
  const start = new Date(checkin.value)
  for (let i = 0; i < nights.value; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    total += isWeekend ? campsite.value.weekend_price : campsite.value.price
  }
  return total
})

const equipmentsPrice = computed(() => {
  return equipments.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const activitiesPrice = computed(() => {
  return activities.value.reduce((sum, item) => sum + item.price * item.participants, 0)
})

const totalPrice = computed(() => {
  return campsitePrice.value + equipmentsPrice.value + activitiesPrice.value
})

const loadCampsite = async () => {
  if (!route.query.campsiteId) {
    loading.value = false
    return
  }
  
  try {
    loading.value = true
    const response = await getCampsiteDetail(route.query.campsiteId)
    if (response && response.success) {
      campsite.value = response.data || campsite.value
    }
  } catch (error) {
    console.error('加载营位失败:', error)
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!agreed.value) {
    showToast('请先同意预订须知')
    return
  }
  
  if (!checkin.value || !checkout.value) {
    showToast('请选择入住日期')
    return
  }
  
  if (!userStore.isLogin) {
    showToast('请先登录')
    router.push('/profile')
    return
  }

  try {
    submitting.value = true
    const response = await createReservation({
      campsite_id: parseInt(campsite.value.id),
      checkin_date: checkin.value,
      checkout_date: checkout.value,
      guests: guests.value,
      equipments: equipments.value,
      activities: activities.value,
      contact_name: userStore.userInfo?.nickname || '',
      contact_phone: userStore.userInfo?.phone || ''
    })
    
    if (response && response.success) {
      showToast('订单提交成功')
      router.replace('/orders')
    }
  } catch (error) {
    console.error('提交订单失败:', error)
    if (error.response && error.response.status === 401) {
      showToast('请先登录')
      userStore.logout()
      router.push('/profile')
    }
  } finally {
    submitting.value = false
  }
}

const goToLogin = () => {
  router.push('/profile')
}

onMounted(() => {
  userStore.restoreLogin()
  loadCampsite()
})
</script>

<style scoped>
.order-section {
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 16px;
  color: #323233;
  font-weight: 500;
}

.section-header .van-icon {
  margin-right: 8px;
  color: #07c160;
}

.total-price {
  font-size: 18px;
  font-weight: 600;
  color: #ee0a24;
}
</style>
