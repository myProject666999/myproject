<template>
  <div class="page-container">
    <van-nav-bar title="营地地图" left-arrow @click-left="router.back()" />
    
    <div ref="mapContainer" class="map-container">
      <div v-if="!mapReady" class="fallback-map">
        <div class="fallback-title">营地布局图</div>
        <div class="campground-map">
          <div class="map-section tent-section">
            <div class="section-title">帐篷区</div>
            <div class="site-grid">
              <div 
                v-for="site in tentCampsites" 
                :key="site.id" 
                class="site-item"
                @click="goToCampsite(site)"
              >
                {{ site.map_position }}
              </div>
            </div>
          </div>
          <div class="map-section rv-section">
            <div class="section-title">房车区</div>
            <div class="site-grid">
              <div 
                v-for="site in rvCampsites" 
                :key="site.id" 
                class="site-item"
                @click="goToCampsite(site)"
              >
                {{ site.map_position }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <van-loading v-if="loading" class="loading-mask" type="spinner" />
    
    <div class="campsite-list">
      <div class="list-header">
        <span>营位列表</span>
      </div>
      <div 
        v-for="item in campsites" 
        :key="item.id" 
        class="campsite-card"
        @click="goToCampsite(item)"
      >
        <div class="card-content">
          <div class="marker-icon" :class="item.type">
            <van-icon :name="item.type === 'tent' ? 'home-o' : 'location-o'" />
          </div>
          <div class="card-info">
            <div class="card-title">
              {{ item.name }}
              <van-tag :type="item.status === 'available' ? 'success' : 'warning'" class="status-tag">
                {{ item.status === 'available' ? '可预订' : '维护中' }}
              </van-tag>
            </div>
            <div class="card-desc">
              <span class="price">¥{{ item.price }}</span>
              <span class="unit">起/晚</span>
              <span class="capacity">| 容纳{{ item.max_capacity }}人</span>
            </div>
          </div>
        </div>
        <van-button square text="预订" type="primary" size="small" @click.stop="goToCampsite(item)" />
      </div>
    </div>

    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/map" icon="map">地图</van-tabbar-item>
      <van-tabbar-item replace to="/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCampsites } from '@/api/campsites'

const router = useRouter()
const mapContainer = ref(null)
const activeTab = ref(1)
const campsites = ref([])
const loading = ref(false)
const mapReady = ref(false)

const tentCampsites = computed(() => campsites.value.filter(s => s.type === 'tent'))
const rvCampsites = computed(() => campsites.value.filter(s => s.type === 'rv'))

const loadCampsites = async () => {
  try {
    loading.value = true
    const response = await getCampsites()
    if (response && response.success && response.data) {
      campsites.value = response.data
    }
  } catch (error) {
    console.error('加载营位列表失败:', error)
  } finally {
    loading.value = false
  }
}

const goToCampsite = (site) => {
  router.push('/campsite/' + site.id)
}

onMounted(() => {
  loadCampsites()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 280px;
  background: #e8f5e9;
  position: relative;
}

.fallback-map {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  box-sizing: border-box;
}

.fallback-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2e7d32;
}

.campground-map {
  flex: 1;
  display: flex;
  gap: 12px;
}

.map-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #323233;
  text-align: center;
}

.site-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  flex: 1;
}

.site-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px 0;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #646566;
  cursor: pointer;
  transition: all 0.2s;
}

.site-item:active {
  transform: scale(0.95);
}

.tent-section .site-item {
  background: #e8f5e9;
  color: #2e7d32;
}

.rv-section .site-item {
  background: #e3f2fd;
  color: #1565c0;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
}

.campsite-list {
  padding: 12px;
  padding-bottom: 60px;
}

.list-header {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
  padding: 0 4px;
}

.campsite-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.marker-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.marker-icon.tent {
  background: #e8f5e9;
  color: #07c160;
}

.marker-icon.rv {
  background: #e3f2fd;
  color: #1989fa;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.status-tag {
  margin-left: 8px;
}

.card-desc {
  font-size: 14px;
  color: #969799;
  display: flex;
  align-items: center;
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

.capacity {
  font-size: 12px;
  color: #969799;
  margin-left: 8px;
}
</style>
