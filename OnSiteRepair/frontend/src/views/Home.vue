<template>
  <div class="page-container">
    <van-nav-bar title="上门维修">
      <template #right>
        <van-icon name="bell-o" size="20" @click="goNotifications" />
      </template>
    </van-nav-bar>

    <div class="banner">
      <div class="banner-content">
        <h2>专业维修 上门服务</h2>
        <p>家电维修 · 水电维修 · 快速响应</p>
      </div>
    </div>

    <van-grid :column-num="4" class="category-grid">
      <van-grid-item icon="tv-o" text="家电维修" @click="goCreateOrder('家电')" />
      <van-grid-item icon="fire-o" text="水电维修" @click="goCreateOrder('水电')" />
      <van-grid-item icon="orders-o" text="我的订单" @click="goOrders" />
      <van-grid-item icon="user-o" text="个人中心" @click="goProfile" />
    </van-grid>

    <div class="section">
      <div class="section-title">服务优势</div>
      <van-cell-group inset>
        <van-cell title="快速响应" icon="clock-o" />
        <van-cell title="专业师傅" icon="friends-o" />
        <van-cell title="价格透明" icon="gold-coin-o" />
        <van-cell title="售后保障" icon="shield-o" />
      </van-cell-group>
    </div>

    <div v-if="userStore.userType === 2" class="section">
      <div class="section-title">师傅专区</div>
      <van-cell-group inset>
        <van-cell title="待抢订单" is-link @click="goGrab" />
        <van-cell title="我的订单" is-link @click="goOrders" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const goCreateOrder = (category) => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (userStore.userType !== 1) {
    showToast('只有用户可以下单')
    return
  }
  router.push({ path: '/order/create', query: { category } })
}

const goOrders = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/orders')
}

const goGrab = () => {
  router.push('/grab')
}

const goProfile = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/profile')
}

const goNotifications = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/notifications')
}
</script>

<style scoped>
.banner {
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
  padding: 40px 20px;
  color: white;
  text-align: center;
}

.banner h2 {
  margin: 0 0 10px;
  font-size: 24px;
}

.banner p {
  margin: 0;
  opacity: 0.9;
}

.category-grid {
  background: white;
  margin: 15px;
  border-radius: 12px;
}

.section {
  margin-top: 15px;
}

.section-title {
  padding: 10px 15px;
  font-size: 14px;
  color: #969799;
}
</style>
