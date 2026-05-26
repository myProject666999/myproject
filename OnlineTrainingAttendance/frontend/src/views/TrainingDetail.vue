<template>
  <div class="detail-page">
    <el-page-header :content="training.name || '培训班详情'" @back="goBack" />

    <el-row :gutter="20" class="content">
      <el-col :xs="24" :md="16">
        <el-card shadow="never" class="info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-tag :type="statusTagType(training.status)" size="small">
                {{ statusText(training.status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="培训班名称">
              {{ training.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="讲师">
              {{ training.instructor || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="开始日期">
              {{ training.startDate || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="结束日期">
              {{ training.endDate || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="总学时">
              {{ training.totalHours || 0 }} 小时
            </el-descriptions-item>
            <el-descriptions-item label="最低出勤率">
              {{ training.minAttendanceRate || 0 }}%
            </el-descriptions-item>
            <el-descriptions-item label="培训地点">
              {{ training.location || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(training.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="培训描述" :span="2">
              {{ training.description || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="stats-card">
          <template #header>
            <span>签到统计</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="应到人数" :value="stats.total || 0" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="实到人数" :value="stats.checked || 0" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="出勤率" :value="stats.rate || 0" suffix="%" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="合格人数" :value="stats.passed || 0" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="action-card">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="action-list">
            <el-button
              type="primary"
              :icon="VideoPlay"
              style="width: 100%; margin-bottom: 12px"
              @click="goCheckin"
            >
              发起签到
            </el-button>
            <el-button
              type="success"
              :icon="Medal"
              style="width: 100%; margin-bottom: 12px"
              @click="generateCertificates"
            >
              批量生成证书
            </el-button>
            <el-button
              type="info"
              :icon="DataLine"
              style="width: 100%"
              @click="exportReport"
            >
              导出签到报表
            </el-button>
          </div>
        </el-card>

        <el-card shadow="never" class="qrcode-card">
          <template #header>
            <span>培训班二维码</span>
          </template>
          <div class="qrcode-wrap">
            <img
              v-if="qrImage"
              :src="qrImage"
              alt="培训班二维码"
              class="qrcode-img"
            />
            <el-icon v-else :size="120" color="#c0c4cc"><Connection /></el-icon>
          </div>
          <p class="qrcode-tip">学员扫码可查看培训班信息</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VideoPlay, Medal, DataLine } from '@element-plus/icons-vue'
import QRCode from 'qrcode'
import { getTrainingById, generateTrainingQrcode } from '@/api/training'
import { getAttendanceStatistics } from '@/api/attendance'

const route = useRoute()
const router = useRouter()
const trainingId = computed(() => Number(route.params.id))

const training = ref({})
const qrImage = ref('')
const stats = reactive({
  total: 0,
  checked: 0,
  rate: 0,
  passed: 0
})

const statusText = (s) => {
  if (s === 0) return '未开始'
  if (s === 1) return '进行中'
  if (s === 2) return '已结束'
  return '未知'
}

const statusTagType = (s) => {
  if (s === 0) return 'info'
  if (s === 1) return 'success'
  if (s === 2) return 'warning'
  return ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadTraining = async () => {
  try {
    const res = await getTrainingById(trainingId.value)
    training.value = res.data || {}
    if (training.value.qrCode) {
      qrImage.value = await QRCode.toDataURL(training.value.qrCode)
    }
  } catch (e) {
    ElMessage.error('加载培训班信息失败')
  }
}

const loadStats = async () => {
  try {
    const res = await getAttendanceStatistics(trainingId.value)
    const data = res.data || {}
    stats.total = data.totalStudents || 0
    stats.checked = data.checkedCount || 0
    stats.rate = data.attendanceRate || 0
    stats.passed = data.passedCount || 0
  } catch (e) {
    stats.total = 0
    stats.checked = 0
    stats.rate = 0
    stats.passed = 0
  }
}

const goCheckin = () => {
  router.push(`/home/training/${trainingId.value}/checkin`)
}

const generateCertificates = () => {
  ElMessage.info('批量生成证书功能开发中')
}

const exportReport = () => {
  ElMessage.info('导出报表功能开发中')
}

const goBack = () => {
  router.push('/home/training')
}

onMounted(() => {
  loadTraining()
  loadStats()
})
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.content {
  row-gap: 16px;
}
.info-card,
.stats-card,
.action-card,
.qrcode-card {
  border-radius: 8px;
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 16px;
}
.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.qrcode-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}
.qrcode-img {
  width: 200px;
  height: 200px;
}
.qrcode-tip {
  text-align: center;
  color: #909399;
  margin: 0;
  font-size: 14px;
}
</style>
