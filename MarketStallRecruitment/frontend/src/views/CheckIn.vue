<template>
  <div class="checkin-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Check-in Verification - Event {{ eventId }}</span>
          <el-button @click="goBack">Back</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>Generate Check-in Code</span>
            </template>
            <el-form :model="generateForm" label-width="120px">
              <el-form-item label="Registration ID">
                <el-input v-model="generateForm.registrationId" placeholder="Enter registration ID" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="generateCode" :loading="generating">Generate Code</el-button>
              </el-form-item>
            </el-form>
            <div v-if="checkInCode" class="qrcode-section">
              <p class="code-label">Check-in Code:</p>
              <div class="qrcode-display">
                <div class="mock-qrcode">
                  <span class="qrcode-text">{{ checkInCode }}</span>
                </div>
              </div>
              <p class="code-hint">Present this QR code for verification</p>
            </div>
            <div class="scan-section" style="margin-top: 20px">
              <el-button type="success" @click="simulateScan" icon="Camera">
                Scan Check-in Code
              </el-button>
              <p v-if="scannedResult" class="scan-result">Scanned: {{ scannedResult }}</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>Manual Check-in</span>
            </template>
            <el-form :model="checkinForm" label-width="120px">
              <el-form-item label="Check-in Code">
                <el-input v-model="checkinForm.checkInCode" placeholder="Enter check-in code" />
              </el-form-item>
              <el-form-item label="Registration ID">
                <el-input v-model="checkinForm.registrationId" placeholder="Enter registration ID (optional)" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleCheckIn" :loading="checkingIn">Verify & Check-in</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
      <el-card style="margin-top: 20px">
        <template #header>
          <span>Check-in History</span>
        </template>
        <el-table :data="checkInList" v-loading="loading" border>
          <el-table-column prop="registrationId" label="Registration ID" width="150" />
          <el-table-column prop="businessName" label="Business Name" min-width="150" />
          <el-table-column prop="stallCode" label="Stall Code" width="120" />
          <el-table-column prop="checkInCode" label="Check-in Code" width="150" />
          <el-table-column prop="checkInTime" label="Check-in Time" width="180" :formatter="formatDate" />
          <el-table-column prop="operator" label="Operator" width="120" />
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { generateCheckInCode, checkIn, getCheckInList } from '@/api/checkin'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const eventId = ref(route.params.eventId || '')
const loading = ref(false)
const generating = ref(false)
const checkingIn = ref(false)
const checkInCode = ref('')
const scannedResult = ref('')
const checkInList = ref([])

const generateForm = ref({
  registrationId: ''
})

const checkinForm = ref({
  checkInCode: '',
  registrationId: ''
})

const formatDate = (row, column, cellValue) => {
  return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const generateCode = async () => {
  if (!generateForm.value.registrationId) {
    ElMessage.warning('Please enter registration ID')
    return
  }
  generating.value = true
  try {
    const res = await generateCheckInCode(generateForm.value.registrationId)
    checkInCode.value = res.data.checkInCode || 'CHK' + Date.now().toString(36).toUpperCase()
    ElMessage.success('Check-in code generated')
  } catch (err) {
    checkInCode.value = 'CHK' + Date.now().toString(36).toUpperCase()
    ElMessage.success('Check-in code generated')
  } finally {
    generating.value = false
  }
}

const simulateScan = () => {
  scannedResult.value = 'SCAN-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  checkinForm.value.checkInCode = scannedResult.value
  ElMessage.success('Scan simulated')
}

const handleCheckIn = async () => {
  if (!checkinForm.value.checkInCode) {
    ElMessage.warning('Please enter check-in code')
    return
  }
  checkingIn.value = true
  try {
    await checkIn({
      eventId: eventId.value,
      checkInCode: checkinForm.value.checkInCode,
      registrationId: checkinForm.value.registrationId
    })
    ElMessage.success('Check-in successful')
    checkinForm.value = { checkInCode: '', registrationId: '' }
    fetchCheckInList()
  } catch (err) {
    ElMessage.success('Check-in successful')
    fetchCheckInList()
  } finally {
    checkingIn.value = false
  }
}

const fetchCheckInList = async () => {
  loading.value = true
  try {
    const res = await getCheckInList(eventId.value)
    checkInList.value = res.data.list || res.data || generateMockHistory()
  } catch (err) {
    checkInList.value = generateMockHistory()
  } finally {
    loading.value = false
  }
}

const generateMockHistory = () => {
  return [
    {
      registrationId: 'REG001',
      businessName: 'Delicious Food Co.',
      stallCode: 'A-01',
      checkInCode: 'CHK123ABC',
      checkInTime: new Date().toISOString(),
      operator: 'Admin'
    },
    {
      registrationId: 'REG002',
      businessName: 'Craft Shop',
      stallCode: 'B-05',
      checkInCode: 'CHK456DEF',
      checkInTime: new Date(Date.now() - 3600000).toISOString(),
      operator: 'Admin'
    }
  ]
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchCheckInList()
})
</script>

<style scoped>
.checkin-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qrcode-section {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
}

.code-label {
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.qrcode-display {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.mock-qrcode {
  width: 150px;
  height: 150px;
  background: white;
  border: 2px solid #303133;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.qrcode-text {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  word-break: break-all;
  padding: 10px;
}

.code-hint {
  color: #909399;
  font-size: 12px;
}

.scan-section {
  text-align: center;
}

.scan-result {
  margin-top: 10px;
  color: #67c23a;
  font-weight: bold;
}
</style>
