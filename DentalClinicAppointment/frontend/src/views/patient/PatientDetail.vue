<template>
  <div class="patient-detail" v-loading="loading">
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>患者基本信息</span>
          <el-button type="primary" link @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon> 返回
          </el-button>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="姓名">{{ patient.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ patient.gender }}</el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ patient.birthDate }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ patient.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ patient.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ patient.idCard || '-' }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="3">{{ patient.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="病史" :span="3">{{ patient.medicalHistory || '-' }}</el-descriptions-item>
        <el-descriptions-item label="过敏史" :span="3">{{ patient.allergyHistory || '-' }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系人">{{ patient.emergencyContact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系电话">{{ patient.emergencyPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="职业">{{ patient.occupation || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="tabs-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="牙位图" name="tooth">
          <ToothChart :patientId="patientId" />
        </el-tab-pane>
        <el-tab-pane label="预约记录" name="appointment">
          <AppointmentRecords :patientId="patientId" />
        </el-tab-pane>
        <el-tab-pane label="治疗计划" name="plan">
          <TreatmentPlans :patientId="patientId" />
        </el-tab-pane>
        <el-tab-pane label="治疗记录" name="record">
          <TreatmentRecords :patientId="patientId" />
        </el-tab-pane>
        <el-tab-pane label="影像资料" name="image">
          <MedicalImages :patientId="patientId" />
        </el-tab-pane>
        <el-tab-pane label="缴费记录" name="payment">
          <PaymentRecords :patientId="patientId" />
        </el-tab-pane>
        <el-tab-pane label="复诊提醒" name="reminder">
          <ReminderRecords :patientId="patientId" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPatient } from '../../api'
import ToothChart from '../../components/ToothChart.vue'
import AppointmentRecords from './components/AppointmentRecords.vue'
import TreatmentPlans from './components/TreatmentPlans.vue'
import TreatmentRecords from './components/TreatmentRecords.vue'
import MedicalImages from './components/MedicalImages.vue'
import PaymentRecords from './components/PaymentRecords.vue'
import ReminderRecords from './components/ReminderRecords.vue'

const route = useRoute()
const patientId = computed(() => parseInt(route.params.id))
const loading = ref(false)
const activeTab = ref('tooth')
const patient = ref({})

const loadPatient = async () => {
  loading.value = true
  try {
    const res = await getPatient(patientId.value)
    patient.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPatient()
})
</script>

<style lang="scss" scoped>
.patient-detail {
  .info-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
