<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bay">
              <el-icon :size="30"><Location /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.bays.total }}</div>
              <div class="stat-label">打位总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon available">
              <el-icon :size="30"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.bays.available }}</div>
              <div class="stat-label">可用打位</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon coach">
              <el-icon :size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.coaches }}</div>
              <div class="stat-label">在职教练</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon equipment">
              <el-icon :size="30"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.equipment }}</div>
              <div class="stat-label">球具种类</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>打位状态一览</span>
            </div>
          </template>
          <div class="bay-map">
            <div v-for="floor in floors" :key="floor" class="floor-section">
              <div class="floor-title">
                <el-icon><OfficeBuilding /></el-icon>
                <span>{{ floor }}楼</span>
              </div>
              <el-row :gutter="10">
                <el-col 
                  v-for="bay in getBaysByFloor(floor)" 
                  :key="bay.id" 
                  :span="8"
                  class="mb-10"
                >
                  <div 
                    class="bay-item"
                    :class="bay.status"
                  >
                    <div class="bay-number">{{ bay.bay_number }}</div>
                    <div class="bay-type">{{ bayTypeText(bay.bay_type) }}</div>
                    <div class="bay-status">{{ bayStatusText(bay.status) }}</div>
                    <div class="bay-price">¥{{ bay.price_per_hour }}/小时</div>
                    <div v-if="bay.has_sensor" class="sensor-tag">
                      <el-icon><Connection /></el-icon>
                      有传感器
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>卡类型列表</span>
            </div>
          </template>
          <el-table :data="cardTypes" style="width: 100%" stripe>
            <el-table-column prop="card_name" label="卡名称" />
            <el-table-column prop="card_type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getCardTypeTag(row.card_type)">{{ getCardTypeText(row.card_type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="100">
              <template #default="{ row }">
                <span class="price">¥{{ row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="discount" label="折扣" width="100">
              <template #default="{ row }">
                {{ row.discount }}%
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>教练列表</span>
            </div>
          </template>
          <el-table :data="coaches" style="width: 100%" stripe>
            <el-table-column prop="coach_name" label="姓名" width="100" />
            <el-table-column prop="title" label="职称" width="120" />
            <el-table-column prop="specialty" label="专长" />
            <el-table-column prop="price_per_hour" label="课时费" width="100">
              <template #default="{ row }">
                <span class="price">¥{{ row.price_per_hour }}/h</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>球具列表</span>
            </div>
          </template>
          <el-table :data="equipment" style="width: 100%" stripe>
            <el-table-column prop="equipment_name" label="名称" />
            <el-table-column prop="category_name" label="分类" width="100" />
            <el-table-column prop="available_quantity" label="库存" width="80">
              <template #default="{ row }">
                <el-tag :type="row.available_quantity > 0 ? 'success' : 'danger'">
                  {{ row.available_quantity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="rental_price" label="租赁价" width="100">
              <template #default="{ row }">
                <span class="price">¥{{ row.rental_price }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import request from '../utils/request'

const bays = ref([])
const coaches = ref([])
const equipment = ref([])
const cardTypes = ref([])

const stats = ref({
  bays: { total: 0, available: 0 },
  coaches: 0,
  equipment: 0
})

const floors = computed(() => {
  const floorSet = new Set(bays.value.map(b => b.floor))
  return Array.from(floorSet).sort((a, b) => a - b)
})

const getBaysByFloor = (floor) => {
  return bays.value.filter(b => b.floor === floor)
}

const bayTypeText = (type) => {
  const map = { single: '单人打位', double: '双人打位', vip: 'VIP打位' }
  return map[type] || type
}

const bayStatusText = (status) => {
  const map = { available: '可用', occupied: '使用中', maintenance: '维护', disabled: '禁用' }
  return map[status] || status
}

const getCardTypeText = (type) => {
  const map = { monthly: '月卡', duration: '时长卡', stored: '储值卡' }
  return map[type] || type
}

const getCardTypeTag = (type) => {
  const map = { monthly: 'primary', duration: 'success', stored: 'warning' }
  return map[type] || 'info'
}

const loadData = async () => {
  try {
    const [baysRes, coachesRes, equipRes, cardsRes] = await Promise.all([
      request.get('/bays'),
      request.get('/coaches'),
      request.get('/equipment'),
      request.get('/card-types')
    ])
    
    bays.value = baysRes.data || []
    coaches.value = coachesRes.data || []
    equipment.value = equipRes.data || []
    cardTypes.value = cardsRes.data || []
    
    stats.value = {
      bays: {
        total: bays.value.length,
        available: bays.value.filter(b => b.status === 'available').length
      },
      coaches: coaches.value.length,
      equipment: equipment.value.length
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.bay {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.available {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.coach {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.equipment {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  font-size: 16px;
  font-weight: 500;
}

.mt-20 {
  margin-top: 20px;
}

.mb-10 {
  margin-bottom: 10px;
}

.bay-map {
  max-height: 400px;
  overflow-y: auto;
}

.floor-section {
  margin-bottom: 20px;
}

.floor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  font-weight: 500;
}

.bay-item {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.bay-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bay-item.available {
  background: #f0f9eb;
  border-color: #67c23a;
}

.bay-item.occupied {
  background: #fef0f0;
  border-color: #f56c6c;
}

.bay-item.maintenance {
  background: #fdf6ec;
  border-color: #e6a23c;
}

.bay-item.disabled {
  background: #f4f4f5;
  border-color: #c0c4cc;
}

.bay-number {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.bay-type {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.bay-status {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.bay-price {
  font-size: 12px;
  color: #409eff;
  margin-top: 4px;
  font-weight: 500;
}

.sensor-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 2px 6px;
  background: #e6f7ff;
  color: #1890ff;
  font-size: 11px;
  border-radius: 4px;
}

.price {
  color: #f56c6c;
  font-weight: 500;
}
</style>
