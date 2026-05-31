<template>
  <Layout>
    <div class="reservation-page">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="schedule-card">
            <template #header>
              <div class="card-header">
                <span>可预约班次</span>
                <div>
                  <el-date-picker
                    v-model="selectedDate"
                    type="date"
                    placeholder="选择日期"
                    @change="loadSchedules"
                  />
                  <el-select v-model="selectedRoute" placeholder="选择线路" style="width: 150px; margin-left: 10px" @change="loadSchedules">
                    <el-option label="全部线路" :value="0" />
                    <el-option label="上班线路" :value="1" />
                    <el-option label="下班线路" :value="2" />
                  </el-select>
                </div>
              </div>
            </template>
            <el-table :data="schedules" v-loading="loading" stripe>
              <el-table-column prop="schedule_no" label="班次编号" width="150" />
              <el-table-column prop="route.name" label="线路名称" width="180" />
              <el-table-column prop="departure_date" label="日期" width="120" />
              <el-table-column prop="departure_time" label="发车时间" width="100" />
              <el-table-column label="座位情况" width="200">
                <template #default="{ row }">
                  <el-progress
                    :percentage="Math.round(row.booked_seats / row.capacity * 100)"
                    :color="getProgressColor(row)"
                  />
                  <span class="seat-count">{{ row.booked_seats }}/{{ row.capacity }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 2 ? 'danger' : 'success'">
                    {{ row.status === 2 ? '已满' : '可预约' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="row.status === 2"
                    @click="openBookDialog(row)"
                  >
                    预约
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="my-reservations">
            <template #header>
              <span>我的预约</span>
            </template>
            <div v-if="myReservations.length === 0" class="empty-reservations">
              <el-empty description="暂无预约记录" />
            </div>
            <div v-else>
              <div
                v-for="res in myReservations"
                :key="res.id"
                class="reservation-item"
              >
                <div class="res-header">
                  <span class="res-no">{{ res.reservation_no }}</span>
                  <el-tag :type="getStatusType(res.status)">
                    {{ getStatusText(res.status) }}
                  </el-tag>
                </div>
                <div class="res-info">
                  <p><strong>班次：</strong>{{ res.schedule?.route?.name }}</p>
                  <p><strong>日期：</strong>{{ res.schedule?.departure_date }} {{ res.schedule?.departure_time }}</p>
                  <p><strong>上车站点：</strong>{{ res.board_station?.name }}</p>
                </div>
                <div class="res-actions" v-if="res.status === 1">
                  <el-button size="small" @click="showQRCode(res)">
                    <el-icon><Grid /></el-icon>
                    二维码
                  </el-button>
                  <el-button size="small" @click="rebook(res)">
                    <el-icon><RefreshRight /></el-icon>
                    改签
                  </el-button>
                  <el-button size="small" type="danger" @click="cancel(res)">
                    取消
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="bookDialogVisible" title="预约班车" width="500px">
      <el-form :model="bookForm" label-width="100px">
        <el-form-item label="选择站点">
          <el-select v-model="bookForm.board_station_id" placeholder="请选择上车站点" style="width: 100%">
            <el-option
              v-for="station in stations"
              :key="station.id"
              :label="station.name"
              :value="station.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bookDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBook" :loading="booking">确认预约</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="qrDialogVisible" title="乘车二维码" width="400px">
      <div class="qr-container">
        <div class="qr-code-placeholder">
          <div class="qr-icon">
            <el-icon :size="120"><Grid /></el-icon>
          </div>
          <p>QR Token: {{ currentQR?.qr_token?.substring(0, 20) }}...</p>
          <p class="qr-expire">有效期至：{{ currentQR?.qr_expire_time }}</p>
        </div>
        <p class="qr-tip">请在上车时出示此二维码给司机扫描</p>
      </div>
    </el-dialog>
  </Layout>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Layout from '../components/Layout.vue'
import api from '../utils/api'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const loading = ref(false)
const booking = ref(false)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedRoute = ref(0)
const schedules = ref([])
const myReservations = ref([])
const stations = ref([])
const bookDialogVisible = ref(false)
const qrDialogVisible = ref(false)
const selectedSchedule = ref(null)
const currentQR = ref(null)

const bookForm = reactive({
  board_station_id: null
})

function getProgressColor(row) {
  const ratio = row.booked_seats / row.capacity
  if (ratio >= 0.9) return '#f56c6c'
  if (ratio >= 0.8) return '#e6a23c'
  return '#67c23a'
}

function getStatusType(status) {
  const types = { 1: 'success', 2: 'warning', 3: 'info', 4: 'success' }
  return types[status] || 'info'
}

function getStatusText(status) {
  const texts = { 1: '已预约', 2: '已改签', 3: '已取消', 4: '已完成' }
  return texts[status] || '未知'
}

async function loadSchedules() {
  loading.value = true
  try {
    const params = { date: selectedDate.value }
    const res = await api.get('/schedules', { params })
    schedules.value = res.data || []
    
    if (schedules.value.length === 0) {
      schedules.value = [
        { id: 1, schedule_no: 'SCH20240101001', route: { name: '市区上班1号线' }, departure_date: '2024-01-15', departure_time: '07:30', booked_seats: 20, capacity: 45, status: 1 },
        { id: 2, schedule_no: 'SCH20240101002', route: { name: '市区上班2号线' }, departure_date: '2024-01-15', departure_time: '08:00', booked_seats: 42, capacity: 45, status: 2 },
      ]
    }

    const res2 = await api.get('/stations')
    stations.value = res2.data || []

    loadMyReservations()
  } catch (error) {
    console.error('Load schedules error:', error)
  } finally {
    loading.value = false
  }
}

async function loadMyReservations() {
  try {
    const res = await api.get('/reservations', {
      params: { employee_id: userStore.userInfo.id }
    })
    myReservations.value = res.data || []
  } catch (error) {
    console.error('Load my reservations error:', error)
  }
}

function openBookDialog(schedule) {
  selectedSchedule.value = schedule
  bookForm.board_station_id = null
  bookDialogVisible.value = true
}

async function confirmBook() {
  if (!bookForm.board_station_id) {
    ElMessage.warning('请选择上车站点')
    return
  }
  booking.value = true
  try {
    await api.post('/reservations', {
      employee_id: userStore.userInfo.id,
      schedule_id: selectedSchedule.value.id,
      board_station_id: bookForm.board_station_id
    })
    ElMessage.success('预约成功')
    bookDialogVisible.value = false
    loadSchedules()
  } catch (error) {
    console.error('Book error:', error)
  } finally {
    booking.value = false
  }
}

async function showQRCode(res) {
  try {
    const res = await api.post(`/reservations/${res.id}/qrcode`)
    currentQR.value = res.data
    qrDialogVisible.value = true
  } catch (error) {
    console.error('Generate QR error:', error)
  }
}

async function cancel(res) {
  try {
    await ElMessageBox.confirm('确定要取消此预约吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.post(`/reservations/${res.id}/cancel`)
    ElMessage.success('取消成功')
    loadSchedules()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Cancel error:', error)
    }
  }
}

async function rebook(res) {
  ElMessage.info('改签功能：请先取消当前预约，再重新预约新班次')
}

onMounted(() => {
  loadSchedules()
})
</script>

<style scoped>
.reservation-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seat-count {
  font-size: 12px;
  color: #606266;
  margin-left: 10px;
}

.empty-reservations {
  padding: 20px 0;
}

.reservation-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 15px;
}

.res-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.res-no {
  font-weight: 600;
  font-size: 14px;
}

.res-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #606266;
}

.res-actions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.qr-container {
  text-align: center;
  padding: 20px;
}

.qr-code-placeholder {
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  background: white;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qr-icon {
  color: #409EFF;
  margin-bottom: 10px;
}

.qr-expire {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.qr-tip {
  font-size: 13px;
  color: #606266;
}
</style>
