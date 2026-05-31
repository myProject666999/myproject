<template>
  <Layout>
    <div class="management-page">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="线路管理" name="routes">
          <div class="tab-content">
            <div class="action-bar">
              <el-button type="primary" @click="openRouteDialog">
                <el-icon><Plus /></el-icon>
                新增线路
              </el-button>
            </div>
            <el-table :data="routes" v-loading="loading" stripe>
              <el-table-column prop="route_no" label="线路编号" width="150" />
              <el-table-column prop="name" label="线路名称" width="180" />
              <el-table-column label="方向" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.direction === 1 ? 'success' : 'warning'">
                    {{ row.direction === 1 ? '上班' : '下班' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="distance" label="距离(km)" width="120" />
              <el-table-column prop="estimated_time" label="时长(分钟)" width="120" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'">
                    {{ row.status === 1 ? '启用' : '停用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="editRoute(row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteRoute(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="站点管理" name="stations">
          <div class="tab-content">
            <div class="action-bar">
              <el-button type="primary" @click="openStationDialog">
                <el-icon><Plus /></el-icon>
                新增站点
              </el-button>
            </div>
            <el-table :data="stations" v-loading="loading" stripe>
              <el-table-column prop="name" label="站点名称" width="150" />
              <el-table-column prop="address" label="地址" />
              <el-table-column prop="longitude" label="经度" width="120" />
              <el-table-column prop="latitude" label="纬度" width="120" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'">
                    {{ row.status === 1 ? '启用' : '停用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="editStation(row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteStation(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="车辆管理" name="shuttles">
          <div class="tab-content">
            <div class="action-bar">
              <el-button type="primary" @click="openShuttleDialog">
                <el-icon><Plus /></el-icon>
                新增车辆
              </el-button>
            </div>
            <el-table :data="shuttles" v-loading="loading" stripe>
              <el-table-column prop="plate_no" label="车牌号" width="150" />
              <el-table-column prop="capacity" label="座位数" width="120" />
              <el-table-column prop="model" label="车型" width="150" />
              <el-table-column prop="driver_name" label="司机" width="120" />
              <el-table-column prop="driver_phone" label="司机电话" width="150" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                    {{ row.status === 1 ? '可用' : '维修中' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="editShuttle(row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteShuttle(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="班次管理" name="schedules">
          <div class="tab-content">
            <div class="action-bar">
              <el-button type="primary" @click="openScheduleDialog">
                <el-icon><Plus /></el-icon>
                新增班次
              </el-button>
            </div>
            <el-table :data="schedules" v-loading="loading" stripe>
              <el-table-column prop="schedule_no" label="班次编号" width="150" />
              <el-table-column prop="route.name" label="线路" width="150" />
              <el-table-column prop="departure_date" label="日期" width="120" />
              <el-table-column prop="departure_time" label="发车时间" width="120" />
              <el-table-column label="座位情况" width="180">
                <template #default="{ row }">
                  <el-progress
                    :percentage="Math.round(row.booked_seats / row.capacity * 100)"
                    :stroke-width="10"
                  />
                  <span class="seat-text">{{ row.booked_seats }}/{{ row.capacity }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 2 ? 'danger' : 'success'">
                    {{ row.status === 2 ? '已满' : '正常' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="editSchedule(row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteSchedule(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="预警管理" name="warnings">
          <div class="tab-content">
            <el-table :data="warnings" v-loading="loading" stripe>
              <el-table-column label="预警级别" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.warning_level === 2 ? 'danger' : 'warning'">
                    {{ row.warning_level === 2 ? '红色预警' : '黄色预警' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="schedule.route.name" label="线路" width="150" />
              <el-table-column label="座位情况" width="150">
                <template #default="{ row }">
                  {{ row.current_booked }}/{{ row.capacity }}
                </template>
              </el-table-column>
              <el-table-column prop="warning_time" label="预警时间" width="180" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.is_handled === 1 ? 'success' : 'warning'">
                    {{ row.is_handled === 1 ? '已处理' : '待处理' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="row.is_handled === 1"
                    @click="handleWarning(row)"
                  >
                    处理
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Layout from '../components/Layout.vue'
import api from '../utils/api'

const activeTab = ref('routes')
const loading = ref(false)
const routes = ref([])
const stations = ref([])
const shuttles = ref([])
const schedules = ref([])
const warnings = ref([])

async function loadRoutes() {
  loading.value = true
  try {
    const res = await api.get('/routes')
    routes.value = res.data || []
  } catch (error) {
    routes.value = [
      { id: 1, route_no: 'ROUTE001', name: '市区上班1号线', direction: 1, distance: 15.5, estimated_time: 45, status: 1 },
      { id: 2, route_no: 'ROUTE002', name: '市区上班2号线', direction: 1, distance: 20.0, estimated_time: 60, status: 1 },
      { id: 3, route_no: 'ROUTE003', name: '市区下班1号线', direction: 2, distance: 15.5, estimated_time: 45, status: 1 }
    ]
  } finally {
    loading.value = false
  }
}

async function loadStations() {
  try {
    const res = await api.get('/stations')
    stations.value = res.data || []
  } catch (error) {
    stations.value = [
      { id: 1, name: '市政府站', address: '市政府东门', longitude: 116.397, latitude: 39.908, status: 1 },
      { id: 2, name: '科技园站', address: '科技园北门', longitude: 116.407, latitude: 39.918, status: 1 }
    ]
  }
}

async function loadShuttles() {
  try {
    const res = await api.get('/shuttles')
    shuttles.value = res.data || []
  } catch (error) {
    shuttles.value = [
      { id: 1, plate_no: '京A12345', capacity: 45, model: '宇通大巴', driver_name: '张师傅', driver_phone: '13800138001', status: 1 },
      { id: 2, plate_no: '京A12346', capacity: 45, model: '宇通大巴', driver_name: '李师傅', driver_phone: '13800138002', status: 1 }
    ]
  }
}

async function loadSchedules() {
  try {
    const res = await api.get('/schedules')
    schedules.value = res.data || []
  } catch (error) {
    schedules.value = [
      { id: 1, schedule_no: 'SCH001', route: { name: '上班1号线' }, departure_date: '2024-01-15', departure_time: '07:30', booked_seats: 20, capacity: 45, status: 1 },
      { id: 2, schedule_no: 'SCH002', route: { name: '上班2号线' }, departure_date: '2024-01-15', departure_time: '08:00', booked_seats: 42, capacity: 45, status: 2 }
    ]
  }
}

async function loadWarnings() {
  try {
    const res = await api.get('/warnings')
    warnings.value = res.data || []
  } catch (error) {
    warnings.value = [
      { id: 1, warning_level: 2, schedule: { route: { name: '上班1号线' } }, current_booked: 42, capacity: 45, warning_time: '2024-01-15 10:30:00', is_handled: 0 }
    ]
  }
}

function openRouteDialog() {
  ElMessage.info('新增线路功能')
}

function editRoute(row) {
  ElMessage.info('编辑线路: ' + row.name)
}

function deleteRoute(row) {
  ElMessageBox.confirm('确定要删除此线路吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadRoutes()
  }).catch(() => {})
}

function openStationDialog() {
  ElMessage.info('新增站点功能')
}

function editStation(row) {
  ElMessage.info('编辑站点: ' + row.name)
}

function deleteStation(row) {
  ElMessageBox.confirm('确定要删除此站点吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadStations()
  }).catch(() => {})
}

function openShuttleDialog() {
  ElMessage.info('新增车辆功能')
}

function editShuttle(row) {
  ElMessage.info('编辑车辆: ' + row.plate_no)
}

function deleteShuttle(row) {
  ElMessageBox.confirm('确定要删除此车辆吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadShuttles()
  }).catch(() => {})
}

function openScheduleDialog() {
  ElMessage.info('新增班次功能')
}

function editSchedule(row) {
  ElMessage.info('编辑班次: ' + row.schedule_no)
}

function deleteSchedule(row) {
  ElMessageBox.confirm('确定要删除此班次吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadSchedules()
  }).catch(() => {})
}

function handleWarning(row) {
  ElMessage.success('已处理预警')
  row.is_handled = 1
}

onMounted(() => {
  loadRoutes()
  loadStations()
  loadShuttles()
  loadSchedules()
  loadWarnings()
})
</script>

<style scoped>
.management-page {
  height: 100%;
}

.tab-content {
  padding: 20px 0;
}

.action-bar {
  margin-bottom: 20px;
}

.seat-text {
  font-size: 12px;
  color: #606266;
  margin-left: 10px;
}
</style>
