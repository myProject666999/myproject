<template>
  <div class="queue-admin">
    <h2 class="page-title">叫号后台</h2>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filter">
        <el-form-item label="科室">
          <el-select v-model="filter.departmentId" placeholder="请选择科室" @change="onDepartmentChange">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="医生">
          <el-select v-model="filter.doctorId" placeholder="请选择医生" @change="loadData">
            <el-option
              v-for="doctor in doctors"
              :key="doctor.id"
              :label="doctor.name"
              :value="doctor.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排班">
          <el-select v-model="filter.scheduleId" placeholder="请选择排班" @change="loadData">
            <el-option
              v-for="s in schedules"
              :key="s.id"
              :label="`${formatDate(s.scheduleDate)} ${s.timePeriod}`"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-if="filter.scheduleId" class="queue-content">
      <el-card class="current-call">
        <h3>当前叫号</h3>
        <div v-if="currentCalling" class="current-info">
          <div class="queue-no">{{ currentCalling.queueNumber }}</div>
          <div class="patient-name">{{ currentCalling.patientName }}</div>
          <div class="call-count">已叫号 {{ currentCalling.callCount }} 次</div>
        </div>
        <el-empty v-else description="暂无正在叫号" />
      </el-card>

      <el-card class="queue-list">
        <div class="card-header">
          <h3>等待队列</h3>
          <el-button type="primary" :disabled="!canCallNext" @click="callNext">
            <el-icon><Bell /></el-icon> 叫下一号
          </el-button>
        </div>
        <el-table :data="queueCalls" style="width: 100%;">
          <el-table-column prop="queueNumber" label="排队号" width="100" />
          <el-table-column prop="patientName" label="患者姓名" />
          <el-table-column prop="callCount" label="叫号次数" width="100" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getCallStatusType(row.status)">
                {{ getCallStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 0 || row.status === 2"
                size="small"
                type="primary"
                @click="recall(row.id)"
              >
                叫号
              </el-button>
              <el-button
                v-if="row.status === 1"
                size="small"
                type="success"
                @click="markVisited(row.id)"
              >
                已就诊
              </el-button>
              <el-button
                v-if="row.status === 1"
                size="small"
                type="warning"
                @click="markMissed(row.id)"
              >
                过号
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="queueCalls.length === 0" description="暂无等待患者" />
      </el-card>
    </div>

    <el-empty v-else description="请先选择科室、医生和排班" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getDepartments, getDoctors, getSchedules,
  getQueueCalls, getCurrentCalling, callNext as callNextApi,
  recallQueue, markVisited as markVisitedApi, markMissed as markMissedApi
} from '@/api'
import { ElMessage } from 'element-plus'

const departments = ref([])
const doctors = ref([])
const schedules = ref([])
const queueCalls = ref([])
const currentCalling = ref(null)

const filter = reactive({
  departmentId: null,
  doctorId: null,
  scheduleId: null
})

const canCallNext = computed(() => {
  return queueCalls.value.some(q => q.status === 0)
})

const getCallStatusType = (status) => {
  const types = { 0: 'info', 1: 'primary', 2: 'warning', 3: 'success' }
  return types[status] || 'info'
}

const getCallStatusText = (status) => {
  const texts = { 0: '等待中', 1: '叫号中', 2: '已过号', 3: '已就诊' }
  return texts[status] || '未知'
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const onDepartmentChange = () => {
  filter.doctorId = null
  filter.scheduleId = null
  loadDoctors()
}

const loadDepartments = async () => {
  try {
    departments.value = await getDepartments()
  } catch (e) {
    ElMessage.error('加载科室列表失败')
  }
}

const loadDoctors = async () => {
  if (!filter.departmentId) return
  try {
    doctors.value = await getDoctors(filter.departmentId)
  } catch (e) {
    ElMessage.error('加载医生列表失败')
  }
}

const loadSchedules = async () => {
  if (!filter.doctorId) return
  try {
    schedules.value = await getSchedules({ doctorId: filter.doctorId })
  } catch (e) {
    ElMessage.error('加载排班列表失败')
  }
}

const loadData = async () => {
  if (filter.doctorId && !filter.scheduleId) {
    loadSchedules()
  }
  if (!filter.scheduleId || !filter.doctorId) return

  try {
    const [calls, current] = await Promise.all([
      getQueueCalls({ scheduleId: filter.scheduleId, doctorId: filter.doctorId }),
      getCurrentCalling({ scheduleId: filter.scheduleId, doctorId: filter.doctorId })
    ])
    queueCalls.value = calls
    currentCalling.value = current
  } catch (e) {
    ElMessage.error('加载叫号数据失败')
  }
}

const callNext = async () => {
  try {
    currentCalling.value = await callNextApi({
      scheduleId: filter.scheduleId,
      doctorId: filter.doctorId
    })
    ElMessage.success('叫号成功')
    loadData()
  } catch (e) {
    ElMessage.error(e.message || '叫号失败')
  }
}

const recall = async (id) => {
  try {
    await recallQueue(id)
    ElMessage.success('叫号成功')
    loadData()
  } catch (e) {
    ElMessage.error(e.message || '叫号失败')
  }
}

const markVisited = async (id) => {
  try {
    await markVisitedApi(id)
    ElMessage.success('已标记为已就诊')
    loadData()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

const markMissed = async (id) => {
  try {
    await markMissedApi(id)
    ElMessage.success('已标记为过号')
    loadData()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

onMounted(() => {
  loadDepartments()
})
</script>

<style scoped>
.queue-admin {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.queue-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.current-call {
  text-align: center;
}

.current-call h3 {
  margin-bottom: 20px;
}

.current-info .queue-no {
  font-size: 72px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.current-info .patient-name {
  font-size: 24px;
  margin-bottom: 10px;
}

.current-info .call-count {
  color: #909399;
}

.queue-list .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.queue-list .card-header h3 {
  margin: 0;
}
</style>
