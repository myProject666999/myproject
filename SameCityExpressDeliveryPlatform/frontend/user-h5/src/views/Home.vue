<template>
  <div class="home-page page-container">
    <div class="header">
      <div class="welcome">
        <h3>您好，{{ userInfo?.nickname || userInfo?.username || '用户' }}</h3>
        <p>余额：<span class="price-highlight">¥{{ userInfo?.balance || 0 }}</span></p>
      </div>
    </div>

    <div class="service-cards">
      <div class="service-card" @click="goToCreateOrder(1)">
        <div class="card-icon">📄</div>
        <div class="card-title">文件配送</div>
      </div>
      <div class="service-card" @click="goToCreateOrder(2)">
        <div class="card-icon">💐</div>
        <div class="card-title">鲜花配送</div>
      </div>
      <div class="service-card" @click="goToCreateOrder(3)">
        <div class="card-icon">🍔</div>
        <div class="card-title">食品配送</div>
      </div>
      <div class="service-card" @click="goToCreateOrder(4)">
        <div class="card-icon">📦</div>
        <div class="card-title">其他物品</div>
      </div>
    </div>

    <div class="quick-actions">
      <van-grid :column-num="4" :border="false">
        <van-grid-item icon="orders-o" text="我的订单" @click="$router.push('/order')" />
        <van-grid-item icon="location-o" text="地址管理" @click="$router.push('/address')" />
        <van-grid-item icon="warning-o" text="异常工单" @click="$router.push('/exception')" />
        <van-grid-item icon="user-o" text="个人中心" @click="$router.push('/profile')" />
      </van-grid>
    </div>

    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/order" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const active = ref(0)

const userInfo = computed(() => userStore.userInfo)

function goToCreateOrder(itemType: number) {
  router.push({
    name: 'CreateOrder',
    query: { type: itemType.toString() }
  })
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchProfile()
  }
})
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  color: #fff;
}

.welcome h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 5px;
}

.welcome p {
  font-size: 14px;
  opacity: 0.9;
}

.service-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
  margin-top: -20px;
}

.service-card {
  flex: 1 0 calc(50% - 5px);
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.card-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.quick-actions {
  background: #fff;
  margin: 10px 15px;
  border-radius: 12px;
  overflow: hidden;
}
</style>
