<template>
  <div class="archive-list-page">
    <div class="card">
      <div class="card-title">已归档目标</div>
      <el-table :data="archives" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="目标标题" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="进度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :stroke-width="8"
              :color="getProgressColor(row.progress)"
            />
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="handleRestore(row)">恢复</el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && archives.length === 0" description="暂无已归档目标" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTargetList, deleteTarget, updateTarget } from '@/api/target'

const loading = ref(false)
const archives = ref([])

const getPriorityType = (priority) => {
  const types = { 1: 'danger', 2: 'warning', 3: 'info' }
  return types[priority] || 'info'
}

const getPriorityText = (priority) => {
  const texts = { 1: '高', 2: '中', 3: '低' }
  return texts[priority] || '未知'
}

const getProgressColor = (progress) => {
  if (progress >= 80) return '#10b981'
  if (progress >= 50) return '#3b82f6'
  if (progress >= 20) return '#f59e0b'
  return '#ef4444'
}

const loadData = async () => {
  loading.value = true
  try {
    const list = await getTargetList()
    archives.value = list.filter(t => t.status === 4)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleRestore = async (row) => {
  try {
    await ElMessageBox.confirm('确定要恢复该目标吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateTarget(row.id, { status: 1 })
    ElMessage.success('恢复成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('恢复失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该目标吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    await deleteTarget(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.archive-list-page {
  min-height: 100%;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}
</style>
