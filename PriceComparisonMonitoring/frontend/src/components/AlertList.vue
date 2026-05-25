<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <span style="color: #606266;">
        未读: {{ unreadCount }} 条
      </span>
      <el-button
        size="small"
        :disabled="unreadCount === 0"
        @click="handleMarkAllRead"
      >
        全部标为已读
      </el-button>
    </div>
    
    <div v-if="logs.length === 0" class="empty-state" style="padding: 40px 20px;">
      <el-icon class="empty-icon" style="font-size: 48px;"><Bell /></el-icon>
      <p class="empty-text">暂无提醒消息</p>
    </div>
    
    <div v-else style="max-height: 400px; overflow-y: auto;">
      <div
        v-for="log in logs"
        :key="log.id"
        style="padding: 12px; border-bottom: 1px solid #ebeef5; cursor: pointer;"
        :style="{ background: log.is_read ? '#fff' : '#f5f7fa' }"
        @click="handleMarkRead(log)"
      >
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <el-tag size="small" :type="getAlertTypeTag(log.alert_type)">
            {{ getAlertTypeName(log.alert_type) }}
          </el-tag>
          <span style="font-size: 12px; color: #909399;">
            {{ formatDate(log.created_at) }}
          </span>
        </div>
        <p style="margin: 8px 0 0; color: #303133; font-size: 14px;">
          {{ log.message }}
        </p>
        <div v-if="log.change_amount" style="margin-top: 8px; font-size: 12px;">
          <span style="color: #67c23a;" v-if="log.change_amount > 0">
            ↓ ¥{{ log.change_amount.toFixed(2) }} ({{ log.change_percent?.toFixed(1) }}%)
          </span>
          <span style="color: #f56c6c;" v-else>
            ↑ ¥{{ Math.abs(log.change_amount).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { alertApi } from '@/api'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const emit = defineEmits(['close', 'update-count'])

const logs = ref([])
const unreadCount = ref(0)

onMounted(() => {
  loadLogs()
})

const loadLogs = async () => {
  try {
    const res = await alertApi.getLogs({ page: 1, page_size: 20 })
    logs.value = res.data?.list || []
    
    const countRes = await alertApi.getUnreadCount()
    unreadCount.value = countRes.data?.count || 0
    emit('update-count', unreadCount.value)
  } catch (e) {
    console.error(e)
  }
}

const getAlertTypeName = (type) => {
  const map = {
    price_drop: '降价提醒',
    below_threshold: '价格阈值',
    daily: '每日提醒',
    weekly: '每周提醒'
  }
  return map[type] || type
}

const getAlertTypeTag = (type) => {
  const map = {
    price_drop: 'danger',
    below_threshold: 'warning',
    daily: 'info',
    weekly: 'success'
  }
  return map[type] || ''
}

const formatDate = (date) => {
  return dayjs(date).format('MM-DD HH:mm')
}

const handleMarkRead = async (log) => {
  if (log.is_read) return
  
  try {
    await alertApi.markAsRead(log.id)
    log.is_read = 1
    unreadCount.value--
    emit('update-count', unreadCount.value)
  } catch (e) {
    console.error(e)
  }
}

const handleMarkAllRead = async () => {
  try {
    await alertApi.markAllAsRead()
    logs.value.forEach(log => log.is_read = 1)
    unreadCount.value = 0
    emit('update-count', 0)
    ElMessage.success('已全部标记为已读')
  } catch (e) {
    console.error(e)
  }
}
</script>
