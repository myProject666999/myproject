<template>
  <div class="records-table">
    <el-table :data="data" border stripe v-loading="loading">
      <el-table-column prop="appointmentNo" label="预约号" width="150" />
      <el-table-column prop="appointmentDate" label="预约日期" width="120" />
      <el-table-column prop="appointmentTime" label="预约时间" width="100" />
      <el-table-column prop="serviceType" label="服务类型" width="120" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
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
import { getPatientAppointments } from '../../../api'

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
    const res = await getPatientAppointments(props.patientId)
    data.value = res.data || []
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const map = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
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
