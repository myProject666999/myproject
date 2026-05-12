<template>
  <div class="records-table">
    <el-table :data="data" border stripe v-loading="loading">
      <el-table-column label="类型" width="100">
        <template #default="scope">
          <el-tag :type="getTypeColor(scope.row.reminderType)">
            {{ getTypeText(scope.row.reminderType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
      <el-table-column prop="reminderTime" label="提醒时间" width="170" />
      <el-table-column label="发送状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.sendStatus ? 'success' : 'warning'">
            {{ scope.row.sendStatus ? '已发送' : '待发送' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="读取状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.readStatus ? 'info' : 'danger'">
            {{ scope.row.readStatus ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPatientReminders } from '../../../api'

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
    const res = await getPatientReminders(props.patientId)
    data.value = res.data || []
  } finally {
    loading.value = false
  }
}

const getTypeText = (type) => {
  const map = {
    APPOINTMENT: '预约提醒',
    TREATMENT: '治疗复查'
  }
  return map[type] || type
}

const getTypeColor = (type) => {
  return type === 'APPOINTMENT' ? 'primary' : 'warning'
}

watch(() => props.patientId, () => loadData())

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.records-table {
  margin-top: 15px;
}
</style>
