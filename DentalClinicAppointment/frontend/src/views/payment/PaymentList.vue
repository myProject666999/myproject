<template>
  <div class="payment-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>收费管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增收费
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="paymentNo" label="缴费单号" width="180" />
        <el-table-column prop="patientId" label="患者ID" width="100" />
        <el-table-column prop="treatmentPlanId" label="治疗计划ID" width="150" />
        <el-table-column label="金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.amount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="120">
          <template #default="scope">
            {{ getPaymentMethodText(scope.row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column prop="createTime" label="支付时间" width="170" />
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

    <el-dialog v-model="dialogVisible" title="新增收费" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="患者" prop="patientId">
          <el-select v-model="form.patientId" placeholder="请选择患者" filterable style="width: 100%" @change="handlePatientChange">
            <el-option v-for="patient in patients" :key="patient.id" :label="patient.name" :value="patient.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="治疗计划" prop="treatmentPlanId">
          <el-select v-model="form.treatmentPlanId" placeholder="请选择治疗计划" style="width: 100%" :disabled="!form.patientId">
            <el-option v-for="plan in plans" :key="plan.id" :label="`${plan.planNo} - ¥${plan.totalAmount}`" :value="plan.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="请选择支付方式" style="width: 100%">
            <el-option label="现金" value="CASH" />
            <el-option label="刷卡" value="CARD" />
            <el-option label="微信" value="WECHAT" />
            <el-option label="支付宝" value="ALIPAY" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </el-form-item>
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
import { ElMessage } from 'element-plus'
import { getPayments, createPayment, getPatients, getPatientTreatmentPlans } from '../../api'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const patients = ref([])
const plans = ref([])

const form = reactive({
  patientId: null,
  treatmentPlanId: null,
  clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1,
  amount: 0,
  paymentMethod: '',
  remark: '',
  operatorId: userStore.userId ? parseInt(userStore.userId) : null
})

const rules = {
  patientId: [{ required: true, message: '请选择患者', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size
    }
    const res = await getPayments(params)
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

const getPaymentMethodText = (method) => {
  const map = {
    CASH: '现金',
    CARD: '刷卡',
    WECHAT: '微信',
    ALIPAY: '支付宝'
  }
  return map[method] || method
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handlePatientChange = async () => {
  form.treatmentPlanId = null
  plans.value = []
  if (form.patientId) {
    try {
      const res = await getPatientTreatmentPlans(form.patientId)
      plans.value = res.data || []
    } catch (e) {
      console.error(e)
    }
  }
}

const resetForm = () => {
  Object.assign(form, {
    patientId: null,
    treatmentPlanId: null,
    clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1,
    amount: 0,
    paymentMethod: '',
    remark: '',
    operatorId: userStore.userId ? parseInt(userStore.userId) : null
  })
  plans.value = []
}

const handleSubmit = async () => {
  await formRef.value.validate()
  await createPayment(form)
  ElMessage.success('收费成功')
  dialogVisible.value = false
  loadData()
}

onMounted(() => {
  loadData()
  loadPatients()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
