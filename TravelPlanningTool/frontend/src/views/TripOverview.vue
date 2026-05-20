<template>
  <div class="trip-overview">
    <div class="page-header">
      <h2>行程总览</h2>
      <el-button type="primary" @click="openTripDialog(null)">
        <el-icon><Plus /></el-icon>
        新建行程
      </el-button>
    </div>

    <el-row :gutter="20" class="trip-list">
      <el-col :span="8" v-for="trip in trips" :key="trip.id">
        <el-card class="trip-card" @click="selectTrip(trip)">
          <template #header>
            <div class="card-header">
              <span class="trip-name">{{ trip.name }}</span>
              <el-tag type="success">{{ trip.destination }}</el-tag>
            </div>
          </template>
          <div class="trip-info">
            <p><el-icon><Calendar /></el-icon> {{ formatDate(trip.startDate) }} 至 {{ formatDate(trip.endDate) }}</p>
            <p><el-icon><Coin /></el-icon> 总预算: ¥{{ trip.totalBudget }}</p>
            <p class="desc">{{ trip.description }}</p>
          </div>
          <div class="trip-days">
            <span class="days-badge">{{ getDays(trip) }} 天</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="trips.length === 0" description="暂无行程，点击右上角新建行程" />

    <el-dialog v-model="tripDialogVisible" :title="isEdit ? '编辑行程' : '新建行程'" width="500px">
      <el-form :model="tripForm" label-width="80px">
        <el-form-item label="行程名称">
          <el-input v-model="tripForm.name" placeholder="请输入行程名称" />
        </el-form-item>
        <el-form-item label="目的地">
          <el-input v-model="tripForm.destination" placeholder="请输入目的地" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="tripForm.startDate" type="date" placeholder="选择开始日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="tripForm.endDate" type="date" placeholder="选择结束日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="总预算">
          <el-input-number v-model="tripForm.totalBudget" :min="0" :step="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="tripForm.description" type="textarea" :rows="3" placeholder="请输入行程描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tripDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTrip">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tripApi } from '@/api'

const trips = ref([])
const tripDialogVisible = ref(false)
const isEdit = ref(false)
const currentTripId = ref(null)
const selectedTrip = ref(null)

const tripForm = ref({
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
  totalBudget: 0,
  description: ''
})

const loadTrips = async () => {
  try {
    const data = await tripApi.list()
    trips.value = data
    if (data.length > 0 && !selectedTrip.value) {
      selectedTrip.value = data[0]
    }
  } catch (error) {
    ElMessage.error('加载行程列表失败')
  }
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('zh-CN') : ''
}

const getDays = (trip) => {
  if (!trip.startDate || !trip.endDate) return 0
  const start = new Date(trip.startDate)
  const end = new Date(trip.endDate)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
}

const selectTrip = (trip) => {
  selectedTrip.value = trip
}

const openTripDialog = (trip) => {
  isEdit.value = !!trip
  currentTripId.value = trip?.id || null
  tripForm.value = trip ? { ...trip } : {
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    totalBudget: 0,
    description: ''
  }
  tripDialogVisible.value = true
}

const saveTrip = async () => {
  try {
    if (isEdit.value) {
      await tripApi.update(currentTripId.value, tripForm.value)
      ElMessage.success('更新成功')
    } else {
      await tripApi.create(tripForm.value)
      ElMessage.success('创建成功')
    }
    tripDialogVisible.value = false
    loadTrips()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteTrip = async (trip) => {
  try {
    await ElMessageBox.confirm('确定要删除这个行程吗？', '提示', {
      type: 'warning'
    })
    await tripApi.delete(trip.id)
    ElMessage.success('删除成功')
    loadTrips()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadTrips()
})
</script>

<style scoped>
.trip-overview {
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

.trip-list {
  margin-bottom: 30px;
}

.trip-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.trip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trip-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.trip-info p {
  margin: 8px 0;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-info .desc {
  color: #909399;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.trip-days {
  position: absolute;
  top: 50px;
  right: 20px;
}

.days-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
}
</style>
