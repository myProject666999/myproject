<template>
  <div class="daily-schedule">
    <div class="page-header">
      <h2>每日详情</h2>
      <div class="header-actions">
        <el-select v-model="selectedTripId" placeholder="选择行程" style="width: 200px" @change="loadSchedules">
          <el-option v-for="trip in trips" :key="trip.id" :label="trip.name" :value="trip.id" />
        </el-select>
        <el-button type="primary" @click="openScheduleDialog(null)">
          <el-icon><Plus /></el-icon>
          添加日程
        </el-button>
      </div>
    </div>

    <el-timeline v-if="schedules.length > 0">
      <el-timeline-item
        v-for="schedule in schedules"
        :key="schedule.id"
        :timestamp="formatDate(schedule.date)"
        placement="top"
      >
        <el-card class="schedule-card">
          <template #header>
            <div class="card-header">
              <div class="day-title">
                <el-tag type="primary" size="large">第 {{ schedule.dayNumber }} 天</el-tag>
                <span class="date-text">{{ formatDate(schedule.date) }}</span>
              </div>
              <div class="card-actions">
                <el-button size="small" @click="openScheduleDialog(schedule)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteSchedule(schedule)">删除</el-button>
              </div>
            </div>
          </template>
          
          <p class="schedule-desc">{{ schedule.description }}</p>
          
          <div class="attractions-section" v-if="schedule.attractions?.length > 0">
            <h4>景点安排</h4>
            <div class="attraction-list">
              <div class="attraction-item" v-for="attraction in schedule.attractions" :key="attraction.id">
                <div class="attraction-info">
                  <el-icon class="attraction-icon"><Location /></el-icon>
                  <div class="attraction-details">
                    <h5>{{ attraction.name }}</h5>
                    <p>{{ attraction.address }}</p>
                    <p v-if="attraction.visitTime">
                      <el-icon><Clock /></el-icon>
                      {{ attraction.visitTime }} · 停留 {{ attraction.duration }} 分钟
                    </p>
                  </div>
                </div>
                <div class="attraction-cost">
                  <span class="cost-text" v-if="attraction.cost > 0">¥{{ attraction.cost }}</span>
                  <span class="free-text" v-else>免费</span>
                </div>
                <el-button size="small" @click="openMap(attraction)">查看地图</el-button>
              </div>
            </div>
          </div>

          <div class="add-attraction">
            <el-button type="success" size="small" @click="openAttractionDialog(schedule.id, null)">
              <el-icon><Plus /></el-icon>
              添加景点
            </el-button>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <el-empty v-else description="暂无日程安排" />

    <el-dialog v-model="scheduleDialogVisible" :title="isScheduleEdit ? '编辑日程' : '添加日程'" width="500px">
      <el-form :model="scheduleForm" label-width="80px">
        <el-form-item label="第几天">
          <el-input-number v-model="scheduleForm.dayNumber" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="scheduleForm.date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="scheduleForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSchedule">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="attractionDialogVisible" :title="isAttractionEdit ? '编辑景点' : '添加景点'" width="500px">
      <el-form :model="attractionForm" label-width="80px">
        <el-form-item label="景点名称">
          <el-input v-model="attractionForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="attractionForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="attractionForm.address" />
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度">
              <el-input v-model="attractionForm.longitude" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度">
              <el-input v-model="attractionForm.latitude" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="参观时间">
              <el-time-picker v-model="attractionForm.visitTime" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="停留时长">
              <el-input-number v-model="attractionForm.duration" :min="0" placeholder="分钟" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="费用">
          <el-input-number v-model="attractionForm.cost" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="attractionForm.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="attractionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAttraction">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="mapDialogVisible" title="地图位置" width="800px" @opened="onMapDialogOpened">
      <el-alert
        v-if="!isAmapLoaded"
        title="地图未加载"
        type="warning"
        :closable="false"
        style="margin-bottom: 15px"
      >
        <template #default>
          <p>请在 <code>frontend/index.html</code> 中配置高德地图 API Key</p>
          <p>1. 访问 <a href="https://lbs.amap.com/" target="_blank">https://lbs.amap.com/</a> 注册账号</p>
          <p>2. 创建应用，获取 Web 端 (JS API) Key</p>
          <p>3. 替换 index.html 中的 <code>YOUR_AMAP_KEY</code></p>
        </template>
      </el-alert>
      <div id="map-container" style="width: 100%; height: 400px; background: #f5f5f5; border: 1px solid #ebeef5; border-radius: 4px;"></div>
      <div v-if="isAmapLoaded && currentAttraction" style="margin-top: 10px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
        <p><strong>{{ currentAttraction.name }}</strong></p>
        <p>地址: {{ currentAttraction.address || '暂无' }}</p>
        <p>坐标: {{ currentAttraction.longitude }}, {{ currentAttraction.latitude }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tripApi, dailyScheduleApi, attractionApi } from '@/api'

