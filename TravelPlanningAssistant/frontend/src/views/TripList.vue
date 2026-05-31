<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的行程</h2>
      <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
        创建行程
      </el-button>
    </div>

    <div v-loading="loading" class="trip-list">
      <div v-if="trips.length === 0" class="empty-state">
        <el-icon><DocumentAdd /></el-icon>
        <p>还没有行程，快来创建一个吧！</p>
      </div>

      <div v-else class="trip-grid">
        <div
          v-for="trip in trips"
          :key="trip.id"
          class="trip-card card"
          @click="goToDetail(trip.id)"
        >
          <div class="trip-card-header">
            <h3>{{ trip.name }}</h3>
            <el-tag :type="getStatusType(trip.status)" size="small">
              {{ getStatusText(trip.status) }}
            </el-tag>
          </div>
          <p v-if="trip.description" class="trip-desc">{{ trip.description }}</p>
          <div class="trip-info">
            <span>
              <el-icon><Calendar /></el-icon>
              {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}
            </span>
            <span>
              <el-icon><LocationFilled /></el-icon>
              {{ getAttractionCount(trip) }} 个景点
            </span>
          </div>
          <div class="trip-actions" @click.stop>
            <el-button type="primary" link :icon="Edit" @click="editTrip(trip.id)">编辑</el-button>
            <el-button type="success" link :icon="Location" @click="viewMap(trip.id)">地图</el-button>
            <el-button type="warning" link :icon="Money" @click="viewBudget(trip.id)">预算</el-button>
            <el-button type="info" link :icon="Share" @click="viewShare(trip.id)">分享</el-button>
            <el-button type="danger" link :icon="Delete" @click="deleteTrip(trip.id)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showCreateDialog" title="创建新行程" width="500px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="行程名称" required>
          <el-input v-model="createForm.name" placeholder="请输入行程名称" />
        </el-form-item>
        <el-form-item label="行程描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入行程描述" />
        </el-form-item>
        <el-form-item label="开始日期" required>
          <el-date-picker v-model="createForm.start_date" type="date" placeholder="选择开始日期" />
        </el-form-item>
        <el-form-item label="结束日期" required>
          <el-date-picker v-model="createForm.end_date" type="date" placeholder="选择结束日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Edit, Delete, Location, Money, Share, Calendar, LocationFilled, DocumentAdd
} from '@element-plus/icons-vue'
import { useTripStore } from '../stores/trip'
import dayjs from 'dayjs'

const router = useRouter()
const tripStore = useTripStore()

const loading = ref(false)
const creating = ref(false)
const showCreateDialog = ref(false)
const trips = ref([])

const createForm = ref({
  name: '',
  description: '',
  start_date: '',
  end_date: ''
})

onMounted(() => {
  loadTrips()
})

async function loadTrips() {
  loading.value = true
  try {
    trips.value = await tripStore.fetchTrips()
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function getAttractionCount(trip) {
  let count = 0
  trip.days?.forEach(day => {
    count += day.attractions?.length || 0
  })
  return count
}

function getStatusType(status) {
  const map = { draft: 'info', planning: 'warning', confirmed: 'success', completed: 'primary' }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = { draft: '草稿', planning: '规划中', confirmed: '已确认', completed: '已完成' }
  return map[status] || '草稿'
}

function goToDetail(id) {
  router.push(`/trip/${id}/edit`)
}

function editTrip(id) {
  router.push(`/trip/${id}/edit`)
}

function viewMap(id) {
  router.push(`/trip/${id}/map`)
}

function viewBudget(id) {
  router.push(`/trip/${id}/budget`)
}

function viewShare(id) {
  router.push(`/trip/${id}/share`)
}

async function deleteTrip(id) {
  try {
    await ElMessageBox.confirm('确定要删除这个行程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await tripStore.deleteTrip(id)
    ElMessage.success('删除成功')
    loadTrips()
  } catch {
    // 用户取消
  }
}

async function handleCreate() {
  if (!createForm.value.name) {
    ElMessage.warning('请输入行程名称')
    return
  }
  if (!createForm.value.start_date || !createForm.value.end_date) {
    ElMessage.warning('请选择日期')
    return
  }
  if (dayjs(createForm.value.end_date).isBefore(createForm.value.start_date)) {
    ElMessage.warning('结束日期不能早于开始日期')
    return
  }

  creating.value = true
  try {
    const data = {
      name: createForm.value.name,
      description: createForm.value.description,
      start_date: dayjs(createForm.value.start_date).format('YYYY-MM-DD'),
      end_date: dayjs(createForm.value.end_date).format('YYYY-MM-DD')
    }
    const trip = await tripStore.createTrip(data)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    createForm.value = { name: '', description: '', start_date: '', end_date: '' }
    router.push(`/trip/${trip.id}/edit`)
  } finally {
    creating.value = false
  }
}
</script>

<style lang="scss" scoped>
.trip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.trip-card {
  padding: 20px;
  cursor: pointer;

  .trip-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    h3 {
      font-size: 18px;
      color: #303133;
      margin: 0;
      flex: 1;
    }
  }

  .trip-desc {
    color: #606266;
    font-size: 14px;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .trip-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    color: #909399;
    font-size: 13px;

    span {
      display: flex;
      align-items: center;
      gap: 6px;

      .el-icon {
        color: #409eff;
      }
    }
  }

  .trip-actions {
    display: flex;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
