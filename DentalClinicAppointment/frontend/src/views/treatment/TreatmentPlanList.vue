<template>
  <div class="plan-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>治疗计划管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增计划
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已付清" value="PAID" />
            <el-option label="已完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="planNo" label="计划编号" width="150" />
        <el-table-column prop="patientId" label="患者ID" width="80" />
        <el-table-column prop="doctorId" label="医生ID" width="80" />
        <el-table-column prop="diagnosis" label="诊断" show-overflow-tooltip />
        <el-table-column prop="toothPositions" label="涉及牙位" width="150" />
        <el-table-column label="进度" width="120">
          <template #default="scope">
            <el-progress :percentage="Math.round(scope.row.currentStage / scope.row.totalStages * 100)">
              <template #default>
                {{ scope.row.currentStage || 0 }}/{{ scope.row.totalStages || 1 }}
              </template>
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column label="费用" width="180">
          <template #default="scope">
            <span>已付: ¥{{ scope.row.paidAmount || 0 }}</span>
            <br />
            <span>总计: ¥{{ scope.row.totalAmount || 0 }}</span>
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="患者" prop="patientId">
              <el-select v-model="form.patientId" placeholder="请选择患者" filterable style="width: 100%">
                <el-option v-for="patient in patients" :key="patient.id" :label="patient.name" :value="patient.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医生" prop="doctorId">
              <el-select v-model="form.doctorId" placeholder="请选择医生" style="width: 100%">
                <el-option v-for="doctor in doctors" :key="doctor.id" :label="doctor.name" :value="doctor.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总阶段数" prop="totalStages">
              <el-input-number v-model="form.totalStages" :min="1" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前阶段" prop="currentStage">
              <el-input-number v-model="form.currentStage" :min="0" :max="form.totalStages" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总金额" prop="totalAmount">
              <el-input-number v-model="form.totalAmount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="涉及牙位">
              <el-input v-model="form.toothPositions" placeholder="如:11,12,21" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计开始日期" prop="expectedStartDate">
              <el-date-picker
                v-model="form.expectedStartDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计结束日期" prop="expectedEndDate">
              <el-date-picker
                v-model="form.expectedEndDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="诊断" prop="diagnosis">
              <el-input v-model="form.diagnosis" placeholder="请输入诊断" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="治疗内容" prop="treatmentContent">
              <el-input
                v-model="form.treatmentContent"
                type="textarea"
                :rows="3"
                placeholder="请输入治疗内容"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="进行中" value="IN_PROGRESS" />
                <el-option label="已付清" value="PAID" />
                <el-option label="已完成" value="COMPLETED" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTreatmentPlans, createTreatmentPlan, updateTreatmentPlan, deleteTreatmentPlan, getPatients, getDoctors } from '../../api'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增治疗计划')
const isEdit = ref(false)
const formRef = ref()

const searchForm = reactive({
  status: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const patients = ref([])
const doctors = ref([])

const form = reactive({
  id: null,
  patientId: null,
  doctorId: null,
  clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1,
  diagnosis: '',
  treatmentContent: '',
  toothPositions: '',
  totalStages: 1,
  currentStage: 0,
  totalAmount: 0,
  expectedStartDate: '',
  expectedEndDate: '',
  status: 'IN_PROGRESS'
})

const rules = {
  patientId: [{ required: true, message: '请选择患者', trigger: 'change' }],
  doctorId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  diagnosis: [{ required: true, message: '请输入诊断', trigger: 'blur' }],
  totalStages: [{ required: true, message: '请输入总阶段数', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      status: searchForm.status,
      clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1
    }
    const res = await getTreatmentPlans(params)
    tableData.value = res.data.records
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const loadPatients = async () => {
  try {
    const res = await getPatients({ current: 1, size: 1000, clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1 })
    patients.value = res.data.records
  } catch (e) {
    console.error(e)
  }
}

const loadDoctors = async () => {
  try {
    const res = await getDoctors(userStore.clinicId ? parseInt(userStore.clinicId) : 1)
    doctors.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const resetSearch = () => {
  searchForm.status = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增治疗计划'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑治疗计划'
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该治疗计划吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await deleteTreatmentPlan(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    patientId: null,
    doctorId: null,
    clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1,
    diagnosis: '',
    treatmentContent: '',
    toothPositions: '',
    totalStages: 1,
    currentStage: 0,
    totalAmount: 0,
    expectedStartDate: '',
    expectedEndDate: '',
    status: 'IN_PROGRESS'
  })
}

const handleSubmit = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateTreatmentPlan(form)
    ElMessage.success('更新成功')
  } else {
    await createTreatmentPlan(form)
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  loadData()
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

onMounted(() => {
  loadData()
  loadPatients()
  loadDoctors()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