const trips = ref([])
const schedules = ref([])
const selectedTripId = ref(null)

const scheduleDialogVisible = ref(false)
const isScheduleEdit = ref(false)
const currentScheduleId = ref(null)
const scheduleForm = ref({
  dayNumber: 1,
  date: '',
  description: ''
})

const attractionDialogVisible = ref(false)
const isAttractionEdit = ref(false)
const currentScheduleIdForAttraction = ref(null)
const currentAttractionId = ref(null)
const attractionForm = ref({
  name: '',
  description: '',
  address: '',
  longitude: null,
  latitude: null,
  visitTime: null,
  duration: null,
  cost: 0,
  sortOrder: 0
})

const mapDialogVisible = ref(false)
const currentAttraction = ref(null)
const isAmapLoaded = ref(typeof AMap !== 'undefined')

const loadTrips = async () => {
  try {
    const data = await tripApi.list()
    trips.value = data
    if (data.length > 0) {
      selectedTripId.value = data[0].id
      loadSchedules()
    }
  } catch (error) {
    ElMessage.error('加载行程列表失败')
  }
}

const loadSchedules = async () => {
  if (!selectedTripId.value) return
  try {
    const data = await dailyScheduleApi.list(selectedTripId.value)
    schedules.value = data
    for (const schedule of schedules.value) {
      const attractions = await attractionApi.list(schedule.id)
      schedule.attractions = attractions
    }
  } catch (error) {
    ElMessage.error('加载日程失败')
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
}

const openScheduleDialog = (schedule) => {
  isScheduleEdit.value = !!schedule
  currentScheduleId.value = schedule?.id || null
  scheduleForm.value = schedule ? { ...schedule } : {
    dayNumber: 1,
    date: '',
    description: ''
  }
  scheduleDialogVisible.value = true
}

const saveSchedule = async () => {
  try {
    const data = { ...scheduleForm.value, tripId: selectedTripId.value }
    if (isScheduleEdit.value) {
      await dailyScheduleApi.update(currentScheduleId.value, data)
      ElMessage.success('更新成功')
    } else {
      await dailyScheduleApi.create(data)
      ElMessage.success('创建成功')
    }
    scheduleDialogVisible.value = false
    loadSchedules()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteSchedule = async (schedule) => {
  try {
    await ElMessageBox.confirm('确定要删除这个日程吗？', '提示', { type: 'warning' })
    await dailyScheduleApi.delete(schedule.id)
    ElMessage.success('删除成功')
    loadSchedules()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const openAttractionDialog = (scheduleId, attraction) => {
  isAttractionEdit.value = !!attraction
  currentScheduleIdForAttraction.value = scheduleId
  currentAttractionId.value = attraction?.id || null
  
  if (attraction) {
    attractionForm.value = {
      ...attraction,
      visitTime: parseTime(attraction.visitTime)
    }
  } else {
    attractionForm.value = {
      name: '',
      description: '',
      address: '',
      longitude: null,
      latitude: null,
      visitTime: null,
      duration: null,
      cost: 0,
      sortOrder: 0
    }
  }
  attractionDialogVisible.value = true
}

const parseTime = (timeStr) => {
  if (!timeStr) return null
  if (timeStr instanceof Date) return timeStr
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    const d = new Date()
    d.setHours(parseInt(parts[0]), parseInt(parts[1]), parts[2] ? parseInt(parts[2]) : 0)
    return d
  }
  return null
}

const formatTime = (date) => {
  if (!date) return null
  if (typeof date === 'string') return date
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const saveAttraction = async () => {
  try {
    const formData = { ...attractionForm.value }
    formData.visitTime = formatTime(formData.visitTime)
    
    if (formData.longitude !== null && formData.longitude !== undefined) {
      formData.longitude = Number(formData.longitude)
    }
    if (formData.latitude !== null && formData.latitude !== undefined) {
      formData.latitude = Number(formData.latitude)
    }
    
    const data = { ...formData, dailyScheduleId: currentScheduleIdForAttraction.value }
    
    if (isAttractionEdit.value) {
      await attractionApi.update(currentAttractionId.value, data)
      ElMessage.success('更新成功')
    } else {
      await attractionApi.create(data)
      ElMessage.success('创建成功')
    }
    attractionDialogVisible.value = false
    loadSchedules()
  } catch (error) {
    console.error('保存景点错误:', error)
    ElMessage.error('保存失败: ' + (error.response?.data?.message || error.message))
  }
}

const openMap = (attraction) => {
  currentAttraction.value = attraction
  isAmapLoaded.value = typeof AMap !== 'undefined'
  
  if (!isAmapLoaded.value) {
    ElMessage.warning('高德地图 API 未加载，请先配置 API Key')
  }
  
  mapDialogVisible.value = true
}

const onMapDialogOpened = () => {
  if (isAmapLoaded.value && currentAttraction.value) {
    nextTick(() => {
      initMap(currentAttraction.value)
    })
  }
}

const initMap = (attraction) => {
  try {
    if (typeof AMap === 'undefined') {
      ElMessage.error('高德地图 API 未加载')
      return
    }
    
    const container = document.getElementById('map-container')
    if (!container) {
      ElMessage.error('地图容器未找到')
      return
    }
    
    const longitude = attraction.longitude ? Number(attraction.longitude) : 116.397428
    const latitude = attraction.latitude ? Number(attraction.latitude) : 39.90923
    
    const map = new AMap.Map('map-container', {
      zoom: 15,
      center: [longitude, latitude]
    })
    
    if (attraction.longitude && attraction.latitude) {
      new AMap.Marker({
        position: [longitude, latitude],
        title: attraction.name,
        map: map
      })
    }
    
    ElMessage.success('地图加载成功')
  } catch (error) {
    console.error('地图初始化错误:', error)
    ElMessage.error('地图加载失败: ' + error.message)
  }
}

onMounted(() => {
  loadTrips()
})
</script>

<style scoped>
.daily-schedule {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.schedule-card {
  margin-bottom: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.date-text {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.schedule-desc {
  color: #606266;
  margin: 10px 0;
}

.attractions-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.attractions-section h4 {
  margin-bottom: 15px;
  color: #303133;
}

.attraction-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attraction-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  gap: 15px;
}

.attraction-info {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.attraction-icon {
  font-size: 24px;
  color: #409eff;
  margin-top: 4px;
}

.attraction-details h5 {
  margin: 0 0 5px 0;
  color: #303133;
}

.attraction-details p {
  margin: 3px 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.attraction-cost {
  margin-right: 10px;
}

.cost-text {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.free-text {
  color: #67c23a;
  font-weight: bold;
}

.add-attraction {
  margin-top: 15px;
  text-align: center;
}
</style>
