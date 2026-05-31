<template>
  <div class="stall-map-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Stall Selection - {{ eventTitle }}</span>
          <el-button @click="goBack">Back</el-button>
        </div>
      </template>
      <div class="map-legend">
        <span class="legend-item"><span class="legend-color available"></span> Available</span>
        <span class="legend-item"><span class="legend-color locked"></span> Locked</span>
        <span class="legend-item"><span class="legend-color occupied"></span> Occupied</span>
      </div>
      <div class="zones-container">
        <div v-for="zone in zones" :key="zone.name" class="zone-section">
          <h3>{{ zone.name }}</h3>
          <div class="stall-grid">
            <div
              v-for="stall in zone.stalls"
              :key="stall.id"
              class="stall-item"
              :class="[
                stall.status,
                { selected: selectedStall?.id === stall.id }
              ]"
              @click="handleStallClick(stall)"
            >
              <span class="stall-code">{{ stall.stallCode }}</span>
              <span class="stall-price">¥{{ stall.price }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-drawer v-model="showStallInfo" title="Stall Information" direction="rtl" size="400">
        <div v-if="selectedStall" class="stall-info-content">
          <p><strong>Stall Code:</strong> {{ selectedStall.stallCode }}</p>
          <p><strong>Zone:</strong> {{ selectedStall.zoneName }}</p>
          <p><strong>Price:</strong> ¥{{ selectedStall.price }}</p>
          <p><strong>Size:</strong> {{ selectedStall.size || '3x3m' }}</p>
          <p><strong>Facilities:</strong></p>
          <div class="facilities">
            <el-tag v-for="facility in selectedStall.facilities || ['Power', 'Water']" :key="facility" type="info" style="margin: 5px">{{ facility }}</el-tag>
          </div>
          <div class="stall-actions">
            <el-button type="primary" @click="confirmSelection" :loading="selecting" :disabled="selectedStall.status !== 'AVAILABLE'">
              Confirm Selection
            </el-button>
            <el-button @click="showStallInfo = false">Close</el-button>
          </div>
        </div>
      </el-drawer>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStallMap } from '@/api/stall'
import { selectStall } from '@/api/stallSelection'

const router = useRouter()
const route = useRoute()
const selecting = ref(false)
const showStallInfo = ref(false)
const selectedStall = ref(null)
const eventTitle = ref('')
const zones = ref([])

const fetchStallMap = async () => {
  const eventId = route.params.eventId
  if (!eventId) return
  try {
    const res = await getStallMap(eventId)
    eventTitle.value = res.data.eventTitle || 'Event'
    if (res.data.zones && res.data.zones.length > 0) {
      zones.value = res.data.zones
    } else {
      zones.value = generateMockZones()
    }
  } catch (err) {
    zones.value = generateMockZones()
  }
}

const generateMockZones = () => {
  const statuses = ['AVAILABLE', 'LOCKED', 'OCCUPIED']
  return [
    {
      name: 'Zone A',
      stalls: Array.from({ length: 12 }, (_, i) => ({
        id: `A${i + 1}`,
        stallCode: `A-${String(i + 1).padStart(2, '0')}`,
        zoneName: 'Zone A',
        price: 500 + Math.floor(Math.random() * 500),
        status: statuses[Math.floor(Math.random() * 3)],
        size: '3x3m',
        facilities: ['Power', 'Water']
      }))
    },
    {
      name: 'Zone B',
      stalls: Array.from({ length: 12 }, (_, i) => ({
        id: `B${i + 1}`,
        stallCode: `B-${String(i + 1).padStart(2, '0')}`,
        zoneName: 'Zone B',
        price: 800 + Math.floor(Math.random() * 500),
        status: statuses[Math.floor(Math.random() * 3)],
        size: '3x3m',
        facilities: ['Power', 'Water', 'Lighting']
      }))
    },
    {
      name: 'Zone C',
      stalls: Array.from({ length: 8 }, (_, i) => ({
        id: `C${i + 1}`,
        stallCode: `C-${String(i + 1).padStart(2, '0')}`,
        zoneName: 'Zone C',
        price: 1000 + Math.floor(Math.random() * 500),
        status: statuses[Math.floor(Math.random() * 3)],
        size: '4x4m',
        facilities: ['Power', 'Water', 'Lighting', 'Shelter']
      }))
    }
  ]
}

const handleStallClick = (stall) => {
  selectedStall.value = stall
  showStallInfo.value = true
}

const confirmSelection = async () => {
  if (!selectedStall.value) return
  selecting.value = true
  try {
    await selectStall({
      eventId: route.params.eventId,
      stallId: selectedStall.value.id
    })
    ElMessage.success('Stall selected successfully!')
    showStallInfo.value = false
    fetchStallMap()
  } catch (err) {
    ElMessage.error(err.message || 'Failed to select stall')
  } finally {
    selecting.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchStallMap()
})
</script>

<style scoped>
.stall-map-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.available {
  background: #67c23a;
}

.legend-color.locked {
  background: #e6a23c;
}

.legend-color.occupied {
  background: #f56c6c;
}

.zones-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.zone-section h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
}

.stall-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.stall-item {
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  padding: 15px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.stall-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stall-item.AVAILABLE {
  border-color: #67c23a;
  background: #f0f9eb;
}

.stall-item.LOCKED {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.stall-item.OCCUPIED {
  border-color: #f56c6c;
  background: #fef0f0;
  cursor: not-allowed;
}

.stall-item.selected {
  box-shadow: 0 0 0 3px #409eff;
  transform: scale(1.05);
}

.stall-code {
  display: block;
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.stall-price {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.stall-info-content p {
  margin: 15px 0;
  color: #606266;
}

.facilities {
  margin: 10px 0;
}

.stall-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}
</style>
