<template>
  <div class="page-container">
    <van-nav-bar title="我的订单" />
    
    <van-empty
      v-if="!isLogin"
      description="请先登录查看订单"
    >
      <van-button type="primary" round @click="goToLogin">
        去登录
      </van-button>
    </van-empty>
    
    <template v-else>
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="全部">
          <order-list :orders="orders" @click="viewOrder" />
        </van-tab>
        <van-tab title="待支付">
          <order-list :orders="pendingOrders" @click="viewOrder" />
        </van-tab>
        <van-tab title="待入住">
          <order-list :orders="paidOrders" @click="viewOrder" />
        </van-tab>
        <van-tab title="已完成">
          <order-list :orders="completedOrders" @click="viewOrder" />
        </van-tab>
      </van-tabs>
    </template>

    <van-tabbar v-model="activeTabBar" route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/map" icon="map">地图</van-tabbar-item>
      <van-tabbar-item replace to="/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getReservations } from '@/api/reservations'
import { useUserStore } from '@/stores/user'
import OrderList from '@/components/OrderList.vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref(0)
const activeTabBar = ref(2)
const orders = ref([])
const loading = ref(false)

const isLogin = computed(() => userStore.isLogin)

const loadOrders = async (status) => {
  if (!userStore.isLogin) {
    return
  }
  
  try {
    loading.value = true
    const params = {}
    if (status) {
      params.status = status
    }
    console.log('加载订单，参数:', params)
    const response = await getReservations(params)
    console.log('订单API响应:', response)
    if (response && response.success && response.data && response.data.reservations) {
      orders.value = response.data.reservations
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    if (error.response && error.response.status === 401) {
      showToast('请先登录')
      userStore.logout()
      router.push('/profile')
    }
  } finally {
    loading.value = false
  }
}

const pendingOrders = computed(() => {
  return orders.value.filter(o => o.status === 'pending')
})
const paidOrders = computed(() => {
  return orders.value.filter(o => o.status === 'paid')
})
const completedOrders = computed(() => {
  return orders.value.filter(o => ['checked_out', 'checked_in', 'completed'].includes(o.status))
})

const viewOrder = (order) => {
  console.log('查看订单:', order.order_no)
}

const onTabChange = (index) => {
  console.log('切换到标签:', index)
  activeTab.value = index
  if (index === 0) {
    loadOrders()
  } else if (index === 1) {
    loadOrders('pending')
  } else if (index === 2) {
    loadOrders('paid')
  } else if (index === 3) {
    loadOrders('checked_out')
  }
}

const goToLogin = () => {
  router.push('/profile')
}

watch(() => userStore.isLogin, (newVal) => {
  if (newVal) {
    loadOrders()
  }
})

onMounted(() => {
  userStore.restoreLogin()
  if (userStore.isLogin) {
    loadOrders()
  }
})
</script>
