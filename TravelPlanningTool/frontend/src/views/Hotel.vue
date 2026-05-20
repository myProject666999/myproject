<template>
  <div class="hotel-page">
    <div class="page-header">
      <h2>住宿管理</h2>
      <div class="header-actions">
        <el-select v-model="selectedTripId" placeholder="选择行程" style="width: 200px" @change="loadHotels">
          <el-option v-for="trip in trips" :key="trip.id" :label="trip.name" :value="trip.id" />
        </el-select>
        <el-button type="primary" @click="openHotelDialog(null)">
          <el-icon><Plus /></el-icon>
          添加酒店
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="hotel in hotels" :key="hotel.id">
        <el-card class="hotel-card">
          <template #header>
            <div class="card-header">
              <span class="hotel-name">{{ hotel.name }}</span>
              <el-tag type="success">¥{{ hotel.pricePerNight }}/晚</el-tag>
            </div>
          </template>
          <div class="hotel-info">
            <p><el-icon><Location /></el-icon> {{ hotel.address }}</p>
            <p><el-icon><Calendar /></el-icon> {{ formatDate(hotel.checkInDate) }} 至 {{ formatDate(hotel.checkOutDate) }}</p>
            <p><el-icon><Clock /></el-icon> 共 {{ getNights(hotel) }} 晚</p>
            <p><el-icon><Phone /></el-icon> {{ hotel.phone || '暂无' }}</p>
            <p v-if="hotel.remark" class="remark"><el-icon><Document /></el-icon> {{ hotel.remark }}</p>
          </div>
          <div class="hotel-footer">
            <div class="total-price">
              总计: <span class="price">¥{{ hotel.totalPrice }}</span>
            </div>
            <div class="actions">
              <el-button size="small" @click="openHotelDialog(hotel)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteHotel(hotel)">删除</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="hotels.length === 0" description="暂无酒店信息" />

    <el-dialog v-model="hotelDialogVisible" :title="isEdit ? '编辑酒店' : '添加酒店'" width="500px">
      <el-form :model="hotelForm" label-width="80px">
        <el-form-item label="酒店名称">
          <el-input v-model="hotelForm.name" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="hotelForm.address" />
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度">
              <el-input v-model="hotelForm.longitude" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度">
              <el-input v-model="hotelForm.latitude" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="入住日期">
              <el-date-picker v-model="hotelForm.checkInDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退房日期">
              <el-date-picker v-model="hotelForm.checkOutDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="每晚价格">
          <el-input-number v-model="hotelForm.pricePerNight" :min="0" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="hotelForm.phone" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="hotelForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="hotelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveHotel">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tripApi, hotelApi } from '@/api'

const trips = ref([])
const hotels = ref([])
const selectedTripId = ref(null)

const hotelDialogVisible = ref(false)
const isEdit = ref(false)
const currentHotelId = ref(null)
const hotelForm = ref({
  name: '',
  address: '',
  longitude: null,
  latitude: null,
  checkInDate: '',
  checkOutDate: '',
  pricePerNight: 0,
  phone: '',
  remark: ''
})

const loadTrips = async () => {
  try {
    const data = await tripApi.list()
    trips.value = data
    if (data.length > 0) {
      selectedTripId.value = data[0].id
      loadHotels()
    }
  } catch (error) {
    ElMessage.error('加载行程列表失败')
  }
}

const loadHotels = async () => {
  if (!selectedTripId.value) return
  try {
    const data = await hotelApi.list(selectedTripId.value)
    hotels.value = data
  } catch (error) {
    ElMessage.error('加载酒店失败')
  }
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('zh-CN') : ''
}

const getNights = (hotel) => {
  if (!hotel.checkInDate || !hotel.checkOutDate) return 0
  const start = new Date(hotel.checkInDate)
  const end = new Date(hotel.checkOutDate)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
}

const openHotelDialog = (hotel) => {
  isEdit.value = !!hotel
  currentHotelId.value = hotel?.id || null
  hotelForm.value = hotel ? { ...hotel } : {
    name: '',
    address: '',
    longitude: null,
    latitude: null,
    checkInDate: '',
    checkOutDate: '',
    pricePerNight: 0,
    phone: '',
    remark: ''
  }
  hotelDialogVisible.value = true
}

const saveHotel = async () => {
  try {
    const nights = getNights(hotelForm.value)
    const totalPrice = hotelForm.value.pricePerNight * nights
    const data = { ...hotelForm.value, tripId: selectedTripId.value, totalPrice }
    if (isEdit.value) {
      await hotelApi.update(currentHotelId.value, data)
      ElMessage.success('更新成功')
    } else {
      await hotelApi.create(data)
      ElMessage.success('创建成功')
    }
    hotelDialogVisible.value = false
    loadHotels()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteHotel = async (hotel) => {
  try {
    await ElMessageBox.confirm('确定要删除这个酒店吗？', '提示', { type: 'warning' })
    await hotelApi.delete(hotel.id)
    ElMessage.success('删除成功')
    loadHotels()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadTrips()
})
</script>

<style scoped>
.hotel-page {
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

.hotel-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hotel-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.hotel-info p {
  margin: 8px 0;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hotel-info .remark {
  color: #909399;
  font-size: 14px;
}

.hotel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.total-price {
  font-size: 16px;
  color: #606266;
}

.total-price .price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 20px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
