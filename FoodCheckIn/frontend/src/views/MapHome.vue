<template>
  <div class="map-home">
    <div class="map-container" ref="mapContainer"></div>
    <div class="map-sidebar">
      <div class="sidebar-header">
        <h3>餐厅列表</h3>
        <el-button type="primary" size="small" @click="startAddRestaurant">
          <el-icon><Plus /></el-icon>
          新增餐厅
        </el-button>
      </div>
      <div class="restaurant-list">
        <div 
          v-for="restaurant in restaurants" 
          :key="restaurant.id" 
          class="restaurant-item"
          :class="{ active: selectedId === restaurant.id }"
          @click="selectRestaurant(restaurant)"
        >
          <div class="restaurant-info">
            <div class="name">{{ restaurant.name }}</div>
            <div class="cuisine">{{ restaurant.cuisineType }} · ¥{{ restaurant.avgPrice }}/人</div>
            <div class="rating">
              <el-rate 
                v-model="restaurant.overallRating" 
                disabled 
                show-score 
                text-color="#ff9900"
                :max="5"
              />
            </div>
          </div>
          <el-button type="primary" link @click.stop="goToDetail(restaurant.id)">
            查看详情
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog 
      v-model="showAddRestaurant" 
      title="新增餐厅" 
      width="600px"
      @close="onDialogClose"
      @open="onDialogOpen"
    >
      <el-form :model="restaurantForm" label-width="80px">
        <el-form-item label="餐厅名称">
          <el-input v-model="restaurantForm.name" placeholder="请输入餐厅名称" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="restaurantForm.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="地图位置" required>
          <div class="location-picker">
            <el-input 
              v-model="locationText" 
              :placeholder="isAddingMode ? '请在地图上点击选择位置...' : '请选择位置'"
              readonly
            >
              <template #append>
                <el-button @click="reopenLocationPicker">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </template>
            </el-input>
            <div class="coords-input">
              <el-form-item label="纬度" style="margin-bottom: 8px; margin-top: 8px;">
                <el-input-number 
                  v-model="restaurantForm.latitude" 
                  :precision="6" 
                  :step="0.000001"
                  :min="-90"
                  :max="90"
                  style="width: 100%"
                  @change="onCoordsChange"
                />
              </el-form-item>
              <el-form-item label="经度" style="margin-bottom: 0;">
                <el-input-number 
                  v-model="restaurantForm.longitude" 
                  :precision="6" 
                  :step="0.000001"
                  :min="-180"
                  :max="180"
                  style="width: 100%"
                  @change="onCoordsChange"
                />
              </el-form-item>
            </div>
            <div v-if="!restaurantForm.latitude" class="tips">
              <el-icon color="#e6a23c"><InfoFilled /></el-icon>
              <span>点击右侧刷新按钮，在地图上点击选择位置</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="restaurantForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="菜系类型">
          <el-select v-model="restaurantForm.cuisineType" placeholder="请选择菜系" style="width: 100%">
            <el-option label="川菜" value="川菜" />
            <el-option label="江浙菜" value="江浙菜" />
            <el-option label="粤菜" value="粤菜" />
            <el-option label="湘菜" value="湘菜" />
            <el-option label="东北菜" value="东北菜" />
            <el-option label="西北菜" value="西北菜" />
            <el-option label="日料" value="日料" />
            <el-option label="韩餐" value="韩餐" />
            <el-option label="西餐" value="西餐" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="人均价格">
          <el-input-number v-model="restaurantForm.avgPrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="餐厅描述">
          <el-input 
            v-model="restaurantForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入餐厅描述" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="saveRestaurant">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import { restaurantApi, mapApi } from '@/api'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()
const mapContainer = ref(null)
const restaurants = ref([])
const selectedId = ref(null)
const showAddRestaurant = ref(false)
const locationText = ref('')
const isAddingMode = ref(false)
let map = null
let markers = []
let tempMarker = null

const restaurantForm = ref({
  name: '',
  address: '',
  latitude: null,
  longitude: null,
  phone: '',
  cuisineType: '',
  avgPrice: null,
  description: ''
})

