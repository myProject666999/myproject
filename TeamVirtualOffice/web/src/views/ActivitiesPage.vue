<template>
  <div class="activities-page">
    <el-card class="header-card" shadow="never">
      <div class="page-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" circle @click="goBack" />
          <div class="header-info">
            <h1>Recent Activities</h1>
            <p>Team activity timeline</p>
          </div>
        </div>
        <div class="header-right">
          <el-tag type="info">{{ totalActivities }} activities</el-tag>
        </div>
      </div>
    </el-card>
    <el-card class="filters-card" shadow="never">
      <div class="filters-row">
        <span class="filter-label">Filter by type:</span>
        <el-checkbox-group v-model="selectedTypes">
          <el-checkbox
            v-for="type in activityTypes"
            :key="type.value"
            :label="type.value"
          >
            <span class="type-label">
              <span class="type-icon" :style="{ color: type.color }">
                <el-icon><component :is="type.icon" /></el-icon>
              </span>
              {{ type.label }}
            </span>
          </el-checkbox>
        </el-checkbox-group>
        <el-button type="primary" @click="refreshActivities">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
      </div>
    </el-card>
    <el-card class="timeline-card" shadow="never">
      <el-timeline v-if="filteredActivities.length > 0">
        <el-timeline-item
          v-for="activity in paginatedActivities"
          :key="activity.id"
          :timestamp="formatTimestamp(activity.created_at)"
          placement="top"
          :type="getTimelineType(activity.type)"
          :color="getActivityColor(activity.type)"
          size="large"
        >
          <div class="activity-item">
            <div class="activity-header">
              <el-avatar :size="36" class="activity-avatar">
                {{ (activity.nickname || 'U')?.charAt(0) }}
              </el-avatar>
              <div class="activity-info">
                <div class="activity-user">
                  {{ activity.nickname || 'Unknown' }}
                </div>
                <div class="activity-description">
                  {{ activity.content || formatActivityType(activity.type) }}
                </div>
              </div>
              <el-tag :type="getTagType(activity.type)" size="small" effect="light">
                {{ formatActivityType(activity.type) }}
              </el-tag>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
      <div v-if="filteredActivities.length === 0" class="no-activities">
        <el-icon :size="64" color="#c0c4cc"><DataLine /></el-icon>
        <p>No activities found</p>
      </div>
      <div class="pagination-wrapper" v-if="filteredActivities.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredActivities.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Refresh,
  User,
  SwitchButton,
  Grid,
  ChatDotRound,
  Phone,
  Edit,
  DataLine
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

const activities = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedTypes = ref([])

const activityTypes = [
  { value: 1, label: 'Online', color: '#67c23a', icon: User },
  { value: 2, label: 'Offline', color: '#909399', icon: SwitchButton },
  { value: 3, label: 'Enter Room', color: '#409eff', icon: Grid },
  { value: 4, label: 'Leave Room', color: '#e6a23c', icon: Grid },
  { value: 5, label: 'Status Change', color: '#f56c6c', icon: Edit },
  { value: 6, label: 'Call', color: '#67c23a', icon: Phone },
  { value: 7, label: 'Message', color: '#909399', icon: ChatDotRound }
]

const totalActivities = computed(() => activities.value.length)

const filteredActivities = computed(() => {
  if (selectedTypes.value.length === 0) {
    return activities.value
  }
  return activities.value.filter(a => selectedTypes.value.includes(a.type))
})

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredActivities.value.slice(start, end)
})

function getTimelineType(type) {
  const types = { 1: 'success', 2: 'info', 3: 'primary', 4: 'warning', 5: 'danger', 6: 'success', 7: 'info' }
  return types[type] || 'info'
}

function getActivityColor(type) {
  const colors = { 1: '#67c23a', 2: '#909399', 3: '#409eff', 4: '#e6a23c', 5: '#f56c6c', 6: '#67c23a', 7: '#909399' }
  return colors[type] || '#909399'
}

function getTagType(type) {
  const types = { 1: 'success', 2: 'info', 3: 'primary', 4: 'warning', 5: 'danger', 6: 'success', 7: 'info' }
  return types[type] || 'info'
}

function formatActivityType(type) {
  const types = {
    1: 'Online', 2: 'Offline', 3: 'Enter Room', 4: 'Leave Room',
    5: 'Status Change', 6: 'Call', 7: 'Message'
  }
  return types[type] || 'Unknown'
}

function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function goBack() {
  router.push('/office')
}

async function fetchActivities() {
  loading.value = true
  try {
    const response = await request.get('/api/activity/list', {
      params: { page: 1, page_size: 100 }
    })
    activities.value = response.data?.list || response.data || []
  } catch (e) {
    ElMessage.error('Failed to fetch activities')
    activities.value = []
  } finally {
    loading.value = false
  }
}

function refreshActivities() {
  fetchActivities()
  ElMessage.success('Refreshed')
}

onMounted(() => {
  fetchActivities()
})
</script>

<style lang="scss" scoped>
.activities-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;

  .header-card {
    margin-bottom: 16px;
    border-radius: 12px;

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .header-info {
          h1 { margin: 0 0 4px 0; color: #303133; font-size: 20px; font-weight: 600; }
          p { margin: 0; color: #909399; font-size: 14px; }
        }
      }
    }
  }

  .filters-card {
    margin-bottom: 16px;
    border-radius: 12px;

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;

      .filter-label { color: #606266; font-weight: 500; }

      .type-label {
        display: flex;
        align-items: center;
        gap: 6px;
        .type-icon { display: flex; align-items: center; }
      }
    }
  }

  .timeline-card {
    border-radius: 12px;

    .activity-item {
      .activity-header {
        display: flex;
        align-items: center;
        gap: 12px;

        .activity-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          flex-shrink: 0;
        }

        .activity-info {
          flex: 1;
          .activity-user { font-weight: 500; color: #303133; font-size: 14px; margin-bottom: 2px; }
          .activity-description { color: #606266; font-size: 13px; }
        }
      }
    }

    .no-activities {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #c0c4cc;
      p { margin: 16px 0 0 0; font-size: 14px; }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f2f5;
    }
  }
}
</style>
