<template>
  <div class="records-table">
    <el-table :data="data" border stripe v-loading="loading">
      <el-table-column prop="recordNo" label="记录编号" width="150" />
      <el-table-column prop="diagnosis" label="诊断" show-overflow-tooltip />
      <el-table-column prop="treatmentContent" label="治疗内容" show-overflow-tooltip />
      <el-table-column prop="toothPositions" label="涉及牙位" width="150" />
      <el-table-column label="费用" width="120">
        <template #default="scope">
          ¥{{ scope.row.amount || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="付款状态" width="100">
        <template #default="scope">
          <el-tag :type="getPaymentStatusType(scope.row.paymentStatus)">
            {{ getPaymentStatusText(scope.row.paymentStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPatientTreatmentRecords } from '../../../api'

const props = defineProps({
  patientId: {
    type: Number,
    required: true
  }
})

const loading = ref(false)
const data = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPatientTreatmentRecords(props.patientId)
    data.value = res.data || []
  } finally {
    loading.value = false
  }
}

const getPaymentStatusType = (status) => {
  const map = {
    UNPAID: 'danger',
    PARTIAL: 'warning',
    PAID: 'success'
  }
  return map[status] || 'info'
}

const getPaymentStatusText = (status) => {
  const map = {
    UNPAID: '未付款',
    PARTIAL: '部分付款',
    PAID: '已付清'
  }
  return map[status] || status
}

watch(() => props.patientId, () => loadData())

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.records-table {
  margin-top: 15px;
}
</style>
