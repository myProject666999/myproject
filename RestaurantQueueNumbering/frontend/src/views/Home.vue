<template>
  <div class="page-container">
    <van-nav-bar title="餐厅列表" fixed placeholder>
      <template #right>
        <van-icon name="user-o" size="22" @click="goToUser" />
      </template>
    </van-nav-bar>

    <div class="content-wrapper">
      <div v-if="loading" class="loading-center">
        <van-loading size="24px">加载中...</van-loading>
      </div>

      <div v-else-if="restaurants.length === 0" class="empty-state">
        <van-icon name="shop-o" size="48" />
        <p style="margin-top: 12px;">暂无餐厅</p>
      </div>

      <div v-else>
        <div
          v-for="restaurant in restaurants"
          :key="restaurant.id"
          class="card"
          @click="goToRestaurant(restaurant.id)"
        >
          <div class="flex-between">
            <div>
              <h3 style="font-size: 18px; font-weight: 600;">{{ restaurant.name }}</h3>
              <p class="text-gray" style="margin-top: 6px;">
                <van-icon name="location-o" /> {{ restaurant.address }}
              </p>
              <p class="text-gray" style="margin-top: 4px;">
                <van-icon name="clock-o" /> {{ restaurant.business_hours }}
              </p>
            </div>
            <van-tag :type="restaurant.status === 1 ? 'success' : 'danger'">
              {{ restaurant.status === 1 ? '营业中' : '打烊' }}
            </van-tag>
          </div>
          <p style="margin-top: 10px; color: #666; font-size: 14px;">
            {{ restaurant.description }}
          </p>
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <van-button
              size="small"
              type="primary"
              block
              @click.stop="goToQueue(restaurant.id)"
            >
              取号
            </van-button>
            <van-button
              size="small"
              plain
              block
              @click.stop="goToReservation(restaurant.id)"
            >
              预约
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="shop-o" name="home">餐厅</van-tabbar-item>
      <van-tabbar-item icon="orders-o" name="my-queue">我的排队</van-tabbar-item>
      <van-tabbar-item icon="calendar-o" name="my-reservation">我的预约</van-tabbar-item>
      <van-tabbar-item icon="user-o" name="user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { restaurantApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { showDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const restaurants = ref([])
const activeTab = ref('home')

onMounted(() => {
  loadRestaurants()
})

async function loadRestaurants() {
  try {
    loading.value = true
    restaurants.value = await restaurantApi.list()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function goToRestaurant(id) {
  goToQueue(id)
}

function goToQueue(restaurantId) {
  if (!userStore.isLoggedIn) {
    showLoginDialog()
    return
  }
  router.push(`/queue/${restaurantId}`)
}

function goToReservation(restaurantId) {
  if (!userStore.isLoggedIn) {
    showLoginDialog()
    return
  }
  router.push(`/reservation/${restaurantId}`)
}

function goToUser() {
  if (!userStore.isLoggedIn) {
    showLoginDialog()
    return
  }
  activeTab.value = 'user'
}

function showLoginDialog() {
  showDialog({
    title: '提示',
    message: '请先登录',
    confirmButtonText: '去登录'
  }).then(() => {
    router.push('/login')
  })
}

activeTab.value = 'home'
watch(activeTab, (val) => {
  if (val === 'my-queue') {
    router.push('/my-queue')
  } else if (val === 'my-reservation') {
    router.push('/my-reservation')
  } else if (val === 'user') {
    router.push('/login')
  }
})
</script>