const initMap = () => {
  map = L.map(mapContainer.value).setView([39.9042, 116.4074], 12)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  map.on('click', (e) => {
    if (isAddingMode.value) {
      const { lat, lng } = e.latlng
      restaurantForm.value.latitude = lat
      restaurantForm.value.longitude = lng
      locationText.value = `已选择位置: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      
      if (tempMarker) {
        map.removeLayer(tempMarker)
      }
      tempMarker = L.marker([lat, lng], { 
        icon: L.divIcon({
          className: 'temp-marker',
          html: '<div style="background:#67c23a;width:24px;height:24px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:12px;font-weight:bold;">+</span></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map)

      isAddingMode.value = false
      showAddRestaurant.value = true
    }
  })
}

const loadRestaurants = async () => {
  try {
    const data = await mapApi.getRestaurants()
    restaurants.value = data
    addMarkers()
  } catch (error) {
    console.error('加载餐厅失败:', error)
  }
}

const addMarkers = () => {
  markers.forEach(m => map.removeLayer(m))
  markers = []

  restaurants.value.forEach(restaurant => {
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:${selectedId.value === restaurant.id ? '#409eff' : '#f56c6c'};width:30px;height:30px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;">${restaurant.overallRating || '★'}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })

    const marker = L.marker([restaurant.latitude, restaurant.longitude], { icon }).addTo(map)
    
    marker.bindPopup(`
      <div style="min-width:150px;">
        <h4 style="margin:0 0 8px 0;">${restaurant.name}</h4>
        <p style="margin:4px 0;color:#666;font-size:12px;">${restaurant.cuisineType} · ¥${restaurant.avgPrice}/人</p>
        <p style="margin:4px 0;color:#ff9900;font-size:12px;">评分: ${restaurant.overallRating || '暂无'}</p>
        <button onclick="window.routerGo(${restaurant.id})" style="margin-top:8px;padding:4px 12px;background:#409eff;color:#fff;border:none;border-radius:4px;cursor:pointer;">查看详情</button>
      </div>
    `)

    marker.on('click', () => {
      selectRestaurant(restaurant)
    })

    markers.push(marker)
  })
}

const selectRestaurant = (restaurant) => {
  selectedId.value = restaurant.id
  map.setView([restaurant.latitude, restaurant.longitude], 15)
  addMarkers()
}

const goToDetail = (id) => {
  router.push(`/restaurant/${id}`)
}

window.routerGo = goToDetail

const startAddRestaurant = () => {
  resetForm()
  isAddingMode.value = true
  showAddRestaurant.value = false
  ElMessage.info('请在地图上点击选择餐厅位置')
}

const onCoordsChange = () => {
  if (restaurantForm.value.latitude && restaurantForm.value.longitude) {
    locationText.value = `已选择位置: ${restaurantForm.value.latitude.toFixed(6)}, ${restaurantForm.value.longitude.toFixed(6)}`
    
    if (tempMarker) {
      map.removeLayer(tempMarker)
    }
    tempMarker = L.marker([restaurantForm.value.latitude, restaurantForm.value.longitude], { 
      icon: L.divIcon({
        className: 'temp-marker',
        html: '<div style="background:#67c23a;width:24px;height:24px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:12px;font-weight:bold;">+</span></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(map)
    
    map.setView([restaurantForm.value.latitude, restaurantForm.value.longitude], 15)
  }
}

const clearLocation = () => {
  restaurantForm.value.latitude = null
  restaurantForm.value.longitude = null
  locationText.value = ''
  if (tempMarker) {
    map.removeLayer(tempMarker)
    tempMarker = null
  }
  isAddingMode.value = false
  showAddRestaurant.value = false
  ElMessage.info('请在地图上点击选择新位置')
  setTimeout(() => {
    isAddingMode.value = true
  }, 300)
}

const reopenLocationPicker = () => {
  // 让用户可以重新在地图上选择位置
  showAddRestaurant.value = false
  isAddingMode.value = true
  ElMessage.info('请在地图上点击选择新位置')
}

const saveRestaurant = async () => {
  if (!restaurantForm.value.name) {
    ElMessage.error('请输入餐厅名称')
    return
  }
  if (!restaurantForm.value.latitude || !restaurantForm.value.longitude) {
    ElMessage.error('请在地图上选择位置')
    return
  }

  try {
    await restaurantApi.add(restaurantForm.value)
    ElMessage.success('添加成功')
    showAddRestaurant.value = false
    resetForm()
    if (tempMarker) {
      map.removeLayer(tempMarker)
      tempMarker = null
    }
    loadRestaurants()
  } catch (error) {
    console.error('添加失败:', error)
  }
}

const resetForm = () => {
  restaurantForm.value = {
    name: '',
    address: '',
    latitude: null,
    longitude: null,
    phone: '',
    cuisineType: '',
    avgPrice: null,
    description: ''
  }
  locationText.value = ''
}

const onCancel = () => {
  showAddRestaurant.value = false
  isAddingMode.value = false
  if (tempMarker) {
    map.removeLayer(tempMarker)
    tempMarker = null
  }
}

const onDialogOpen = () => {
  isAddingMode.value = false
}

const onDialogClose = () => {
  // 只有在没有选择位置或者是新增模式时才重置
  if (isAddingMode.value || !restaurantForm.value.latitude) {
    isAddingMode.value = false
    if (tempMarker) {
      map.removeLayer(tempMarker)
      tempMarker = null
    }
    resetForm()
  }
  // 如果已经选择了位置，不清空表单，等保存或取消时再处理
}

onMounted(async () => {
  await nextTick()
  initMap()
  loadRestaurants()
})
</script>

<style lang="scss" scoped>
.map-home {
  display: flex;
  height: calc(100vh - 120px);
  gap: 20px;
}

.map-container {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.map-sidebar {
  width: 360px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }
  }

  .restaurant-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .restaurant-item {
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    transition: all 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #ecf5ff;
      border: 1px solid #409eff;
    }

    .restaurant-info {
      flex: 1;

      .name {
        font-weight: bold;
        margin-bottom: 4px;
      }

      .cuisine {
        color: #999;
        font-size: 12px;
        margin-bottom: 4px;
      }
    }
  }
}

.location-picker {
  .coords {
    margin-top: 8px;
    color: #67c23a;
    font-size: 12px;
  }
  
  .coords-input {
    margin-top: 12px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;
    
    :deep(.el-form-item) {
      margin-bottom: 8px;
    }
  }
  
  .tips {
    margin-top: 10px;
    padding: 10px 12px;
    background: #fdf6ec;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #e6a23c;
  }
}

:deep(.temp-marker) {
  background: transparent;
  border: none;
}

:deep(.custom-marker) {
  background: transparent;
  border: none;
}
</style>
