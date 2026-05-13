<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>球台列表</span>
          <div class="header-actions">
            <el-button @click="fetchData" :icon="Refresh">刷新</el-button>
          </div>
        </div>
      </template>
      <el-table :data="tables" stripe>
        <el-table-column prop="table_number" label="球台编号" width="120" />
        <el-table-column prop="type_name" label="球台类型" width="120" />
        <el-table-column prop="hourly_rate" label="每小时费用" width="120">
          <template #default="{ row }">
            ¥{{ row.hourly_rate }}
          </template>
        </el-table-column>
        <el-table-column prop="position" label="位置" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'available'"
              type="primary"
              size="small"
              @click="openTable(row)"
            >
              开台
            </el-button>
            <el-button
              v-else-if="row.status === 'occupied'"
              type="success"
              size="small"
              @click="closeTable(row)"
            >
              结账
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import api from '../utils/api'

const tables = ref([])

function getStatusType(status) {
  const map = {
    available: 'success',
    occupied: 'danger',
    maintenance: 'warning'
  }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = {
    available: '空闲',
    occupied: '使用中',
    maintenance: '维护中'
  }
  return map[status] || status
}

async function fetchData() {
  try {
    const response = await api.get('/tables')
    tables.value = response.data
  } catch (error) {
    console.error('获取球台列表失败:', error)
  }
}

async function openTable(row) {
  try {
    await ElMessageBox.confirm(
      `确定要开台【${row.table_number}】吗？`,
      '开台确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await api.post(`/tables/${row.id}/open`)
    ElMessage.success('开台成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('开台失败:', error)
    }
  }
}

async function closeTable(row) {
  try {
    const result = await api.post(`/tables/${row.id}/close`)
    ElMessageBox.alert(
      `使用时长: ${result.data.duration} 分钟\n费用: ¥${result.data.fee}`,
      '结账成功',
      {
        confirmButtonText: '确定',
        type: 'success'
      }
    )
    fetchData()
  } catch (error) {
    console.error('结账失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>
