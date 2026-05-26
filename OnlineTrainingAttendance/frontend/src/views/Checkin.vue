<template>
  <div class="checkin-page">
    <el-page-header :content="training.name || '签到'" @back="goBack">
      <template #content>
        <span>{{ training.name || '培训班签到' }}</span>
      </template>
    </el-page-header>

    <el-row :gutter="20" class="content">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="qrcode-card">
          <template #header>
            <div class="card-header">
              <span>签到二维码</span>
              <el-tag :type="activeSession ? 'success' : 'info'" size="small">
                {{ activeSession ? '签到进行中' : '暂无签到' }}
              </el-tag>
            </div>
          </template>
          <div class="qrcode-wrap">
            <div class="qrcode-box">
              <img
                v-if="qrImage"
                :src="qrImage"
                alt="签到二维码"
                class="qrcode-img"
              />
              <el-icon v-else :size="120" color="#c0c4cc"><Connection /></el-icon>
            </div>
            <p v-if="activeSession" class="session-info">
              学员请使用 App 扫描此二维码完成签到
            </p>
            <p v-else class="session-info">
              点击下方按钮发起一次新的签到
            </p>
            <div class="session-actions">
              <el-button
                v-if="!activeSession"
                type="primary"
                :icon="VideoPlay"
                :loading="creating"
                @click="createSession"
              >
                发起签到
              </el-button>
              <el-button
                v-else
                type="danger"
                :icon="VideoPause"
                @click="deactivateSession"
              >
                结束签到
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="form-card">
          <template #header>
            <span>手动签到</span>
          </template>
          <el-form
            ref="manualFormRef"
            :model="manualForm"
            :rules="manualRules"
            label-width="90px"
          >
            <el-form-item label="学员" prop="studentId">
              <el-select
                v-model="manualForm.studentId"
                filterable
                placeholder="请选择学员"
                style="width: 100%"
              >
                <el-option
                  v-for="s in students"
                  :key="s.id"
                  :label="`${s.name} (${s.idCard || ''})`"
                  :value="s.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="manualForm.remark"
                type="textarea"
                :rows="3"
                placeholder="可选"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="checkingIn" @click="submitCheckin">
                确认签到
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" class="stats-card">
          <template #header>
            <span>签到统计</span>
          </template>
          <el-row :gutter="12">
            <el-col :span="8">
              <el-statistic title="应到人数" :value="stats.total || 0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="实到人数" :value="stats.checked || 0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="出勤率" :value="stats.rate || 0" suffix="%" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import QRCode from 'qrcode'
import { getTrainingById, generateTrainingQrcode } from '@/api/training'
import {
  createCheckinSession,
  deactivateCheckinSession,
  getActiveCheckinSessions,
  manualCheckin
} from '@/api/attendance'
import { getStudentList } from '@/api/student'

const route = useRoute()
const router = useRouter()
const trainingId = computed(() => Number(route.params.id))

const training = ref({})
const activeSession = ref(null)
const qrImage = ref('')
const creating = ref(false)
const checkingIn = ref(false)
const students = ref([])
const stats = reactive({ total: 0, checked: 0, rate: 0 })

const manualFormRef = ref(null)
const manualForm = reactive({
  studentId: null,
  remark: ''
})
const manualRules = {
  studentId: [
    { required: true, message: '请选择学员', trigger: 'change' }
  ]
}

const loadTraining = async () => {
  try {
    const res = await getTrainingById(trainingId.value)
    training.value = res.data || {}
    if (training.value.qrCode) {
      qrImage.value = await QRCode.toDataURL(training.value.qrCode)
    }
  } catch (e) {
    training.value = { id: trainingId.value, name: '培训班' }
  }
}

const loadActiveSession = async () => {
  try {
    const res = await getActiveCheckinSessions(trainingId.value)
    const list = res.data || []
    activeSession.value = list[0] || null
    if (activeSession.value?.sessionToken) {
      qrImage.value = await QRCode.toDataURL(activeSession.value.sessionToken)
    }
  } catch (e) {
    activeSession.value = null
  }
}

const loadStudents = async () => {
  try {
    const res = await getStudentList()
    students.value = res.data || []
  } catch (e) {
    students.value = []
  }
}

const createSession = async () => {
  creating.value = true
  try {
    const res = await createCheckinSession({ trainingId: trainingId.value })
    activeSession.value = res.data || null
    if (activeSession.value?.sessionToken) {
      qrImage.value = await QRCode.toDataURL(activeSession.value.sessionToken)
    }
    ElMessage.success('签到已发起')
  } catch (e) {
    ElMessage.error('发起签到失败')
  } finally {
    creating.value = false
  }
}

const deactivateSession = async () => {
  if (!activeSession.value) return
  try {
    await deactivateCheckinSession(activeSession.value.id)
    activeSession.value = null
    ElMessage.success('签到已结束')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const submitCheckin = () => {
  manualFormRef.value.validate(async (valid) => {
    if (!valid) return
    checkingIn.value = true
    try {
      await manualCheckin({
        trainingId: trainingId.value,
        studentId: manualForm.studentId,
        remark: manualForm.remark
      })
      ElMessage.success('签到成功')
      resetForm()
    } catch (e) {
      ElMessage.error('签到失败')
    } finally {
      checkingIn.value = false
    }
  })
}

const resetForm = () => {
  manualFormRef.value?.resetFields()
  manualForm.studentId = null
  manualForm.remark = ''
}

const goBack = () => {
  router.push('/home/training')
}

onMounted(() => {
  loadTraining()
  loadActiveSession()
  loadStudents()
})
</script>

<style scoped>
.checkin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.content {
  row-gap: 16px;
}
.qrcode-card,
.form-card,
.stats-card {
  border-radius: 8px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.qrcode-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}
.qrcode-box {
  width: 220px;
  height: 220px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}
.qrcode-img {
  width: 200px;
  height: 200px;
}
.session-info {
  color: #909399;
  margin: 0;
  font-size: 14px;
}
.session-actions {
  display: flex;
  gap: 12px;
}
.stats-card {
  margin-top: 16px;
}
</style>
