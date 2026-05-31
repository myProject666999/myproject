<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">租约管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">创建租约</el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="合同编号/租客/房源"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
          >
            <el-option label="待入住" value="PENDING" />
            <el-option label="执行中" value="ACTIVE" />
            <el-option label="已到期" value="EXPIRED" />
            <el-option label="已终止" value="TERMINATED" />
          </el-select>
        </el-form-item>
        <el-form-item label="租客">
          <el-input
            v-model="queryForm.tenantName"
            placeholder="租客姓名"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="contractNo" label="合同编号" width="140" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="apartmentNo" label="房源" width="100" />
        <el-table-column prop="startDate" label="起租日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="到期日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="leaseTerm" label="租期(月)" width="90" />
        <el-table-column prop="monthlyRent" label="月租金(元)" width="120">
          <template #default="{ row }">
            <span class="text-primary font-medium">¥{{ formatMoney(row.monthlyRent) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deposit" label="押金(元)" width="110">
          <template #default="{ row }">
            ¥{{ formatMoney(row.deposit) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status, 'lease') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">详情</el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              type="success"
              link
              @click="handleCheckIn(row)"
            >
              入住确认
            </el-button>
            <el-button
              v-if="row.status === 'ACTIVE'"
              type="warning"
              link
              @click="handleTerminate(row)"
            >
              终止租约
            </el-button>
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租客" prop="tenantId">
              <el-select v-model="formData.tenantId" placeholder="请选择租客" style="width: 100%">
                <el-option
                  v-for="item in tenantList"
                  :key="item.id"
                  :label="item.name + ' (' + item.phone + ')'"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房源" prop="apartmentId">
              <el-select v-model="formData.apartmentId" placeholder="请选择房源" style="width: 100%">
                <el-option
                  v-for="item in apartmentList"
                  :key="item.id"
                  :label="item.apartmentNo + ' - ' + item.address"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="起租日期" prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="选择起租日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期日期" prop="endDate">
              <el-date-picker
                v-model="formData.endDate"
                type="date"
                placeholder="选择到期日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月租金(元)" prop="monthlyRent">
              <el-input-number v-model="formData.monthlyRent" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="押金(元)" prop="deposit">
              <el-input-number v-model="formData.deposit" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-select v-model="formData.paymentMethod" style="width: 100%">
                <el-option label="月付" value="MONTHLY" />
                <el-option label="季付" value="QUARTERLY" />
                <el-option label="半年付" value="HALF_YEAR" />
                <el-option label="年付" value="YEARLY" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="缴费日" prop="paymentDay">
              <el-input-number v-model="formData.paymentDay" :min="1" :max="28" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="水费单价(吨)">
              <el-input-number v-model="formData.waterPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电费单价(度)">
              <el-input-number v-model="formData.electricityPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="租约详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="合同编号">{{ detailData.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="租客">{{ detailData.tenantName }}</el-descriptions-item>
        <el-descriptions-item label="房源">{{ detailData.apartmentNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(detailData.status)">
            {{ getStatusText(detailData.status, 'lease') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="起租日期">{{ formatDate(detailData.startDate) }}</el-descriptions-item>
        <el-descriptions-item label="到期日期">{{ formatDate(detailData.endDate) }}</el-descriptions-item>
        <el-descriptions-item label="租期">{{ detailData.leaseTerm }}个月</el-descriptions-item>
        <el-descriptions-item label="月租金">¥{{ formatMoney(detailData.monthlyRent) }}</el-descriptions-item>
        <el-descriptions-item label="押金">¥{{ formatMoney(detailData.deposit) }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">
          {{ { MONTHLY: '月付', QUARTERLY: '季付', HALF_YEAR: '半年付', YEARLY: '年付' }[detailData.paymentMethod] }}
        </el-descriptions-item>
        <el-descriptions-item label="缴费日">每月{{ detailData.paymentDay }}号</el-descriptions-item>
        <el-descriptions-item label="入住日期">{{ formatDate(detailData.checkInDate) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退房日期">{{ formatDate(detailData.checkOutDate) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="签订日期">{{ formatDate(detailData.signingDate) }}</el-descriptions-item>
        <el-descriptions-item label="水费单价">{{ detailData.waterPrice }}元/吨</el-descriptions-item>
        <el-descriptions-item label="电费单价">{{ detailData.electricityPrice }}元/度</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, View, Edit } from '@element-plus/icons-vue'
import {
  getLeasePage,
  createLease,
  updateLease,
  checkInLease,
  terminateLease,
  getLeaseDetail
} from '@/api/lease'
import { getTenantList } from '@/api/tenant'
import { getApartmentList } from '@/api/apartment'
import { formatMoney, formatDate, getStatusTagType, getStatusText } from '@/utils/format'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const total = ref(0)
const tableData = ref([])
const detailData = ref({})
const tenantList = ref([])
const apartmentList = ref([])

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  tenantName: ''
})

const formData = reactive({
  id: null,
  tenantId: null,
  apartmentId: null,
  startDate: '',
  endDate: '',
  monthlyRent: null,
  deposit: null,
  paymentMethod: 'MONTHLY',
  paymentDay: 1,
  waterPrice: 5.0,
  electricityPrice: 1.5,
  remark: ''
})

const formRules = {
  tenantId: [{ required: true, message: '请选择租客', trigger: 'change' }],
  apartmentId: [{ required: true, message: '请选择房源', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择起租日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }],
  monthlyRent: [{ required: true, message: '请输入月租金', trigger: 'blur' }],
  deposit: [{ required: true, message: '请输入押金', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
  paymentDay: [{ required: true, message: '请输入缴费日', trigger: 'blur' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getLeasePage(queryForm)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const [tenantRes, apartmentRes] = await Promise.all([
      getTenantList(),
      getApartmentList()
    ])
    tenantList.value = tenantRes.data
    apartmentList.value = apartmentRes.data.filter(item => item.status === 'VACANT')
  } catch (e) {
    console.error('Load options error:', e)
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  fetchData()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.status = ''
  queryForm.tenantName = ''
  handleSearch()
}

function handleAdd() {
  isEdit.value = false
  dialogTitle.value = '创建租约'
  Object.assign(formData, {
    id: null,
    tenantId: null,
    apartmentId: null,
    startDate: '',
    endDate: '',
    monthlyRent: null,
    deposit: null,
    paymentMethod: 'MONTHLY',
    paymentDay: 1,
    waterPrice: 5.0,
    electricityPrice: 1.5,
    remark: ''
  })
  loadOptions()
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  dialogTitle.value = '编辑租约'
  Object.assign(formData, { ...row })
  loadOptions()
  dialogVisible.value = true
}

async function handleView(row) {
  const res = await getLeaseDetail(row.id)
  detailData.value = res.data
  detailVisible.value = true
}

function handleCheckIn(row) {
  ElMessageBox.confirm(`确定要确认【${row.tenantName}】的入住吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await checkInLease(row.id)
    ElMessage.success('入住确认成功')
    fetchData()
  }).catch(() => {})
}

function handleTerminate(row) {
  ElMessageBox.prompt('请输入终止原因', '终止租约', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入终止原因'
  }).then(async ({ value }) => {
    await terminateLease(row.id, value)
    ElMessage.success('租约终止成功')
    fetchData()
  }).catch(() => {})
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      await updateLease(formData)
      ElMessage.success('更新成功')
    } else {
      await createLease(formData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== false) {
      console.error('Submit error:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
