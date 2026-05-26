<template>
  <div class="endpoint-list">
    <div class="page-header">
      <h2>Endpoint 列表</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建 Endpoint
      </el-button>
    </div>

    <el-table :data="endpoints" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column label="Token" min-width="300">
        <template #default="{ row }">
          <div class="token-cell">
            <code class="token-code">{{ row.token }}</code>
            <el-button
              size="small"
              @click="copyToken(row.token)"
            >
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.active ? 'success' : 'info'">
            {{ row.active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="retention" label="保留期(天)" width="100" />
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button size="small" @click="editEndpoint(row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteEndpoint(row)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && endpoints.length === 0" description="暂无 Endpoint，点击右上角创建" />

    <el-dialog
      v-model="showCreateDialog"
      :title="editingEndpoint ? '编辑 Endpoint' : '创建 Endpoint'"
      width="500px"
    >
      <el-form :model="endpointForm" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="endpointForm.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="endpointForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="保留期">
          <el-input-number
            v-model="endpointForm.retention"
            :min="1"
            :max="365"
            placeholder="保留天数"
          />
          <span style="margin-left: 8px; color: #909399">天</span>
        </el-form-item>
        <el-form-item v-if="editingEndpoint" label="状态">
          <el-switch v-model="endpointForm.active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEndpoint">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { endpointApi } from '../api'

const router = useRouter()
const loading = ref(false)
const endpoints = ref([])
const showCreateDialog = ref(false)
const editingEndpoint = ref(null)

const endpointForm = ref({
  name: '',
  description: '',
  retention: 7,
  active: true
})

const loadEndpoints = async () => {
  loading.value = true
  try {
    const res = await endpointApi.list()
    endpoints.value = res.data.data || []
  } catch (error) {
    ElMessage.error('加载 Endpoint 列表失败')
  } finally {
    loading.value = false
  }
}

const copyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token)
    ElMessage.success('Token 已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

const viewDetail = (row) => {
  router.push(`/endpoint/${row.id}`)
}

const editEndpoint = (row) => {
  editingEndpoint.value = row
  endpointForm.value = {
    name: row.name,
    description: row.description,
    retention: row.retention,
    active: row.active
  }
  showCreateDialog.value = true
}

const saveEndpoint = async () => {
  if (!endpointForm.value.name) {
    ElMessage.warning('请输入名称')
    return
  }

  try {
    if (editingEndpoint.value) {
      await endpointApi.update(editingEndpoint.value.id, endpointForm.value)
      ElMessage.success('更新成功')
    } else {
      await endpointApi.create(endpointForm.value)
      ElMessage.success('创建成功')
    }
    showCreateDialog.value = false
    resetForm()
    loadEndpoints()
  } catch (error) {
    ElMessage.error(editingEndpoint.value ? '更新失败' : '创建失败')
  }
}

const deleteEndpoint = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 Endpoint "${row.name}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await endpointApi.delete(row.id)
    ElMessage.success('删除成功')
    loadEndpoints()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const resetForm = () => {
  editingEndpoint.value = null
  endpointForm.value = {
    name: '',
    description: '',
    retention: 7,
    active: true
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadEndpoints()
})
</script>

<style scoped>
.endpoint-list {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.token-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.token-code {
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
