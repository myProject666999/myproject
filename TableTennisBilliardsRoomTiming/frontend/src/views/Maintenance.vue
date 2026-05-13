<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备维护记录</span>
          <div class="header-actions">
            <el-button type="primary" @click="addDialogVisible = true" :icon="Plus">
              新建维护
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="records" stripe>
        <el-table-column prop="equipment_name" label="设备名称" />
        <el-table-column prop="table_number" label="关联球台" width="100" />
        <el-table-column prop="issue_description" label="问题描述" show-overflow-tooltip />
        <el-table-column prop="repair_description" label="维修描述" show-overflow-tooltip />
        <el-table-column prop="cost" label="费用" width="100">
          <template #default="{ row }">¥{{ row.cost || 0 }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ { pending: '待处理', repairing: '维修中', completed: '已完成' }[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator_name" label="创建人" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleRecord(row)" v-if="row.status !== 'completed'">
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="addDialogVisible" title="新建维护记录" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="设备名称">
          <el-input v-model="form.equipment_name" placeholder="如：球杆、球台等" />
        </el-form-item>
        <el-form-item label="关联球台">
          <el-select v-model="form.tableId" placeholder="选择球台（可选）" clearable style="width: 100%">
            <el-option v-for="table in tables" :key="table.id" :label="table.table_number" :value="table.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述">
          <el-input v-model="form.issue_description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="处理维护记录" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="维修描述">
          <el-input v-model="editForm.repair_description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="维修费用">
          <el-input-number v-model="editForm.cost" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio label="repairing">维修中</el-radio>
            <el-radio label="completed">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '../utils/api'

const records = ref([])
const tables = ref([])
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

const form = reactive({
  equipment_name: '',
  tableId: null,
  issue_description: ''
})

const editForm = reactive({
  id: null,
  repair_description: '',
  cost: 0,
  status: 'repairing'
})

function getStatusType(status) {
  const map = {
    pending: 'warning',
    repairing: 'primary',
    completed: 'success'
  }
  return map[status] || 'info'
}

async function fetchData() {
  try {
    const [recordsRes, tablesRes] = await Promise.all([
      api.get('/maintenance'),
      api.get('/tables')
    ])
    records.value = recordsRes.data
    tables.value = tablesRes.data
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

async function saveRecord() {
  try {
    await api.post('/maintenance', {
      tableId: form.tableId,
      equipmentName: form.equipment_name,
      issueDescription: form.issue_description
    })
    ElMessage.success('创建成功')
    addDialogVisible.value = false
    Object.assign(form, { equipment_name: '', tableId: null, issue_description: '' })
    fetchData()
  } catch (error) {
    console.error('创建失败:', error)
  }
}

function handleRecord(row) {
  Object.assign(editForm, {
    id: row.id,
    repair_description: row.repair_description || '',
    cost: row.cost || 0,
    status: row.status === 'pending' ? 'repairing' : row.status
  })
  editDialogVisible.value = true
}

async function updateRecord() {
  try {
    await api.put(`/maintenance/${editForm.id}`, editForm)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('更新失败:', error)
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
</style>
