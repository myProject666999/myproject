<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" link @click="goBack">返回</el-button>
        <h2>{{ isEdit ? '编辑行程' : '创建行程' }}</h2>
      </div>
      <div class="header-actions">
        <el-button type="success" :icon="Location" @click="goToMap">地图</el-button>
        <el-button type="warning" :icon="Money" @click="goToBudget">预算</el-button>
        <el-button type="info" :icon="Share" @click="goToShare">分享</el-button>
      </div>
    </div>

    <div v-loading="loading" class="trip-edit">
      <div class="trip-info-section">
        <h3 class="section-title">基本信息</h3>
        <el-form :model="tripForm" label-width="80px" class="info-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="行程名称">
                <el-input v-model="tripForm.name" placeholder="请输入行程名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="行程状态">
                <el-select v-model="tripForm.status">
                  <el-option label="草稿" value="draft" />
                  <el-option label="规划中" value="planning" />
                  <el-option label="已确认" value="confirmed" />
                  <el-option label="已完成" value="completed" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始日期">
                <el-date-picker v-model="tripForm.start_date" type="date" placeholder="开始日期" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束日期">
                <el-date-picker v-model="tripForm.end_date" type="date" placeholder="结束日期" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="行程描述">
            <el-input v-model="tripForm.description" type="textarea" :rows="2" placeholder="请输入行程描述" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="saveTrip">保存</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="days-section">
        <div class="days-header">
          <h3 class="section-title">每日安排</h3>
          <el-button type="primary" :icon="Plus" @click="showAddDayDialog = true">
            添加日期
          </el-button>
        </div>

        <div v-if="days.length === 0" class="empty-state">
          <el-icon><Calendar /></el-icon>
          <p>还没有安排，点击上方按钮添加</p>
        </div>

        <div v-else class="days-list">
          <div
            v-for="(day, dayIndex) in days"
            :key="day.id"
            class="day-card card"
          >
            <div class="day-header">
              <div class="day-title">
                <el-tag type="primary" size="large">Day {{ dayIndex + 1 }}</el-tag>
                <span class="day-date">{{ formatDate(day.date) }}</span>
              </div>
              <div class="day-actions">
                <el-button type="primary" link :icon="Plus" @click="openAttractionDialog(day)">添加景点</el-button>
                <el-button type="danger" link :icon="Delete" @click="deleteDay(day.id)">删除</el-button>
              </div>
            </div>

            <div class="attractions-list">
              <div
                v-for="(attraction, attrIndex) in day.attractions"
                :key="attraction.id"
                class="attraction-item"
              >
                <div class="attraction-time">
                  {{ attraction.start_time || '--' }} - {{ attraction.end_time || '--' }}
                </div>
                <div class="attraction-content">
                  <div class="attraction-header">
                    <span class="attraction-type" :class="`type-${attraction.type}`">
                      {{ getTypeText(attraction.type) }}
                    </span>
                    <span class="attraction-name">{{ attraction.name }}</span>
                    <span v-if="attraction.cost" class="attraction-cost">¥{{ attraction.cost }}</span>
                  </div>
                  <p v-if="attraction.description" class="attraction-desc">{{ attraction.description }}</p>
                  <p v-if="attraction.address" class="attraction-address">
                    <el-icon><LocationFilled /></el-icon>
                    {{ attraction.address }}
                  </p>
                </div>
                <div class="attraction-actions">
                  <el-button type="primary" link :icon="Edit" @click="editAttraction(attraction, day)">编辑</el-button>
                  <el-button type="danger" link :icon="Delete" @click="deleteAttraction(attraction.id)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddDayDialog" title="添加日期" width="400px">
      <el-form label-width="80px">
        <el-form-item label="选择日期">
          <el-date-picker v-model="newDayDate" type="date" placeholder="选择日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDayDialog = false">取消</el-button>
        <el-button type="primary" @click="addDay">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAttractionDialog" :title="editingAttraction ? '编辑景点' : '添加景点'" width="600px">
      <el-form :model="attractionForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="attractionForm.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="attractionForm.type">
            <el-option label="景点" value="attraction" />
            <el-option label="餐饮" value="food" />
            <el-option label="住宿" value="hotel" />
            <el-option label="交通" value="transport" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="attractionForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="attractionForm.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="经纬度">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input-number v-model="attractionForm.latitude" :precision="6" :step="0.000001" placeholder="纬度" style="width: 100%" />
            </el-col>
            <el-col :span="12">
              <el-input-number v-model="attractionForm.longitude" :precision="6" :step="0.000001" placeholder="经度" style="width: 100%" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="时间">
          <el-time-picker v-model="attractionForm.start_time" format="HH:mm" placeholder="开始时间" />
          <el-time-picker v-model="attractionForm.end_time" format="HH:mm" placeholder="结束时间" />
        </el-form-item>
        <el-form-item label="费用">
          <el-input-number v-model="attractionForm.cost" :min="0" :step="10" placeholder="费用" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="attractionForm.notes" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAttractionDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAttraction">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Edit, Delete, Location, Money, Share, ArrowLeft, Calendar, LocationFilled
} from '@element-plus/icons-vue'
import { useTripStore } from '../stores/trip'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const saving = ref(false)

