<template>
  <div class="detail-page" v-loading="loading">
    <template v-if="detail">
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon :size="20" color="#409EFF"><Document /></el-icon>
              <span class="title">{{ detail.title }}</span>
              <el-tag :type="statusType(detail.status)" effect="light" size="large">
                {{ statusText(detail.status) }}
              </el-tag>
            </div>
            <el-button link type="primary" @click="goBack">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="分类">{{ detail.categoryName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ detail.area || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ detail.contactName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detail.contactPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="ID">#{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">
            <div class="content-text">{{ detail.content }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="section-card" shadow="never" style="margin-top: 16px">
        <template #header>
          <div class="card-header">
            <el-icon :size="20" color="#409EFF"><Clock /></el-icon>
            <span>处理进度</span>
          </div>
        </template>
        <el-timeline v-if="progressList.length">
          <el-timeline-item
            v-for="(item, idx) in progressList"
            :key="idx"
            :timestamp="item.createTime"
            placement="top"
            :type="timelineType(item.status)"
          >
            <div class="timeline-content">
              <el-tag size="small" :type="statusType(item.status)" effect="plain">
                {{ statusText(item.status) }}
              </el-tag>
              <span class="handler" v-if="item.handler">处理人：{{ item.handler }}</span>
              <p class="desc" v-if="item.description">{{ item.description }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无处理进度" :image-size="80" />
      </el-card>

      <el-card
        v-if="fileList.length"
        class="section-card"
        shadow="never"
        style="margin-top: 16px"
      >
        <template #header>
          <div class="card-header">
            <el-icon :size="20" color="#409EFF"><Paperclip /></el-icon>
            <span>附件</span>
          </div>
        </template>
        <div class="attachment-list">
          <template v-for="file in fileList" :key="file.id">
            <el-image
              v-if="isImage(file)"
              :src="fileUrl(file)"
              :preview-src-list="imageList"
              fit="cover"
              style="width: 120px; height: 120px; border-radius: 4px"
              preview-teleported
            />
            <el-link
              v-else
              :href="fileUrl(file)"
              target="_blank"
              type="primary"
              class="file-link"
            >
              <el-icon><Document /></el-icon>
              {{ file.fileName || '下载附件' }}
            </el-link>
          </template>
        </div>
      </el-card>

      <el-card
        v-if="detail.status === 'COMPLETED'"
        class="section-card"
        shadow="never"
        style="margin-top: 16px"
      >
        <template #header>
          <div class="card-header">
            <el-icon :size="20" color="#409EFF"><Star /></el-icon>
            <span>满意度评价</span>
          </div>
        </template>

        <div v-if="detail.rating != null">
          <div class="eval-display">
            <el-rate :model-value="detail.rating" disabled show-score text-color="#ff9900" />
            <div v-if="detail.feedback" class="eval-feedback">
              {{ detail.feedback }}
            </div>
          </div>
        </div>

        <el-form v-else :model="evalForm" label-width="80px">
          <el-form-item label="评分">
            <el-rate v-model="evalForm.rating" :max="5" show-text />
          </el-form-item>
          <el-form-item label="评价内容">
            <el-input
              v-model="evalForm.feedback"
              type="textarea"
              :rows="4"
              placeholder="请填写您的评价（可选）"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="evaluating" @click="submitEval">
              提交评价
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </template>

    <el-empty v-else-if="!loading" description="投诉不存在或已删除" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getComplaintDetail, evaluateComplaint, downloadFile } from '../api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const evaluating = ref(false)
const detail = ref(null)

const evalForm = reactive({
  rating: 5,
  feedback: ''
})

const progressList = computed(() => {
  if (!detail.value) return []
  return detail.value.progressList || []
})

const fileList = computed(() => {
  if (!detail.value) return []
  return detail.value.fileList || []
})

const fileUrl = (file) => {
  return downloadFile(file.id)
}

const imageList = computed(() =>
  fileList.value.filter((f) => isImage(f)).map((f) => fileUrl(f))
)

const isImage = (file) => {
  const name = (file.fileName || '').toLowerCase()
  return /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(name)
}

const timelineType = (s) => {
  const map = {
    PENDING: 'info',
    PROCESSING: 'warning',
    REPLIED: 'primary',
    COMPLETED: 'success'
  }
  return map[s] || 'primary'
}

const statusType = (s) => {
  const map = {
    PENDING: 'info',
    PROCESSING: 'warning',
    REPLIED: 'primary',
    COMPLETED: 'success'
  }
  return map[s] || 'info'
}

const statusText = (s) => {
  const map = {
    PENDING: '待受理',
    PROCESSING: '处理中',
    REPLIED: '已回复',
    COMPLETED: '已完成'
  }
  return map[s] || s
}

const loadDetail = async () => {
  loading.value = true
  try {
    const data = await getComplaintDetail(route.params.id)
    detail.value = data
  } catch (e) {
    detail.value = null
  } finally {
    loading.value = false
  }
}

const submitEval = async () => {
  if (!detail.value) return
  evaluating.value = true
  try {
    await evaluateComplaint(detail.value.id, evalForm.rating, evalForm.feedback)
    ElMessage.success('评价提交成功')
    loadDetail()
  } catch (e) {
    // handled
  } finally {
    evaluating.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.detail-page {
  max-width: 1100px;
  margin: 0 auto;
}

.info-card,
.section-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.7;
  color: #606266;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.handler {
  color: #909399;
  font-size: 13px;
}

.desc {
  margin: 0;
  color: #606266;
  white-space: pre-wrap;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.eval-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eval-feedback {
  color: #606266;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
}
</style>
