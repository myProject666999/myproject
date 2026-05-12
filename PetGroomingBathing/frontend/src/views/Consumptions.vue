<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px">
      <h2>消费记录管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增记录
      </el-button>
    </div>

    <el-card style="margin-bottom: 20px">
      <h4>营收统计（今日）</h4>
      <el-row :gutter="20">
        <el-col :span="6">
          <div>
            <el-statistic title="消费单数" :value="statistics.totalCount" />
          </div>
        </el-col>
        <el-col :span="6">
          <div>
            <el-statistic title="总金额" :value="statistics.totalAmount" :precision="2" prefix="¥" />
          </div>
        </el-col>
        <el-col :span="6">
          <div>
            <el-statistic title="优惠金额" :value="statistics.totalDiscount" :precision="2" prefix="¥" />
          </div>
        </el-col>
        <el-col :span="6">
          <div>
            <el-statistic title="实收金额" :value="statistics.totalActual" :precision="2" prefix="¥" />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-form :inline="true" style="margin-bottom: 20px">
      <el-form-item label="支付方式">
        <el-select v-model="filterPaymentMethod" placeholder="全部方式" clearable style="width: 150px" @change="loadConsumptions">
          <el-option label="现金" value="cash" />
          <el-option label="微信" value="wechat" />
          <el-option label="支付宝" value="alipay" />
          <el-option label="刷卡" value="card" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="loadConsumptions"
        />
      </el-form-item>
    </el-form>

    <el-table :data="consumptions" border stripe>
      <el-table-column prop="pet.name" label="宠物" width="100" />
      <el-table-column prop="itemName" label="消费项目" width="150" />
      <el-table-column prop="amount" label="原价" width="100">
        <template #default="scope">
          ¥{{ scope.row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="discount" label="优惠" width="100">
        <template #default="scope">
          ¥{{ scope.row.discount || 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="actualAmount" label="实付" width="100">
        <template #default="scope">
          ¥{{ scope.row.actualAmount }}
        </template>
      </el-table-column>
      <el-table-column label="支付方式" width="100">
        <template #default="scope">
          <el-tag :type="getPaymentTagType(scope.row.paymentMethod)">
            {{ getPaymentLabel(scope.row.paymentMethod) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="consumptionTime" label="消费时间" width="170">
        <template #default="scope">
          {{ formatDate(scope.row.consumptionTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="notes" label="备注" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑记录' : '新增记录'"
      width="700px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择宠物" prop="petId">
              <el-select v-model="form.petId" placeholder="请选择宠物" style="width: 100%" filterable>
                <el-option
                  v-for="pet in pets"
                  :key="pet.id"
                  :label="pet.name + ' (' + pet.breed + ')'"
                  :value="pet.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务项目">
              <el-select v-model="form.serviceId" placeholder="可选关联服务" style="width: 100%" clearable @change="handleServiceChange">
                <el-option
                  v-for="service in services"
                  :key="service.id"
                  :label="service.name + ' - ¥' + service.price"
                  :value="service.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="消费项目" prop="itemName">
          <el-input v-model="form.itemName" placeholder="请输入消费项目名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="原价" prop="amount">
              <el-input-number v-model="form.amount" :min="0" :step="1" style="width: 100%" @change="calculateActual" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="优惠">
              <el-input-number v-model="form.discount" :min="0" :step="1" style="width: 100%" @change="calculateActual" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实付金额" prop="actualAmount">
              <el-input-number v-model="form.actualAmount" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-select v-model="form.paymentMethod" placeholder="请选择支付方式" style="width: 100%">
                <el-option label="现金" value="cash" />
                <el-option label="微信" value="wechat" />
                <el-option label="支付宝" value="alipay" />
                <el-option label="刷卡" value="card" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消费时间">
              <el-date-picker
                v-model="form.consumptionTime"
                type="datetime"
                placeholder="选择消费时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConsumptions, createConsumption, updateConsumption, deleteConsumption } from '@/api/consumption'
import { getPets } from '@/api/pet'
import { getServices } from '@/api/service'
import dayjs from 'dayjs'

const consumptions = ref([])
const pets = ref([])
const services = ref([])
const filterPaymentMethod = ref('')
const dateRange = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const statistics = ref({
  totalCount: 0,
  totalAmount: 0,
  totalDiscount: 0,
  totalActual: 0
})

const form = reactive({
  id: '',
  petId: '',
  serviceId: '',
  appointmentId: '',
  itemName: '',
  amount: 0,
  discount: 0,
  actualAmount: 0,
  paymentMethod: 'wechat',
  notes: '',
  consumptionTime: ''
})

const rules = {
  petId: [{ required: true, message: '请选择宠物', trigger: 'change' }],
  itemName: [{ required: true, message: '请输入消费项目', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入原价', trigger: 'blur' }],
  actualAmount: [{ required: true, message: '请输入实付金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

const getPaymentLabel = (method) => {
  const map = { cash: '现金', wechat: '微信', alipay: '支付宝', card: '刷卡' }
  return map[method] || method
}

const getPaymentTagType = (method) => {
  const map = { cash: 'info', wechat: 'success', alipay: 'primary', card: 'warning' }
  return map[method] || 'info'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const resetForm = () => {
  Object.assign(form, {
    id: '',
    petId: '',
    serviceId: '',
    appointmentId: '',
    itemName: '',
    amount: 0,
    discount: 0,
    actualAmount: 0,
    paymentMethod: 'wechat',
    notes: '',
    consumptionTime: ''
  })
}

const calculateActual = () => {
  form.actualAmount = (form.amount || 0) - (form.discount || 0)
}

const handleServiceChange = (serviceId) => {
  if (serviceId) {
    const service = services.value.find(s => s.id === serviceId)
    if (service) {
      form.itemName = service.name
      form.amount = parseFloat(service.price)
      form.discount = 0
      form.actualAmount = form.amount
    }
  }
}

const loadConsumptions = async () => {
  const params = {}
  if (filterPaymentMethod.value) params.paymentMethod = filterPaymentMethod.value
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }
  const data = await getConsumptions(params)
  consumptions.value = data
  
  const today = new Date().toISOString().split('T')[0]
  const todayData = data.filter(item => item.consumptionTime && dayjs(item.consumptionTime).format('YYYY-MM-DD') === today)
  
  statistics.value = {
    totalCount: todayData.length,
    totalAmount: todayData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
    totalDiscount: todayData.reduce((sum, item) => sum + parseFloat(item.discount || 0), 0),
    totalActual: todayData.reduce((sum, item) => sum + parseFloat(item.actualAmount || 0), 0)
  }
}

const loadPets = async () => {
  pets.value = await getPets()
}

const loadServices = async () => {
  services.value = await getServices()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  form.consumptionTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    petId: row.petId,
    serviceId: row.serviceId,
    appointmentId: row.appointmentId,
    itemName: row.itemName,
    amount: parseFloat(row.amount),
    discount: parseFloat(row.discount || 0),
    actualAmount: parseFloat(row.actualAmount),
    paymentMethod: row.paymentMethod,
    notes: row.notes,
    consumptionTime: row.consumptionTime
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该消费记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteConsumption(row.id)
    ElMessage.success('删除成功')
    loadConsumptions()
  }).catch(() => {})
}

const submitForm = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateConsumption(form.id, form)
    ElMessage.success('更新成功')
  } else {
    await createConsumption(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadConsumptions()
}

onMounted(() => {
  loadConsumptions()
  loadPets()
  loadServices()
})
</script>
