<template>
  <div class="page-container" v-if="visit">
    <el-page-header @back="$router.back()" :content="'返回'" style="margin-bottom:16px;">
      <template #content>
        <span style="font-size:20px;font-weight:bold;">就诊详情</span>
      </template>
    </el-page-header>

    <el-descriptions :column="2" border class="detail-desc">
      <el-descriptions-item label="就诊日期">{{ visit.visitDate }}</el-descriptions-item>
      <el-descriptions-item label="医院">{{ visit.hospital }}</el-descriptions-item>
      <el-descriptions-item label="科室">{{ visit.department }}</el-descriptions-item>
      <el-descriptions-item label="主治医生">{{ visit.doctor || '-' }}</el-descriptions-item>
      <el-descriptions-item label="诊断" :span="2">{{ visit.diagnosis }}</el-descriptions-item>
      <el-descriptions-item label="主诉" :span="2">{{ visit.chiefComplaint || '-' }}</el-descriptions-item>
      <el-descriptions-item label="处方/用药" :span="2">
        <div style="white-space:pre-wrap;">{{ visit.prescription || '-' }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="费用">{{ visit.medicalFee ? '¥' + visit.medicalFee : '-' }}</el-descriptions-item>
      <el-descriptions-item label="复诊日期">
        <el-tag v-if="visit.nextVisitDate" type="warning">{{ visit.nextVisitDate }}</el-tag>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ visit.remark || '-' }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { visitApi } from '../api'

const route = useRoute()
const visit = ref(null)

onMounted(async () => {
  const res = await visitApi.get(route.params.id)
  visit.value = res.data
})
</script>

<style scoped>
.detail-desc {
  background: white;
  border-radius: 8px;
}
</style>
