<template>
  <div class="alarms-page">
    <el-card>
      <template #header><span>告警中心</span></template>
      <el-table :data="alarms" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type === 'threshold' ? '阈值告警' : row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="row.level === 2 ? 'danger' : 'warning'" size="small">
              {{ row.level === 2 ? '严重' : '警告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="metric" label="指标" width="120" />
        <el-table-column prop="current_value" label="当前值" width="120" />
        <el-table-column prop="message" label="告警消息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleAlarm(row)" v-if="row.status === 0">
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        style="margin-top: 20px; justify-content: flex-end; display: flex"
        @size-change="loadAlarms"
        @current-change="loadAlarms"
      />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { alarmApi } from '@/api'

const loading = ref(false)
const alarms = ref([])
const pagination = ref({ page: 1, size: 10, total: 0 })

const loadAlarms = async () => {
  loading.value = true
  try {
    const res = await alarmApi.list({ page: pagination.value.page, page_size: pagination.value.size })
    alarms.value = res.list || []
    pagination.value.total = res.total || 0
  } finally {
    loading.value = false
  }
}

const handleAlarm = async (row) => {
  await alarmApi.handle(row.id)
  ElMessage.success('已处理')
  loadAlarms()
}

onMounted(loadAlarms)
</script>
