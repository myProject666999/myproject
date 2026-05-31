<template>
  <div class="targets-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>目标管理</span>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建目标
          </el-button>
        </div>
      </template>
      <el-table :data="targets" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="base_url" label="地址" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editTarget(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteTarget(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        style="margin-top: 20px; justify-content: flex-end; display: flex"
        @size-change="loadTargets"
        @current-change="loadTargets"
      />
    </el-card>

    <el-dialog v-model="showCreateDialog" :title="isEdit ? '编辑目标' : '新建目标'" width="600px">
      <el-form :model="targetForm" :rules="targetRules" ref="targetFormRef" label-width="100px">
        <el-form-item label="目标名称" prop="name">
          <el-input v-model="targetForm.name" />
        </el-form-item>
        <el-form-item label="目标地址" prop="base_url">
          <el-input v-model="targetForm.base_url" placeholder="http://example.com" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="targetForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="允许的IP">
          <el-input v-model="targetForm.allowed_ips" placeholder="逗号分隔" />
        </el-form-item>
        <el-form-item label="授权令牌">
          <el-input v-model="targetForm.auth_token" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-radio-group v-model="targetForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTarget">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { targetApi } from '@/api'

const loading = ref(false)
const targets = ref([])
const pagination = ref({ page: 1, size: 10, total: 0 })
const showCreateDialog = ref(false)
const isEdit = ref(false)
const targetFormRef = ref(null)

const targetForm = ref({
  name: '',
  base_url: '',
  description: '',
  allowed_ips: '',
  auth_token: '',
  status: 1
})

const targetRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  base_url: [{ required: true, message: '请输入地址', trigger: 'blur' }]
}

const loadTargets = async () => {
  loading.value = true
  try {
    const res = await targetApi.list({ page: pagination.value.page, page_size: pagination.value.size })
    targets.value = res.list || []
    pagination.value.total = res.total || 0
  } finally {
    loading.value = false
  }
}

const editTarget = (row) => {
  isEdit.value = true
  Object.assign(targetForm.value, row)
  showCreateDialog.value = true
}

const saveTarget = async () => {
  await targetFormRef.value.validate()
  try {
    if (isEdit.value) {
      await targetApi.update(targetForm.value.id, targetForm.value)
      ElMessage.success('更新成功')
    } else {
      await targetApi.create(targetForm.value)
      ElMessage.success('创建成功')
    }
    showCreateDialog.value = false
    loadTargets()
  } catch (e) {
    console.error(e)
  }
}

const deleteTarget = async (row) => {
  await ElMessageBox.confirm('确定删除该目标吗？', '提示', { type: 'warning' })
  await targetApi.remove(row.id)
  ElMessage.success('删除成功')
  loadTargets()
}

onMounted(loadTargets)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
