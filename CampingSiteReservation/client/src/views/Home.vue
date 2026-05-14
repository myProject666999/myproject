<template>
  <div class="page-container">
    <van-nav-bar title="露营地预订" />
    
    <div class="banner">
      <van-image
        src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20camping%20site%20with%20tents%20and%20mountains%20at%20sunset&image_size=landscape_16_9"
        fit="cover"
        class="banner-image"
      />
      <div class="banner-text">
        <h1>星空露营地</h1>
        <p>远离城市喧嚣，享受自然宁静</p>
      </div>
    </div>

    <div class="section-title">功能导航</div>
    <van-grid :column-num="4" :border="false">
      <van-grid-item icon="map" text="营地地图" @click="router.push('/map')" />
      <van-grid-item icon="location-o" text="营位预订" @click="router.push('/campsites')" />
      <van-grid-item icon="shopping-cart-o" text="装备租赁" @click="router.push('/equipments')" />
      <van-grid-item icon="star-o" text="活动报名" @click="router.push('/activities')" />
      <van-grid-item icon="qr" text="入园签到" @click="router.push('/checkin')" />
      <van-grid-item icon="orders-o" text="我的订单" @click="router.push('/orders')" />
      <van-grid-item icon="photo-o" text="评价相册" @click="router.push('/reviews')" />
      <van-grid-item icon="user-o" text="个人中心" @click="router.push('/profile')" />
    </van-grid>

    <div class="section-title">热门营位</div>
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell
        v-for="item in campsites"
        :key="item.id"
        @click="router.push('/campsite/' + item.id)"
      >
        <template #icon>
          <div class="campsite-icon">
            <van-icon :name="item.type === 'tent' ? 'home-o' : 'location-o'" />
          </div>
        </template>
        <template #title>
          {{ item.name }}
        </template>
        <template #label>
          <span class="campsite-type">
            {{ item.type === 'tent' ? '帐篷区' : '房车区' }}
          </span>
          <span class="capacity">
            容纳{{ item.max_capacity }}人
          </span>
        </template>
        <template #value>
          <span class="price">{{ item.price }}</span>
          <span class="unit">起/晚</span>
        </template>
      </van-cell>
    </van-list>

    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/map" icon="map">地图</van-tabbar-item>
      <van-tabbar-item replace to="/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCampsites } from '@/api/campsites'

const router = useRouter()
const activeTab = ref(0)
const loading = ref(false)
const finished = ref(false)
const campsites = ref([])

const loadCampsites = async () => {
  try {
    const response = await getCampsites()
    if (response && response.success) {
      campsites.value = response.data || []
    }
  } catch (error) {
    console.error('加载营位失败:', error)
  }
}

const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 500)
}

onMounted(() => {
  loadCampsites()
  onLoad()
})
</script>

<style scoped>
.banner {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: #fff;
}

.banner-text h1 {
  font-size: 24px;
  margin: 0 0 8px 0;
}

.banner-text p {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.campsite-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e9;
  border-radius: 8px;
  font-size: 20px;
  color: #07c160;
}

.campsite-type {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

.capacity {
  font-size: 12px;
  color: #969799;
}

.price {
  font-size: 18px;
  color: #ee0a24;
  font-weight: 600;
}

.price::before {
  content: '¥';
  font-size: 12px;
}

.unit {
  font-size: 12px;
  color: #969799;
  margin-left: 4px;
}
</style>
