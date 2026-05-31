<template>
  <div class="event-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>Event Detail</span>
          <el-button @click="goBack">Back</el-button>
        </div>
      </template>
      <div class="event-info" v-if="eventDetail.id">
        <h2>{{ eventDetail.title }}</h2>
        <el-row :gutter="20">
          <el-col :span="12">
            <p><strong>Address:</strong> {{ eventDetail.address }}</p>
            <p><strong>Start Time:</strong> {{ formatDate(eventDetail.startTime) }}</p>
            <p><strong>End Time:</strong> {{ formatDate(eventDetail.endTime) }}</p>
          </el-col>
          <el-col :span="12">
            <p><strong>Status:</strong> <el-tag :type="getStatusType(eventDetail.status)">{{ eventDetail.status }}</el-tag></p>
            <p><strong>Registration Start:</strong> {{ formatDate(eventDetail.registrationStart) }}</p>
            <p><strong>Registration End:</strong> {{ formatDate(eventDetail.registrationEnd) }}</p>
          </el-col>
        </el-row>
        <div class="description">
          <strong>Description:</strong>
          <p>{{ eventDetail.description }}</p>
        </div>
        <el-tabs v-model="activeTab" style="margin-top: 20px">
          <el-tab-pane label="Stalls" name="stalls">
            <div class="tab-content">
              <el-button type="primary" @click="goToStallMap">View Stall Map</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Registrations" name="registrations">
            <div class="tab-content">
              <el-button type="primary" @click="goToRegistrations">View Registration List</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Announcements" name="announcements">
            <div class="tab-content">
              <p>Announcements management</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Review" name="review">
            <div class="tab-content">
              <el-button type="primary" @click="goToReview">View Event Review</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getEventDetail } from '@/api/event'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const activeTab = ref('stalls')
const eventDetail = ref({})

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

const getStatusType = (status) => {
  const typeMap = {
    DRAFT: 'info',
    PUBLISHED: 'primary',
    REGISTRATION_OPEN: 'success',
    REGISTRATION_CLOSED: 'warning',
    ONGOING: 'danger',
    COMPLETED: 'success',
    CANCELLED: 'info'
  }
  return typeMap[status] || 'info'
}

const fetchDetail = async () => {
  const id = route.params.id
  if (!id) return
  loading.value = true
  try {
    const res = await getEventDetail(id)
    eventDetail.value = res.data
  } catch (err) {
    ElMessage.error('Failed to fetch event detail')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToStallMap = () => {
  router.push(`/stall/map/${eventDetail.value.id}`)
}

const goToRegistrations = () => {
  router.push({ path: '/registration/list', query: { eventId: eventDetail.value.id } })
}

const goToReview = () => {
  router.push(`/review/${eventDetail.value.id}`)
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.event-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-info h2 {
  margin-bottom: 20px;
  color: #303133;
}

.event-info p {
  margin: 10px 0;
  color: #606266;
}

.description {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.tab-content {
  padding: 20px 0;
}
</style>
