<template>
  <div class="record-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>治疗记录管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增记录
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="付款状态">
          <el-select v-model="searchForm.paymentStatus" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="未付款" value="UNPAID" />
            <el-option label="部分付款" value="PARTIAL" />
            <el-option label="已付清" value="PAID" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="recordNo" label="记录编号" width="150" />
        <el-table-column prop="patientId" label="患者ID" width="80" />
        <el-table-column prop="doctorId" label="医生ID" width="80" />
        <el-table-column prop="diagnosis" label="诊断" show-overflow-tooltip />
        <el-table-column prop="toothPositions" label="涉及牙位" width="150" />
        <el-table-column label="金额" width="100">
          <template #default="scope">
            ¥{{ scope.row.amount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="付款状态" width="100">
          <template #default="scope">
            <el-tag :type="getPaymentStatusType(scope.row.paymentStatus)">
              {{ getPaymentStatusText(scope.row.paymentStatus) }}
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
            <el-form-item label="涉及牙位">
              <el-input v-model="form.toothPositions" placeholder="如:11,12,21" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="金额" prop="amount">
              <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="诊断" prop="diagnosis">
              <el-input v-model="form.diagnosis" placeholder="请输入诊断" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="治疗方案">
              <el-input
                v-model="form.treatmentPlan"
                type="textarea"
                :rows="2"
                placeholder="请输入治疗方案"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="治疗内容">
              <el-input
                v-model="form.treatmentContent"
                type="textarea"
                :rows="3"
                placeholder="请输入治疗内容"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款状态">
              <el-select v-model="form.paymentStatus" placeholder="请选择付款状态" style="width: 100%">
                <el-option label="未付款" value="UNPAID" />
                <el-option label="部分付款" value="PARTIAL" />
                <el-option label="已付清" value="PAID" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注"
              />
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
import { getTreatmentRecords, createTreatmentRecord, updateTreatmentRecord, deleteTreatmentRecord, getPatients, getDoctors } from '../../api'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增治疗记录')
const isEdit = ref(false)
const formRef = ref()

const searchForm = reactive({
  paymentStatus: ''
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
  treatmentPlan: '',
  treatmentContent: '',
  toothPositions: '',
  amount: 0,
  paymentStatus: 'UNPAID',
  remark: ''
})

const rules = {
  patientId: [{ required: true, message: '请选择患者', trigger: 'change' }],
  doctorId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  diagnosis: [{ required: true, message: '请输入诊断', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      paymentStatus: searchForm.paymentStatus
    }
    const res = await getTreatmentRecords(params)
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
  searchForm.paymentStatus = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增治疗记录'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑治疗记录'
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该治疗记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await deleteTreatmentRecord(row.id)
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
    treatmentPlan: '',
    treatmentContent: '',
    toothPositions: '',
    amount: 0,
    paymentStatus: 'UNPAID',
    remark: ''
  })
}

const handleSubmit = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateTreatmentRecord(form)
    ElMessage.success('更新成功')
  } else {
    await createTreatmentRecord(form)
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  loadData()
}

const getPaymentStatusType = (status) => {
  const map = {
    UNPAID: 'danger',
    PARTIAL: 'warning',
    PAID: 'success'
  }
  return map[status] || 'info'
}

const getPaymentStatusText = (status) => {
  const map = {
    UNPAID: '未付款',
    PARTIAL: '部分付款',
    PAID: '已付清'
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