const tripForm = ref({
  name: '',
  description: '',
  start_date: null,
  end_date: null,
  status: 'draft'
})

const days = ref([])
const showAddDayDialog = ref(false)
const newDayDate = ref(null)

const showAttractionDialog = ref(false)
const editingAttraction = ref(null)
const currentDay = ref(null)
const attractionForm = ref({
  name: '',
  type: 'attraction',
  description: '',
  latitude: 0,
  longitude: 0,
  address: '',
  start_time: '',
  end_time: '',
  cost: 0,
  notes: ''
})

onMounted(async () => {
  if (isEdit.value) {
    await loadTrip(route.params.id)
  }
})

async function loadTrip(id) {
  loading.value = true
  try {
    const trip = await tripStore.fetchTrip(id)
    if (trip) {
      tripForm.value = {
        name: trip.name,
        description: trip.description || '',
        start_date: new Date(trip.start_date),
        end_date: new Date(trip.end_date),
        status: trip.status
      }
      days.value = trip.days || []
    }
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function getTypeText(type) {
  const map = { attraction: '景点', food: '餐饮', hotel: '住宿', transport: '交通' }
  return map[type] || type
}

async function saveTrip() {
  if (!tripForm.value.name) {
    ElMessage.warning('请输入行程名称')
    return
  }

  saving.value = true
  try {
    const data = {
      name: tripForm.value.name,
      description: tripForm.value.description,
      start_date: dayjs(tripForm.value.start_date).format('YYYY-MM-DD'),
      end_date: dayjs(tripForm.value.end_date).format('YYYY-MM-DD'),
      status: tripForm.value.status
    }

    if (isEdit.value) {
      await tripStore.updateTrip(route.params.id, data)
    } else {
      const trip = await tripStore.createTrip(data)
      router.replace(`/trip/${trip.id}/edit`)
    }
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

async function addDay() {
  if (!newDayDate.value) {
    ElMessage.warning('请选择日期')
    return
  }
  try {
    await tripStore.createDay(route.params.id, {
      date: dayjs(newDayDate.value).format('YYYY-MM-DD'),
      order_index: days.value.length
    })
    ElMessage.success('添加成功')
    showAddDayDialog.value = false
    newDayDate.value = null
    await loadTrip(route.params.id)
  } catch (e) {
    // error handled by interceptor
  }
}

async function deleteDay(id) {
  try {
    await ElMessageBox.confirm('确定要删除这一天的安排吗？', '提示', { type: 'warning' })
    await tripStore.deleteDay(id)
    ElMessage.success('删除成功')
    await loadTrip(route.params.id)
  } catch {
    // 用户取消
  }
}

function openAttractionDialog(day) {
  currentDay.value = day
  editingAttraction.value = null
  attractionForm.value = {
    name: '',
    type: 'attraction',
    description: '',
    latitude: 0,
    longitude: 0,
    address: '',
    start_time: '',
    end_time: '',
    cost: 0,
    notes: ''
  }
  showAttractionDialog.value = true
}

function editAttraction(attraction, day) {
  currentDay.value = day
  editingAttraction.value = attraction
  attractionForm.value = {
    name: attraction.name,
    type: attraction.type,
    description: attraction.description || '',
    latitude: attraction.latitude,
    longitude: attraction.longitude,
    address: attraction.address || '',
    start_time: attraction.start_time || '',
    end_time: attraction.end_time || '',
    cost: attraction.cost,
    notes: attraction.notes || ''
  }
  showAttractionDialog.value = true
}

async function saveAttraction() {
  if (!attractionForm.value.name) {
    ElMessage.warning('请输入名称')
    return
  }

  const data = { ...attractionForm.value }
  if (data.start_time) {
    data.start_time = dayjs(data.start_time).format('HH:mm')
  }
  if (data.end_time) {
    data.end_time = dayjs(data.end_time).format('HH:mm')
  }

  try {
    if (editingAttraction.value) {
      await tripStore.updateAttraction(editingAttraction.value.id, data)
    } else {
      data.order_index = currentDay.value.attractions?.length || 0
      await tripStore.createAttraction(currentDay.value.id, data)
    }
    ElMessage.success('保存成功')
    showAttractionDialog.value = false
    await loadTrip(route.params.id)
  } catch (e) {
    // error handled by interceptor
  }
}

async function deleteAttraction(id) {
  try {
    await ElMessageBox.confirm('确定要删除这个景点吗？', '提示', { type: 'warning' })
    await tripStore.deleteAttraction(id)
    ElMessage.success('删除成功')
    await loadTrip(route.params.id)
  } catch {
    // 用户取消
  }
}

function goBack() {
  router.push('/')
}

function goToMap() {
  router.push(`/trip/${route.params.id}/map`)
}

function goToBudget() {
  router.push(`/trip/${route.params.id}/budget`)
}

function goToShare() {
  router.push(`/trip/${route.params.id}/share`)
}
</script>

<style lang="scss" scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.trip-edit {
  .trip-info-section {
    margin-bottom: 30px;
  }

  .info-form {
    padding: 0 20px;
  }
}

.days-section {
  .days-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}

.days-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.day-card {
  padding: 20px;

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .day-title {
      display: flex;
      align-items: center;
      gap: 12px;

      .day-date {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .day-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.attractions-list {
  .attraction-item {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    margin-bottom: 10px;
    background: #f5f7fa;
    border-radius: 6px;
    transition: background 0.3s;

    &:hover {
      background: #ecf5ff;
    }

    &:last-child {
      margin-bottom: 0;
    }

    .attraction-time {
      width: 100px;
      color: #909399;
      font-size: 13px;
      flex-shrink: 0;
    }

    .attraction-content {
      flex: 1;
      min-width: 0;

      .attraction-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;

        .attraction-type {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
          color: #fff;

          &.type-attraction { background: #409eff; }
          &.type-food { background: #67c23a; }
          &.type-hotel { background: #e6a23c; }
          &.type-transport { background: #f56c6c; }
        }

        .attraction-name {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
        }

        .attraction-cost {
          color: #f56c6c;
          font-weight: 500;
        }
      }

      .attraction-desc {
        font-size: 13px;
        color: #606266;
        margin-bottom: 4px;
      }

      .attraction-address {
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 4px;

        .el-icon {
          font-size: 12px;
        }
      }
    }

    .attraction-actions {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-shrink: 0;
    }
  }
}
</style>
