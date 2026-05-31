<template>
  <Layout>
    <div class="route-map-page">
      <div class="filter-bar">
        <el-radio-group v-model="direction" @change="loadRoutes">
          <el-radio-button :label="0">全部线路</el-radio-button>
          <el-radio-button :label="1">上班线路</el-radio-button>
          <el-radio-button :label="2">下班线路</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="loadRoutes" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <div class="map-container">
        <div class="map-placeholder">
          <div class="map-title">🗺️ 线路地图视图</div>
          <div class="map-subtitle">模拟地图展示 - 实际项目可接入高德/百度地图API</div>
          
          <div class="routes-list">
            <el-card
              v-for="route in routes"
              :key="route.id"
              class="route-card"
              shadow="hover"
            >
              <template #header>
                <div class="card-header">
                  <span class="route-name">{{ route.name }}</span>
                  <el-tag :type="route.direction === 1 ? 'success' : 'warning'">
                    {{ route.direction === 1 ? '上班' : '下班' }}
                  </el-tag>
                </div>
              </template>
              <div class="route-info">
                <p><strong>线路编号：</strong>{{ route.route_no }}</p>
                <p><strong>总距离：</strong>{{ route.distance }} 公里</p>
                <p><strong>预计时长：</strong>{{ route.estimated_time }} 分钟</p>
                <div class="stations-preview">
                  <div class="station-label">途经站点：</div>
                  <div class="station-list">
                    <span
                      v-for="(station, index) in mockStations[route.id] || []"
                      :key="index"
                      class="station-item"
                    >
                      {{ station.name }}
                      <el-icon v-if="index < (mockStations[route.id] || []).length - 1"><ArrowRight /></el-icon>
                    </span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <div class="stations-section">
        <h3>全部站点</h3>
        <el-row :gutter="20">
          <el-col :span="6" v-for="station in stations" :key="station.id">
            <el-card class="station-card" shadow="hover">
              <div class="station-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="station-name">{{ station.name }}</div>
              <div class="station-address">{{ station.address }}</div>
              <div class="station-coord">
                {{ station.longitude.toFixed(4) }}, {{ station.latitude.toFixed(4) }}
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import Layout from '../components/Layout.vue'
import api from '../utils/api'

const loading = ref(false)
const direction = ref(0)
const routes = ref([])
const stations = ref([])
const mockStations = reactive({})

async function loadRoutes() {
  loading.value = true
  try {
    const params = direction.value ? { direction: direction.value } : {}
    const res = await api.get('/routes', { params })
    routes.value = res.data

    const stationsRes = await api.get('/stations')
    stations.value = stationsRes.data

    routes.value.forEach(route => {
      mockStations[route.id] = stations.value.slice(0, 3)
    })
  } catch (error) {
    ElMessage.error('加载线路失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRoutes()
})
</script>

<style scoped>
.route-map-page {
  height: 100%;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.map-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.map-placeholder {
  min-height: 300px;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.map-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.map-subtitle {
  color: #909399;
  margin-bottom: 30px;
}

.routes-list {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.route-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route-name {
  font-weight: 600;
  font-size: 16px;
}

.route-info p {
  margin: 8px 0;
  color: #606266;
}

.stations-preview {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.station-label {
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
}

.station-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.station-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #409EFF;
}

.stations-section h3 {
  margin: 20px 0;
  color: #303133;
}

.station-card {
  text-align: center;
  margin-bottom: 20px;
}

.station-icon {
  font-size: 32px;
  color: #409EFF;
  margin-bottom: 10px;
}

.station-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.station-address {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.station-coord {
  font-size: 12px;
  color: #909399;
}
</style>
