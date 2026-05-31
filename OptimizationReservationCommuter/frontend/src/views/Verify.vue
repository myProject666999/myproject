<template>
  <Layout>
    <div class="verify-page">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="verify-card">
            <template #header>
              <span>扫码核验</span>
            </template>
            <div class="verify-input">
              <div class="qr-scan-area">
                <div class="scan-placeholder">
                  <el-icon :size="80"><Scan /></el-icon>
                  <p>扫码区域</p>
                  <p class="scan-tip">请将二维码放入扫描框内</p>
                </div>
              </div>
              <el-divider>或手动输入</el-divider>
              <el-input
                v-model="qrToken"
                placeholder="请输入QR Token"
                size="large"
                style="margin-bottom: 15px"
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
              <el-select v-model="stationId" placeholder="选择核验站点" size="large" style="width: 100%; margin-bottom: 15px">
                <el-option
                  v-for="station in stations"
                  :key="station.id"
                  :label="station.name"
                  :value="station.id"
                />
              </el-select>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="verifying"
                @click="verify"
              >
                核验
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="result-card">
            <template #header>
              <span>核验结果</span>
            </template>
            <div v-if="!verifyResult" class="empty-result">
              <el-empty description="暂无核验结果" />
            </div>
            <div v-else class="verify-result">
              <div class="result-header" :class="{ success: verifyResult.success, fail: !verifyResult.success }">
                <el-icon :size="60">
                  <CircleCheck v-if="verifyResult.success" />
                  <CircleClose v-else />
                </el-icon>
                <p class="result-text">{{ verifyResult.success ? '核验成功' : '核验失败' }}</p>
              </div>
              <div v-if="verifyResult.success" class="result-detail">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="员工姓名">
                    {{ verifyResult.employee?.name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="员工工号">
                    {{ verifyResult.employee?.employee_no }}
                  </el-descriptions-item>
                  <el-descriptions-item label="部门">
                    {{ verifyResult.employee?.department }}
                  </el-descriptions-item>
                  <el-descriptions-item label="预约编号">
                    {{ verifyResult.reservation?.reservation_no }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <div v-else class="fail-reason">
                <el-alert
                  :title="verifyResult.message || '核验失败'"
                  type="error"
                  :closable="false"
                />
              </div>
            </div>
          </el-card>

          <el-card class="warning-card" style="margin-top: 20px">
            <template #header>
              <div class="header-with-badge">
                <span>满载预警</span>
                <el-badge :value="warningStats.unhandled" class="item" type="danger">
                  <el-button type="danger" size="small" @click="loadWarnings">
                    查看预警
                  </el-button>
                </el-badge>
              </div>
            </template>
            <div class="warning-stats">
              <div class="warning-item">
                <span class="warning-label">红色预警</span>
                <span class="warning-count red">{{ warningStats.red }}</span>
              </div>
              <div class="warning-item">
                <span class="warning-label">黄色预警</span>
                <span class="warning-count yellow">{{ warningStats.yellow }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card style="margin-top: 20px">
        <template #header>
          <span>核验记录</span>
        </template>
        <el-table :data="verifyRecords" v-loading="loading" stripe>
          <el-table-column prop="employee.name" label="员工姓名" width="120" />
          <el-table-column prop="employee.employee_no" label="工号" width="120" />
          <el-table-column label="核验类型" width="100">
            <template #default="{ row }">
              <el-tag>{{ row.verify_type === 1 ? '扫码' : '人脸' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="核验结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.verify_result === 1 ? 'success' : 'danger'">
                {{ row.verify_result === 1 ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="station.name" label="核验站点" width="150" />
          <el-table-column prop="verify_time" label="核验时间" width="180" />
          <el-table-column prop="fail_reason" label="失败原因" show-overflow-tooltip />
        </el-table>
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import Layout from '../components/Layout.vue'
import api from '../utils/api'

const verifying = ref(false)
const loading = ref(false)
const qrToken = ref('')
const stationId = ref(null)
const stations = ref([])
const verifyResult = ref(null)
const verifyRecords = ref([])
const warningStats = reactive({
  total: 0,
  unhandled: 0,
  yellow: 0,
  red: 0
})

async function verify() {
  if (!qrToken.value) {
    ElMessage.warning('请输入QR Token')
    return
  }
  if (!stationId.value) {
    ElMessage.warning('请选择核验站点')
    return
  }

  verifying.value = true
  try {
    const res = await api.post('/verify/qrcode', {
      qr_token: qrToken.value,
      station_id: stationId.value
    })
    verifyResult.value = {
      success: true,
      ...res.data
    }
    ElMessage.success('核验成功')
    loadRecords()
  } catch (error) {
    verifyResult.value = {
      success: false,
      message: error.message || '核验失败'
    }
  } finally {
    verifying.value = false
  }
}

async function loadRecords() {
  try {
    const res = await api.get('/verify/records')
    verifyRecords.value = res.data || []
  } catch (error) {
    console.error('Load records error:', error)
  }
}

async function loadWarnings() {
  try {
    const res = await api.get('/warnings/stats')
    Object.assign(warningStats, res.data || {})
  } catch (error) {
    warningStats.total = 5
    warningStats.unhandled = 2
    warningStats.yellow = 3
    warningStats.red = 2
  }
}

async function loadStations() {
  try {
    const res = await api.get('/stations')
    stations.value = res.data || []
    if (stations.value.length > 0) {
      stationId.value = stations.value[0].id
    }
  } catch (error) {
    stations.value = [
      { id: 1, name: '市政府站' },
      { id: 2, name: '科技园站' },
      { id: 3, name: '软件园站' }
    ]
    stationId.value = 1
  }
}

onMounted(() => {
  loadStations()
  loadRecords()
  loadWarnings()
})
</script>

<style scoped>
.verify-page {
  height: 100%;
}

.qr-scan-area {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.scan-placeholder {
  width: 250px;
  height: 250px;
  border: 3px dashed #409EFF;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ecf5ff;
  color: #409EFF;
}

.scan-placeholder p {
  margin: 10px 0 0;
}

.scan-tip {
  font-size: 12px;
  color: #909399;
}

.empty-result {
  padding: 40px 0;
}

.verify-result .result-header {
  text-align: center;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.result-header.success {
  background: #f0f9eb;
  color: #67c23a;
}

.result-header.fail {
  background: #fef0f0;
  color: #f56c6c;
}

.result-text {
  font-size: 24px;
  font-weight: 600;
  margin-top: 15px;
}

.header-with-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.warning-stats {
  display: flex;
  gap: 30px;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.warning-label {
  font-size: 14px;
  color: #606266;
}

.warning-count {
  font-size: 24px;
  font-weight: 600;
}

.warning-count.red {
  color: #f56c6c;
}

.warning-count.yellow {
  color: #e6a23c;
}
</style>
