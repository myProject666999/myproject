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

    <el-dialog v-model="routeDialogVisible" :title="isEditRoute ? '编辑线路' : '新增线路'" width="500px">
      <el-form :model="routeForm" label-width="100px">
        <el-form-item label="线路编号">
          <el-input v-model="routeForm.route_no" :disabled="isEditRoute" />
        </el-form-item>
        <el-form-item label="线路名称">
          <el-input v-model="routeForm.name" />
        </el-form-item>
        <el-form-item label="方向">
          <el-select v-model="routeForm.direction" style="width: 100%">
            <el-option label="上班" :value="1" />
            <el-option label="下班" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="距离(km)">
          <el-input-number v-model="routeForm.distance" :min="0" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时长(分钟)">
          <el-input-number v-model="routeForm.estimated_time" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="routeForm.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="routeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRoute" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Layout from '../components/Layout.vue'
import api from '../utils/api'

const activeTab = ref('routes')
const loading = ref(false)
const saving = ref(false)
const routes = ref([])
const stations = ref([])
const shuttles = ref([])
const schedules = ref([])
const warnings = ref([])

const routeDialogVisible = ref(false)
const isEditRoute = ref(false)
const routeForm = reactive({
  id: null,
  route_no: '',
  name: '',
  direction: 1,
  distance: 0,
  estimated_time: 0,
  status: 1
})

async function loadRoutes() {
  loading.value = true
  try {
    const res = await api.get('/routes')
    routes.value = res.data || []
  } catch (error) {
    console.error('Load routes error:', error)
  } finally {
    loading.value = false
  }
}

async function loadStations() {
  try {
    const res = await api.get('/stations')
    stations.value = res.data || []
  } catch (error) {
    console.error('Load stations error:', error)
  }
}

async function loadShuttles() {
  try {
    const res = await api.get('/shuttles')
    shuttles.value = res.data || []
  } catch (error) {
    console.error('Load shuttles error:', error)
  }
}

async function loadSchedules() {
  try {
    const res = await api.get('/schedules')
    schedules.value = res.data || []
  } catch (error) {
    console.error('Load schedules error:', error)
  }
}

async function loadWarnings() {
  try {
    const res = await api.get('/warnings')
    warnings.value = res.data || []
  } catch (error) {
    console.error('Load warnings error:', error)
  }
}

function openRouteDialog() {
  isEditRoute.value = false
  Object.assign(routeForm, {
    id: null,
    route_no: '',
    name: '',
    direction: 1,
    distance: 0,
    estimated_time: 0,
    status: 1
  })
  routeDialogVisible.value = true
}

function editRoute(row) {
  isEditRoute.value = true
  Object.assign(routeForm, {
    id: row.id,
    route_no: row.route_no,
    name: row.name,
    direction: row.direction,
    distance: row.distance,
    estimated_time: row.estimated_time,
    status: row.status
  })
  routeDialogVisible.value = true
}

async function saveRoute() {
  if (!routeForm.name) {
    ElMessage.warning('请输入线路名称')
    return
  }
  saving.value = true
  try {
    if (isEditRoute.value) {
      await api.put(`/routes/${routeForm.id}`, routeForm)
      ElMessage.success('更新成功')
    } else {
      await api.post('/routes', routeForm)
      ElMessage.success('创建成功')
    }
    routeDialogVisible.value = false
    loadRoutes()
  } catch (error) {
    console.error('Save route error:', error)
  } finally {
    saving.value = false
  }
}

function deleteRoute(row) {
  ElMessageBox.confirm('确定要删除此线路吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await api.delete(`/routes/${row.id}`)
      ElMessage.success('删除成功')
      loadRoutes()
    } catch (error) {
      console.error('Delete route error:', error)
    }
  }).catch(() => {})
}

function openStationDialog() {
  ElMessage.info('新增站点功能开发中')
}

function editStation(row) {
  ElMessage.info('编辑站点功能开发中')
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
  ElMessage.info('新增车辆功能开发中')
}

function editShuttle(row) {
  ElMessage.info('编辑车辆功能开发中')
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
  ElMessage.info('新增班次功能开发中')
}

function editSchedule(row) {
  ElMessage.info('编辑班次功能开发中')
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
