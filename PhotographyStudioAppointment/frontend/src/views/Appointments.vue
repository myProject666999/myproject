<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-input v-model="filter.keyword" placeholder="搜索客户姓名/电话" clearable style="width: 200px" @clear="fetchList" @keyup.enter="fetchList" />
      <el-select v-model="filter.status" placeholder="订单状态" clearable style="width: 150px" @change="fetchList">
        <el-option label="待确认" value="pending" />
        <el-option label="已确认" value="confirmed" />
        <el-option label="拍摄中" value="shooting" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-button type="primary" @click="fetchList">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="success" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增预约
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="客户" width="150">
          <template #default="{ row }">
            <div>{{ row.customer?.name }}</div>
            <div style="color: #909399; font-size: 12px;">{{ row.customer?.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="套餐" width="150">
          <template #default="{ row }">
            {{ row.package?.name }}
          </template>
        </el-table-column>
        <el-table-column label="摄影师" width="100">
          <template #default="{ row }">
            {{ row.photographer?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="化妆师" width="100">
          <template #default="{ row }">
            {{ row.stylist?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="拍摄日期" width="130">
          <template #default="{ row }">
            {{ formatDate(row.shootingDate) }} {{ row.shootingTime || '' }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="success" @click="handleUpdateStatus(row)">状态</el-button>
            <el-button link type="warning" @click="goToPhotos(row)">客片</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="客户" prop="customerId">
                  <el-select
                    v-model="form.customerId"
                    filterable
                    placeholder="选择或添加客户"
                    style="width: 100%"
                    @change="handleCustomerChange"
                  >
                    <el-option
                      v-for="c in customers"
                      :key="c.id"
                      :label="`${c.name} - ${c.phone}`"
                      :value="c.id"
                    />
                  </el-select>
                  <el-button type="text" @click="showCustomerDialog = true" style="margin-top: 8px;">
                    <el-icon><Plus /></el-icon> 新增客户
                  </el-button>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="套餐" prop="packageId">
                  <el-select v-model="form.packageId" placeholder="请选择套餐" style="width: 100%" @change="handlePackageChange">
                    <el-option
                      v-for="p in packages"
                      :key="p.id"
                      :label="`${p.name} - ¥${p.price}`"
                      :value="p.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="摄影师" prop="photographerId">
                  <el-select v-model="form.photographerId" placeholder="请选择摄影师" clearable style="width: 100%">
                    <el-option
                      v-for="p in photographers"
                      :key="p.id"
                      :label="p.name"
                      :value="p.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="化妆师" prop="stylistId">
                  <el-select v-model="form.stylistId" placeholder="请选择化妆师" clearable style="width: 100%">
                    <el-option
                      v-for="s in stylists"
                      :key="s.id"
                      :label="s.name"
                      :value="s.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="拍摄日期" prop="shootingDate">
                  <el-date-picker
                    v-model="form.shootingDate"
                    type="date"
                    placeholder="选择拍摄日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="拍摄时段" prop="shootingTime">
                  <el-select v-model="form.shootingTime" placeholder="请选择时段" clearable style="width: 100%">
                    <el-option label="上午 09:00-12:00" value="09:00-12:00" />
                    <el-option label="下午 14:00-17:00" value="14:00-17:00" />
                    <el-option label="全天" value="全天" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="选片日期" prop="selectDate">
                  <el-date-picker
                    v-model="form.selectDate"
                    type="date"
                    placeholder="选择选片日期"
                    clearable
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="选片时段" prop="selectTime">
                  <el-select v-model="form.selectTime" placeholder="请选择时段" clearable style="width: 100%">
                    <el-option label="上午 09:00-12:00" value="09:00-12:00" />
                    <el-option label="下午 14:00-17:00" value="14:00-17:00" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="总金额" prop="totalAmount">
                  <el-input-number v-model="form.totalAmount" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="已付金额" prop="paidAmount">
                  <el-input-number v-model="form.paidAmount" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="定金" prop="deposit">
                  <el-input-number v-model="form.deposit" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="订单状态" prop="status">
                  <el-select v-model="form.status" style="width: 100%">
                    <el-option label="待确认" value="pending" />
                    <el-option label="已确认" value="confirmed" />
                    <el-option label="拍摄中" value="shooting" />
                    <el-option label="已完成" value="completed" />
                    <el-option label="已取消" value="cancelled" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="statusDialogVisible" title="更新订单状态" width="400px">
      <el-form label-width="80px">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusType(currentAppointment?.status)">
            {{ getStatusText(currentAppointment?.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="更新为">
          <el-select v-model="selectedStatus" style="width: 100%">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="拍摄中" value="shooting" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="statusLoading" @click="handleStatusSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCustomerDialog" title="新增客户" width="500px">
      <el-form :model="newCustomer" :rules="customerRules" ref="customerFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="newCustomer.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="newCustomer.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="newCustomer.gender" placeholder="请选择性别" clearable style="width: 100%">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
          </el-select>
        </el-form-item>
        <el-form-item label="微信" prop="wechat">
          <el-input v-model="newCustomer.wechat" placeholder="请输入微信号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCustomerDialog = false">取消</el-button>
        <el-button type="primary" :loading="customerLoading" @click="handleCreateCustomer">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getAllPackages,
  getStaff,
  getCustomers,
  createCustomer
} from '@/api'

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const statusLoading = ref(false)
const customerLoading = ref(false)
const dialogVisible = ref(false)
const statusDialogVisible = ref(false)
const showCustomerDialog = ref(false)
const formRef = ref(null)
const customerFormRef = ref(null)
const isEdit = ref(false)
const activeTab = ref('basic')

const filter = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])
const packages = ref([])
const photographers = ref([])
const stylists = ref([])
const customers = ref([])
const currentAppointment = ref(null)
const selectedStatus = ref('')

const form = reactive({
  id: null,
  customerId: null,
  packageId: null,
  photographerId: null,
  stylistId: null,
  shootingDate: null,
  shootingTime: '',
  selectDate: null,
  selectTime: '',
  totalAmount: 0,
  paidAmount: 0,
  deposit: 0,
  status: 'pending',
  remark: ''
})

const newCustomer = reactive({
  name: '',
  phone: '',
  gender: '',
  wechat: ''
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  packageId: [{ required: true, message: '请选择套餐', trigger: 'change' }],
  shootingDate: [{ required: true, message: '请选择拍摄日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const customerRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑预约' : '新增预约')

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const getStatusText = (status) => {
  const map = { pending: '待确认', confirmed: '已确认', shooting: '拍摄中', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = { pending: 'warning', confirmed: 'primary', shooting: 'success', completed: 'info', cancelled: 'danger' }
  return map[status] || 'info'
}

const fetchList = async () => {
  loading.value = true
  try {
    const data = await getAppointments({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filter
    })
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchPackages = async () => {
  try {
    const data = await getAllPackages()
    packages.value = data
  } catch (error) {
    console.error(error)
  }
}

const fetchStaff = async () => {
  try {
    const photographersData = await getStaff({ role: 'photographer' })
    const stylistsData = await getStaff({ role: 'stylist' })
    photographers.value = photographersData
    stylists.value = stylistsData
  } catch (error) {
    console.error(error)
  }
}

const fetchCustomers = async () => {
  try {
    const data = await getCustomers({ pageSize: 1000 })
    customers.value = data.list
  } catch (error) {
    console.error(error)
  }
}

const handlePackageChange = (packageId) => {
  const pkg = packages.value.find(p => p.id === packageId)
  if (pkg) {
    form.totalAmount = pkg.price
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    customerId: null,
    packageId: null,
    photographerId: null,
    stylistId: null,
    shootingDate: null,
    shootingTime: '',
    selectDate: null,
    selectTime: '',
    totalAmount: 0,
    paidAmount: 0,
    deposit: 0,
    status: 'pending',
    remark: ''
  })
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    ...row,
    shootingDate: row.shootingDate ? dayjs(row.shootingDate).toDate() : null,
    selectDate: row.selectDate ? dayjs(row.selectDate).toDate() : null
  })
  dialogVisible.value = true
}

const handleUpdateStatus = (row) => {
  currentAppointment.value = row
  selectedStatus.value = row.status
  statusDialogVisible.value = true
}

const handleStatusSubmit = async () => {
  try {
    statusLoading.value = true
    await updateAppointmentStatus(currentAppointment.value.id, selectedStatus.value)
    ElMessage.success('状态更新成功')
    statusDialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
  } finally {
    statusLoading.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAppointment(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleCreateCustomer = async () => {
  try {
    await customerFormRef.value.validate()
    customerLoading.value = true
    const data = await createCustomer(newCustomer)
    ElMessage.success('客户创建成功')
    customers.value.push(data)
    form.customerId = data.id
    showCustomerDialog.value = false
    Object.assign(newCustomer, { name: '', phone: '', gender: '', wechat: '' })
  } catch (error) {
    console.error(error)
  } finally {
    customerLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    const submitData = {
      ...form,
      shootingDate: form.shootingDate ? dayjs(form.shootingDate).format('YYYY-MM-DD') : null,
      selectDate: form.selectDate ? dayjs(form.selectDate).format('YYYY-MM-DD') : null
    }
    if (isEdit.value) {
      await updateAppointment(form.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createAppointment(submitData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleCustomerChange = () => {
}

const goToPhotos = (row) => {
  router.push(`/photos/${row.id}`)
}

onMounted(() => {
  fetchList()
  fetchPackages()
  fetchStaff()
  fetchCustomers()
})
</script>
