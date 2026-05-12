<template>
  <div class="records-table">
    <el-table :data="data" border stripe v-loading="loading">
      <el-table-column prop="planNo" label="计划编号" width="150" />
      <el-table-column prop="diagnosis" label="诊断" show-overflow-tooltip />
      <el-table-column prop="treatmentContent" label="治疗内容" show-overflow-tooltip />
      <el-table-column prop="toothPositions" label="涉及牙位" width="150" />
      <el-table-column label="进度" width="120">
        <template #default="scope">
          {{ scope.row.currentStage || 0 }}/{{ scope.row.totalStages || 1 }}
        </template>
      </el-table-column>
      <el-table-column label="费用" width="150">
        <template #default="scope">
          ¥{{ scope.row.paidAmount || 0 }} / ¥{{ scope.row.totalAmount || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPatientTreatmentPlans } from '../../../api'

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
    const res = await getPatientTreatmentPlans(props.patientId)
    data.value = res.data || []
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const map = {
    IN_PROGRESS: 'primary',
    PAID: 'success',
    COMPLETED: 'success'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    IN_PROGRESS: '进行中',
    PAID: '已付清',
    COMPLETED: '已完成'
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
