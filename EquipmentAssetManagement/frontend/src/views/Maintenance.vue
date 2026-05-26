<template>
  <div class="maintenance-page">
    <div class="page-header">
      <h2 class="page-title">维修管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增报修
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="待处理" value="PENDING" />
            <el-option label="处理中" value="PROCESSING" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadMaintenance">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="maintenanceList" v-loading="loading">
        <el-table-column prop="asset_code" label="资产编号" width="120" />
        <el-table-column prop="asset_name" label="资产名称" min-width="150" />
        <el-table-column prop="fault_description" label="故障描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="report_date" label="报修日期" width="120" />
        <el-table-column prop="reporter_name" label="报修人" width="100" />
        <el-table-column prop="maintenance_type" label="维修类型" width="100">
          <template #default="{ row }">
            {{ row.maintenance_type === 'INTERNAL' ? '内部维修' : '外部维修' }}
          </template>
        </el-table-column>
        <el-table-column prop="maintenance_cost" label="维修费用" width="100">
          <template #default="{ row }">
            {{ row.maintenance_cost ? '¥' + row.maintenance_cost : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'PENDING'"
              type="primary" 
              link 
              @click="openProcessDialog(row)"
            >
              处理
            </el-button>
            <el-button 
              v-if="row.status === 'PROCESSING'"
              type="success" 
              link 
              @click="openCompleteDialog(row)"
            >
              完成
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadMaintenance"
        @current-change="loadMaintenance"
      />
    </el-card>

    <el-dialog v-model="addDialogVisible" title="新增报修" width="600px">
      <el-form :model="repairForm" :rules="rules" ref="repairFormRef" label-width="100px">
        <el-form-item label="选择资产" prop="asset_id">
          <el-select v-model="repairForm.asset_id" style="width: 100%" filterable>
            <el-option 
              v-for="asset in availableAssets" 
              :key="asset.id" 
              :label="`${asset.asset_code} - ${asset.name}`" 
              :value="asset.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="故障描述" prop="fault_description">
          <el-input v-model="repairForm.fault_description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="报修日期" prop="report_date">
          <el-date-picker v-model="repairForm.report_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="报修人" prop="reporter_id">
          <el-select v-model="repairForm.reporter_id" style="width: 100%">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修类型" prop="maintenance_type">
          <el-radio-group v-model="repairForm.maintenance_type">
            <el-radio value="INTERNAL">内部维修</el-radio>
            <el-radio value="EXTERNAL">外部维修</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="repairForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRepair">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="processDialogVisible" title="处理维修" width="500px">
      <el-form :model="processForm" :rules="processRules" ref="processFormRef" label-width="100px">
        <el-form-item label="维修人员">
          <el-input v-model="processForm.maintenance_person" />
        </el-form-item>
        <el-form-item label="维修日期">
          <el-date-picker v-model="processForm.maintenance_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="维修内容">
          <el-input v-model="processForm.maintenance_content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="维修费用">
          <el-input-number v-model="processForm.maintenance_cost" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">开始处理</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="completeDialogVisible" title="完成维修" width="500px">
      <el-form :model="completeForm" :rules="completeRules" ref="completeFormRef" label-width="100px">
        <el-form-item label="完成日期" prop="completed_date">
          <el-date-picker v-model="completeForm.completed_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="completeForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComplete">确认完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { maintenance as maintenanceApi, assets as assetsApi, users as usersApi } from '../api'

const loading = ref(false)
const maintenanceList = ref([])
const availableAssets = ref([])
const users = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filterForm = reactive({
  status: ''
})

const getStatusType = (status) => {
  const types = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return texts[status] || status
}

const loadMaintenance = async () => {
  loading.value = true
  try {
    const res = await maintenanceApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      status: filterForm.status
    })
    if (res.code === 200) {
      maintenanceList.value = res.data
      total.value = res.total
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadAvailableAssets = async () => {
  try {
    const res = await assetsApi.getList({ page: 1, pageSize: 1000 })
    if (res.code === 200) {
      availableAssets.value = res.data.filter(a => a.status !== 'SCRAPPED' && a.status !== 'LOST')
    }
  } catch (error) {
    console.error('加载资产失败', error)
  }
}

const loadUsers = async () => {
  try {
    const res = await usersApi.getList()
    if (res.code === 200) {
      users.value = res.data
    }
  } catch (error) {
    console.error('加载用户失败', error)
  }
}

const resetFilter = () => {
  filterForm.status = ''
  page.value = 1
  loadMaintenance()
}

const addDialogVisible = ref(false)
const repairFormRef = ref(null)
const repairForm = reactive({
  asset_id: '',
  fault_description: '',
  report_date: '',
  reporter_id: '',
  maintenance_type: 'INTERNAL',
  remarks: ''
})

const rules = {
  asset_id: [{ required: true, message: '请选择资产', trigger: 'change' }],
  fault_description: [{ required: true, message: '请输入故障描述', trigger: 'blur' }],
  report_date: [{ required: true, message: '请选择报修日期', trigger: 'change' }],
  reporter_id: [{ required: true, message: '请选择报修人', trigger: 'change' }]
}

const processDialogVisible = ref(false)
const processFormRef = ref(null)
const currentRecord = ref(null)
const processForm = reactive({
  maintenance_person: '',
  maintenance_date: '',
  maintenance_content: '',
  maintenance_cost: 0
})

const processRules = {}

const completeDialogVisible = ref(false)
const completeFormRef = ref(null)
const completeForm = reactive({
  completed_date: '',
  remarks: ''
})

const completeRules = {
  completed_date: [{ required: true, message: '请选择完成日期', trigger: 'change' }]
}

const openAddDialog = () => {
  Object.keys(repairForm).forEach(key => {
    repairForm[key] = key === 'maintenance_type' ? 'INTERNAL' : ''
  })
  loadAvailableAssets()
  addDialogVisible.value = true
}

const submitRepair = async () => {
  if (!repairFormRef.value) return
  await repairFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await maintenanceApi.create(repairForm)
        if (res.code === 200) {
          ElMessage.success('报修成功')
          addDialogVisible.value = false
          loadMaintenance()
        }
      } catch (error) {
        ElMessage.error(error.message || '报修失败')
      }
    }
  })
}

const openProcessDialog = (row) => {
  currentRecord.value = row
  Object.keys(processForm).forEach(key => {
    processForm[key] = key === 'maintenance_cost' ? 0 : ''
  })
  processDialogVisible.value = true
}

const submitProcess = async () => {
  try {
    const res = await maintenanceApi.process(currentRecord.value.id, processForm)
    if (res.code === 200) {
      ElMessage.success('处理成功')
      processDialogVisible.value = false
      loadMaintenance()
    }
  } catch (error) {
    ElMessage.error(error.message || '处理失败')
  }
}

const openCompleteDialog = (row) => {
  currentRecord.value = row
  completeForm.completed_date = ''
  completeForm.remarks = ''
  completeDialogVisible.value = true
}

const submitComplete = async () => {
  if (!completeFormRef.value) return
  await completeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await maintenanceApi.complete(currentRecord.value.id, completeForm)
        if (res.code === 200) {
          ElMessage.success('维修完成')
          completeDialogVisible.value = false
          loadMaintenance()
        }
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

onMounted(() => {
  loadMaintenance()
  loadUsers()
})
</script>

<style scoped>
.maintenance-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
