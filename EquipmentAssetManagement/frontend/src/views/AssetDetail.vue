<template>
  <div class="asset-detail">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="page-title">资产详情</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openBorrowDialog" :disabled="asset?.status !== 'IDLE'">
          <el-icon><Wallet /></el-icon>
          领用
        </el-button>
        <el-button type="warning" @click="openTransferDialog" :disabled="asset?.status === 'SCRAPPED' || asset?.status === 'LOST'">
          <el-icon><Switch /></el-icon>
          调拨
        </el-button>
        <el-button type="danger" @click="openRepairDialog" :disabled="asset?.status === 'MAINTENANCE' || asset?.status === 'SCRAPPED'">
          <el-icon><Tools /></el-icon>
          报修
        </el-button>
        <el-button @click="openScrapDialog" :disabled="asset?.status === 'SCRAPPED'">
          <el-icon><Delete /></el-icon>
          报废
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <span>基本信息</span>
          </template>
          <el-descriptions :column="2" border v-if="asset">
            <el-descriptions-item label="资产编号">{{ asset.asset_code }}</el-descriptions-item>
            <el-descriptions-item label="资产名称">{{ asset.name }}</el-descriptions-item>
            <el-descriptions-item label="资产分类">{{ asset.category_name }}</el-descriptions-item>
            <el-descriptions-item label="品牌">{{ asset.brand || '-' }}</el-descriptions-item>
            <el-descriptions-item label="规格型号">{{ asset.specification || '-' }}</el-descriptions-item>
            <el-descriptions-item label="序列号">{{ asset.serial_number || '-' }}</el-descriptions-item>
            <el-descriptions-item label="采购日期">{{ asset.purchase_date || '-' }}</el-descriptions-item>
            <el-descriptions-item label="采购价格">¥{{ asset.purchase_price ? Number(asset.purchase_price).toLocaleString() : '-' }}</el-descriptions-item>
            <el-descriptions-item label="供应商">{{ asset.supplier || '-' }}</el-descriptions-item>
            <el-descriptions-item label="存放位置">{{ asset.location || '-' }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusType(asset.status)">{{ getStatusText(asset.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前使用人">{{ asset.current_user_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="当前使用部门">{{ asset.current_department_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ asset.created_at }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ asset.description || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="records-card">
          <template #header>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="领用记录" name="borrow" />
              <el-tab-pane label="维修记录" name="maintenance" />
              <el-tab-pane label="调拨记录" name="transfer" />
            </el-tabs>
          </template>
          
          <div v-if="activeTab === 'borrow'">
            <el-table :data="borrowRecords" v-loading="loading">
              <el-table-column prop="borrow_date" label="领用日期" width="120" />
              <el-table-column prop="user_name" label="领用人" width="100" />
              <el-table-column prop="department_name" label="领用部门" width="120" />
              <el-table-column prop="expected_return_date" label="预计归还" width="120" />
              <el-table-column prop="actual_return_date" label="实际归还" width="120" />
              <el-table-column prop="purpose" label="用途" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'BORROWED' ? 'primary' : 'success'">
                    {{ row.status === 'BORROWED' ? '领用中' : '已归还' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div v-if="activeTab === 'maintenance'">
            <el-table :data="maintenanceRecords" v-loading="loading">
              <el-table-column prop="report_date" label="报修日期" width="120" />
              <el-table-column prop="reporter_name" label="报修人" width="100" />
              <el-table-column prop="fault_description" label="故障描述" />
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
                  <el-tag :type="getMaintenanceStatusType(row.status)">
                    {{ getMaintenanceStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div v-if="activeTab === 'transfer'">
            <el-table :data="transferRecords" v-loading="loading">
              <el-table-column prop="transfer_date" label="调拨日期" width="120" />
              <el-table-column prop="from_user_name" label="原使用人" width="100" />
              <el-table-column prop="to_user_name" label="新使用人" width="100" />
              <el-table-column prop="from_department_name" label="原部门" width="120" />
              <el-table-column prop="to_department_name" label="新部门" width="120" />
              <el-table-column prop="reason" label="调拨原因" />
            </el-table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="qr-card">
          <template #header>
            <span>资产二维码</span>
          </template>
          <div class="qr-container" v-if="qrCode">
            <img :src="qrCode" alt="二维码" class="qr-image" />
            <p class="qr-tip">扫码查看资产详情</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="borrowDialogVisible" title="资产领用" width="500px">
      <el-form :model="borrowForm" :rules="borrowRules" ref="borrowFormRef" label-width="100px">
        <el-form-item label="领用人" prop="user_id">
          <el-select v-model="borrowForm.user_id" style="width: 100%">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="领用部门" prop="department_id">
          <el-select v-model="borrowForm.department_id" style="width: 100%">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="领用日期" prop="borrow_date">
          <el-date-picker v-model="borrowForm.borrow_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="预计归还" prop="expected_return_date">
          <el-date-picker v-model="borrowForm.expected_return_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="领用用途" prop="purpose">
          <el-input v-model="borrowForm.purpose" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="borrowForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBorrow">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="transferDialogVisible" title="资产调拨" width="500px">
      <el-form :model="transferForm" :rules="transferRules" ref="transferFormRef" label-width="100px">
        <el-form-item label="调给用户" prop="to_user_id">
          <el-select v-model="transferForm.to_user_id" style="width: 100%">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调给部门" prop="to_department_id">
          <el-select v-model="transferForm.to_department_id" style="width: 100%">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调拨日期" prop="transfer_date">
          <el-date-picker v-model="transferForm.transfer_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="调拨原因" prop="reason">
          <el-input v-model="transferForm.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTransfer">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="repairDialogVisible" title="资产报修" width="500px">
      <el-form :model="repairForm" :rules="repairRules" ref="repairFormRef" label-width="100px">
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
        <el-button @click="repairDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRepair">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="scrapDialogVisible" title="资产报废" width="500px">
      <el-form :model="scrapForm" :rules="scrapRules" ref="scrapFormRef" label-width="100px">
        <el-form-item label="报废原因" prop="scrap_reason">
          <el-input v-model="scrapForm.scrap_reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="报废日期" prop="scrap_date">
          <el-date-picker v-model="scrapForm.scrap_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="申请人" prop="applicant_id">
          <el-select v-model="scrapForm.applicant_id" style="width: 100%">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="残值">
          <el-input-number v-model="scrapForm.scrap_value" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="scrapForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scrapDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitScrap">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { assets as assetsApi, borrows as borrowsApi, maintenance as maintenanceApi, transfers as transfersApi, scraps as scrapsApi, qrcode as qrcodeApi, users as usersApi, departments as departmentsApi } from '../api'

const route = useRoute()
const router = useRouter()
const assetId = route.params.id

const loading = ref(false)
const asset = ref(null)
const qrCode = ref('')
const activeTab = ref('borrow')

const borrowRecords = ref([])
const maintenanceRecords = ref([])
const transferRecords = ref([])

const users = ref([])
const departments = ref([])

const borrowDialogVisible = ref(false)
const borrowFormRef = ref(null)
const borrowForm = reactive({
  user_id: '',
  department_id: '',
  borrow_date: '',
  expected_return_date: '',
  purpose: '',
  remarks: ''
})
const borrowRules = {
  user_id: [{ required: true, message: '请选择领用人', trigger: 'change' }],
  department_id: [{ required: true, message: '请选择领用部门', trigger: 'change' }],
  borrow_date: [{ required: true, message: '请选择领用日期', trigger: 'change' }],
  purpose: [{ required: true, message: '请输入领用用途', trigger: 'blur' }]
}

const transferDialogVisible = ref(false)
const transferFormRef = ref(null)
const transferForm = reactive({
  to_user_id: '',
  to_department_id: '',
  transfer_date: '',
  reason: ''
})
const transferRules = {
  to_user_id: [{ required: true, message: '请选择调给用户', trigger: 'change' }],
  to_department_id: [{ required: true, message: '请选择调给部门', trigger: 'change' }],
  transfer_date: [{ required: true, message: '请选择调拨日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入调拨原因', trigger: 'blur' }]
}

const repairDialogVisible = ref(false)
const repairFormRef = ref(null)
const repairForm = reactive({
  fault_description: '',
  report_date: '',
  reporter_id: '',
  maintenance_type: 'INTERNAL',
  remarks: ''
})
const repairRules = {
  fault_description: [{ required: true, message: '请输入故障描述', trigger: 'blur' }],
  report_date: [{ required: true, message: '请选择报修日期', trigger: 'change' }],
  reporter_id: [{ required: true, message: '请选择报修人', trigger: 'change' }]
}

const scrapDialogVisible = ref(false)
const scrapFormRef = ref(null)
const scrapForm = reactive({
  scrap_reason: '',
  scrap_date: '',
  applicant_id: '',
  scrap_value: 0,
  remarks: ''
})
const scrapRules = {
  scrap_reason: [{ required: true, message: '请输入报废原因', trigger: 'blur' }],
  scrap_date: [{ required: true, message: '请选择报废日期', trigger: 'change' }],
  applicant_id: [{ required: true, message: '请选择申请人', trigger: 'change' }]
}

const getStatusType = (status) => {
  const types = {
    IDLE: 'success',
    IN_USE: 'primary',
    MAINTENANCE: 'warning',
    SCRAPPED: 'info',
    LOST: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    IDLE: '空闲',
    IN_USE: '使用中',
    MAINTENANCE: '维修中',
    SCRAPPED: '已报废',
    LOST: '已丢失'
  }
  return texts[status] || status
}

const getMaintenanceStatusType = (status) => {
  const types = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'info'
  }
  return types[status] || 'info'
}

const getMaintenanceStatusText = (status) => {
  const texts = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return texts[status] || status
}

const goBack = () => {
  router.push('/assets')
}

const loadAsset = async () => {
  try {
    const res = await assetsApi.getDetail(assetId)
    if (res.code === 200) {
      asset.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载资产详情失败')
  }
}

const loadQRCode = async () => {
  try {
    const res = await qrcodeApi.getAssetQR(assetId)
    if (res.code === 200) {
      qrCode.value = res.data
    }
  } catch (error) {
    console.error('加载二维码失败', error)
  }
}

const loadRecords = async () => {
  loading.value = true
  try {
    const [borrowRes, maintenanceRes, transferRes] = await Promise.all([
      borrowsApi.getByAsset(assetId),
      maintenanceApi.getByAsset(assetId),
      transfersApi.getByAsset(assetId)
    ])
    if (borrowRes.code === 200) borrowRecords.value = borrowRes.data
    if (maintenanceRes.code === 200) maintenanceRecords.value = maintenanceRes.data
    if (transferRes.code === 200) transferRecords.value = transferRes.data
  } catch (error) {
    console.error('加载记录失败', error)
  } finally {
    loading.value = false
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

const loadDepartments = async () => {
  try {
    const res = await departmentsApi.getList()
    if (res.code === 200) {
      departments.value = res.data
    }
  } catch (error) {
    console.error('加载部门失败', error)
  }
}

const openBorrowDialog = () => {
  Object.keys(borrowForm).forEach(key => borrowForm[key] = '')
  borrowDialogVisible.value = true
}

const submitBorrow = async () => {
  if (!borrowFormRef.value) return
  await borrowFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await borrowsApi.create({
          ...borrowForm,
          asset_id: assetId
        })
        if (res.code === 200) {
          ElMessage.success('领用成功')
          borrowDialogVisible.value = false
          loadAsset()
          loadRecords()
        }
      } catch (error) {
        ElMessage.error(error.message || '领用失败')
      }
    }
  })
}

const openTransferDialog = () => {
  Object.keys(transferForm).forEach(key => transferForm[key] = '')
  transferDialogVisible.value = true
}

const submitTransfer = async () => {
  if (!transferFormRef.value) return
  await transferFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await transfersApi.create({
          ...transferForm,
          asset_id: assetId,
          operator_id: 1
        })
        if (res.code === 200) {
          ElMessage.success('调拨成功')
          transferDialogVisible.value = false
          loadAsset()
          loadRecords()
        }
      } catch (error) {
        ElMessage.error(error.message || '调拨失败')
      }
    }
  })
}

const openRepairDialog = () => {
  Object.keys(repairForm).forEach(key => {
    repairForm[key] = key === 'maintenance_type' ? 'INTERNAL' : ''
  })
  repairDialogVisible.value = true
}

const submitRepair = async () => {
  if (!repairFormRef.value) return
  await repairFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await maintenanceApi.create({
          ...repairForm,
          asset_id: assetId
        })
        if (res.code === 200) {
          ElMessage.success('报修成功')
          repairDialogVisible.value = false
          loadAsset()
          loadRecords()
        }
      } catch (error) {
        ElMessage.error(error.message || '报修失败')
      }
    }
  })
}

const openScrapDialog = () => {
  Object.keys(scrapForm).forEach(key => {
    scrapForm[key] = key === 'scrap_value' ? 0 : ''
  })
  scrapDialogVisible.value = true
}

const submitScrap = async () => {
  if (!scrapFormRef.value) return
  await scrapFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await scrapsApi.create({
          ...scrapForm,
          asset_id: assetId
        })
        if (res.code === 200) {
          ElMessage.success('报废申请已提交')
          scrapDialogVisible.value = false
        }
      } catch (error) {
        ElMessage.error(error.message || '提交失败')
      }
    }
  })
}

onMounted(() => {
  loadAsset()
  loadQRCode()
  loadRecords()
  loadUsers()
  loadDepartments()
})
</script>

<style scoped>
.asset-detail {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.info-card {
  margin-bottom: 20px;
}

.records-card {
  margin-bottom: 20px;
}

.qr-card {
  position: sticky;
  top: 20px;
}

.qr-container {
  text-align: center;
  padding: 20px 0;
}

.qr-image {
  width: 200px;
  height: 200px;
}

.qr-tip {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}
</style>
