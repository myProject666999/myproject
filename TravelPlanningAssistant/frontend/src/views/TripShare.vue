<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" link @click="goBack">返回</el-button>
        <h2>分享行程</h2>
      </div>
    </div>

    <div v-loading="loading" class="share-page">
      <div v-if="trip" class="share-content">
        <div class="share-info card">
          <h3>{{ trip.name }}</h3>
          <p v-if="trip.description" class="trip-desc">{{ trip.description }}</p>
          <div class="trip-meta">
            <span>
              <el-icon><Calendar /></el-icon>
              {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}
            </span>
            <span>
              <el-icon><LocationFilled /></el-icon>
              {{ getAttractionCount() }} 个景点
            </span>
          </div>
        </div>

        <div class="share-section">
          <h3 class="section-title">分享链接</h3>
          <div class="share-link-box">
            <el-input v-model="shareUrl" readonly>
              <template #append>
                <el-button :icon="CopyDocument" @click="copyLink">复制</el-button>
              </template>
            </el-input>
            <p class="share-tip">分享此链接给好友，他们可以查看完整的行程信息</p>
          </div>

          <div class="share-actions">
            <el-button type="primary" :icon="Link" @click="generateLink">
              {{ shareUrl ? '重新生成' : '生成链接' }}
            </el-button>
            <el-button :icon="View" @click="previewShared">
              预览分享页面
            </el-button>
          </div>
        </div>

        <div class="share-preview card">
          <h3 class="section-title">行程预览</h3>
          <div class="preview-days">
            <div v-for="(day, dayIndex) in trip.days" :key="day.id" class="preview-day">
              <div class="preview-day-header">
                <el-tag type="primary">Day {{ dayIndex + 1 }}</el-tag>
                <span>{{ formatDate(day.date) }}</span>
              </div>
              <div v-if="day.attractions?.length > 0" class="preview-attractions">
                <div
                  v-for="attr in day.attractions"
                  :key="attr.id"
                  class="preview-attr"
                >
                  <span class="attr-type" :class="`type-${attr.type}`">
                    {{ getTypeText(attr.type) }}
                  </span>
                  <span class="attr-name">{{ attr.name }}</span>
                  <span v-if="attr.start_time" class="attr-time">
                    {{ attr.start_time }} - {{ attr.end_time }}
                  </span>
                </div>
              </div>
              <div v-else class="preview-empty">暂无安排</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Calendar, LocationFilled, CopyDocument, Link, View } from '@element-plus/icons-vue'
import { tripApi } from '../api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const trip = ref(null)
const shareUrl = ref('')

onMounted(async () => {
  await loadTrip()
  if (trip.value?.share_token) {
    shareUrl.value = `${window.location.origin}/share/${trip.value.share_token}`
  }
})

async function loadTrip() {
  loading.value = true
  try {
    const res = await tripApi.getTrip(route.params.id)
    trip.value = res.data
  } finally {
    loading.value = false
  }
}

async function generateLink() {
  loading.value = true
  try {
    const res = await tripApi.getShareLink(route.params.id)
    const token = res.data.share_token
    shareUrl.value = `${window.location.origin}/share/${token}`
    ElMessage.success('生成成功')
  } catch (e) {
    // error handled
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

function previewShared() {
  if (trip.value?.share_token) {
    router.push(`/share/${trip.value.share_token}`)
  } else {
    ElMessage.warning('请先生成分享链接')
  }
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function getAttractionCount() {
  let count = 0
  trip.value?.days?.forEach(day => {
    count += day.attractions?.length || 0
  })
  return count
}

function getTypeText(type) {
  const map = { attraction: '景点', food: '餐饮', hotel: '住宿', transport: '交通' }
  return map[type] || type
}

function goBack() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.share-page {
  .share-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.share-info {
  padding: 24px;

  h3 {
    font-size: 22px;
    color: #303133;
    margin: 0 0 12px 0;
  }

  .trip-desc {
    font-size: 14px;
    color: #606266;
    margin-bottom: 16px;
  }

  .trip-meta {
    display: flex;
    gap: 24px;
    color: #909399;
    font-size: 14px;

    span {
      display: flex;
      align-items: center;
      gap: 6px;

      .el-icon {
        color: #409eff;
      }
    }
  }
}

.share-section {
  .share-link-box {
    margin-bottom: 16px;
  }

  .share-tip {
    font-size: 13px;
    color: #909399;
    margin-top: 8px;
  }

  .share-actions {
    display: flex;
    gap: 12px;
  }
}

.share-preview {
  padding: 20px;

  .preview-days {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .preview-day {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    .preview-day-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #606266;
    }

    .preview-attractions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-attr {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: #fff;
      border-radius: 6px;

      .attr-type {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 4px;
        color: #fff;

        &.type-attraction { background: #409eff; }
        &.type-food { background: #67c23a; }
        &.type-hotel { background: #e6a23c; }
        &.type-transport { background: #f56c6c; }
      }

      .attr-name {
        flex: 1;
        font-size: 14px;
        color: #303133;
      }

      .attr-time {
        font-size: 13px;
        color: #909399;
      }
    }

    .preview-empty {
      font-size: 13px;
      color: #c0c4cc;
      text-align: center;
      padding: 12px;
    }
  }
}
</style>
