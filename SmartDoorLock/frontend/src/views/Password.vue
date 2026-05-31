<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">门锁密码</h2>
      <el-button type="primary" :icon="Plus" @click="handleSend">下发密码</el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="密码编号">
          <el-input
            v-model="queryForm.passwordNo"
            placeholder="请输入密码编号"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="门锁">
          <el-input
            v-model="queryForm.lockNo"
            placeholder="门锁编号"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="密码类型">
          <el-select
            v-model="queryForm.passwordType"
            placeholder="全部类型"
            clearable
            style="width: 120px"
          >
            <el-option label="永久" value="PERMANENT" />
            <el-option label="临时" value="TEMPORARY" />
            <el-option label="一次性" value="DISPOSABLE" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select
            v-model="queryForm.permissionType"
            placeholder="全部权限"
            clearable
            style="width: 120px"
          >
            <el-option label="管理员" value="ADMIN" />
            <el-option label="租客" value="TENANT" />
            <el-option label="保洁" value="CLEANER" />
            <el-option label="维修" value="MAINTENANCE" />
            <el-option label="访客" value="VISITOR" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="有效" value="ACTIVE" />
            <el-option label="已过期" value="EXPIRED" />
            <el-option label="已取消" value="CANCELLED" />
            <el-option label="已冻结" value="FROZEN" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="passwordNo" label="密码编号" width="140" />
        <el-table-column prop="lockNo" label="门锁编号" width="120" />
        <el-table-column prop="tenantName" label="使用人" width="100" />
        <el-table-column prop="password" label="密码" width="100">
          <template #default="{ row }">
            <span class="password-text">{{ showPasswordId === row.id ? row.password : maskPassword(row.password) }}</span>
            <el-button
              type="primary"
              link
              size="small"
              @click="togglePassword(row)"
            >
              {{ showPasswordId === row.id ? '隐藏' : '显示' }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="passwordType" label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.passwordType === 'PERMANENT' ? 'success' : row.passwordType === 'TEMPORARY' ? 'warning' : 'info'">
              {{ getStatusText(row.passwordType, 'passwordType') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permissionType" label="权限" width="90">
          <template #default="{ row }">
            {{ getStatusText(row.permissionType, 'permission') }}
          </template>
        </el-table-column>
        <el-table-column prop="effectiveTime" label="生效时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.effectiveTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="过期时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.expireTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="sendStatus" label="发送状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.sendStatus === 'SUCCESS' ? 'success' : row.sendStatus === 'FAILED' ? 'danger' : 'warning'">
              {{ getStatusText(row.sendStatus, 'send') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status, 'password') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.sendStatus === 'FAILED'"
              type="primary"
              link
              @click="handleResend(row)"
            >
              重发
            </el-button>
            <el-button
              v-if="row.status === 'ACTIVE'"
              type="warning"
              link
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-button
              v-if="row.status === 'ACTIVE'"
              type="danger"
              link
              @click="handleFreeze(row)"
            >
              冻结
            </el-button>
            <el-button
              v-if="row.status === 'FROZEN'"
              type="success"
              link
              @click="handleUnfreeze(row)"
            >
              解冻
            </el-button>
            <el-button type="primary" link :icon="View" @click="handleView(row)">详情</el-button>
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
      title="下发密码"
      width="600px"
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
            <el-form-item label="选择门锁" prop="lockId">
              <el-select v-model="formData.lockId" placeholder="请选择门锁" style="width: 100%">
                <el-option
                  v-for="item in lockList"
                  :key="item.id"
                  :label="item.lockNo + ' - ' + (item.apartmentNo || '')"
                  :value="item.id"
                  :disabled="item.networkStatus === 'OFFLINE'"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联租约">
              <el-select v-model="formData.contractId" placeholder="请选择租约（可选）" clearable style="width: 100%">
                <el-option
                  v-for="item in leaseList"
                  :key="item.id"
                  :label="item.contractNo + ' - ' + item.tenantName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用人" prop="tenantName">
              <el-input v-model="formData.tenantName" placeholder="请输入使用人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用人ID">
              <el-input-number v-model="formData.tenantId" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码类型" prop="passwordType">
              <el-select v-model="formData.passwordType" style="width: 100%">
                <el-option label="永久密码" value="PERMANENT" />
                <el-option label="临时密码" value="TEMPORARY" />
                <el-option label="一次性密码" value="DISPOSABLE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限类型" prop="permissionType">
              <el-select v-model="formData.permissionType" style="width: 100%">
                <el-option label="管理员" value="ADMIN" />
                <el-option label="租客" value="TENANT" />
                <el-option label="保洁" value="CLEANER" />
                <el-option label="维修" value="MAINTENANCE" />
                <el-option label="访客" value="VISITOR" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效时间" prop="effectiveTime">
              <el-date-picker
                v-model="formData.effectiveTime"
                type="datetime"
                placeholder="选择生效时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间" prop="expireTime">
              <el-date-picker
                v-model="formData.expireTime"
                type="datetime"
                placeholder="选择过期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用次数限制">
              <el-input-number
                v-model="formData.useLimit"
                :min="-1"
                placeholder="-1表示不限"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确认下发</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="密码详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="密码编号">{{ detailData.passwordNo }}</el-descriptions-item>
        <el-descriptions-item label="门锁编号">{{ detailData.lockNo }}</el-descriptions-item>
        <el-descriptions-item label="使用人">{{ detailData.tenantName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="密码">
          <span class="password-text">{{ detailData.password }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="密码类型">
          <el-tag :type="detailData.passwordType === 'PERMANENT' ? 'success' : detailData.passwordType === 'TEMPORARY' ? 'warning' : 'info'">
            {{ getStatusText(detailData.passwordType, 'passwordType') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="权限类型">
          {{ getStatusText(detailData.permissionType, 'permission') }}
        </el-descriptions-item>
        <el-descriptions-item label="生效时间">{{ formatDateTime(detailData.effectiveTime) }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ formatDateTime(detailData.expireTime) }}</el-descriptions-item>
        <el-descriptions-item label="发送状态">
          <el-tag :type="detailData.sendStatus === 'SUCCESS' ? 'success' : detailData.sendStatus === 'FAILED' ? 'danger' : 'warning'">
            {{ getStatusText(detailData.sendStatus, 'send') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(detailData.status)">
            {{ getStatusText(detailData.status, 'password') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="已使用次数">{{ detailData.usedCount }}次</el-descriptions-item>
        <el-descriptions-item label="使用限制">
          {{ detailData.useLimit === -1 ? '不限' : detailData.useLimit + '次' }}
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ formatDateTime(detailData.sendTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="发送请求ID" :span="2">{{ detailData.sendRequestId }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, View } from '@element-plus/icons-vue'
import {
  getPasswordPage,
  sendPassword,
  resendPassword,
  cancelPassword,
  freezePassword,
  unfreezePassword,
  getPasswordDetail
} from '@/api/password'
import { getLockList } from '@/api/doorLock'
import { getLeasePage } from '@/api/lease'
import { formatDateTime, maskPassword, getStatusTagType, getStatusText } from '@/utils/format'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formRef = ref()
const total = ref(0)
const tableData = ref([])
const detailData = ref({})
const lockList = ref([])
const leaseList = ref([])
const showPasswordId = ref(null)

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  passwordNo: '',
  lockNo: '',
  passwordType: '',
  permissionType: '',
  status: ''
})

const formData = reactive({
  lockId: null,
  contractId: null,
  tenantId: null,
  tenantName: '',
  passwordType: 'TEMPORARY',
  permissionType: 'TENANT',
  effectiveTime: '',
  expireTime: '',
  useLimit: -1
})

const formRules = {
  lockId: [{ required: true, message: '请选择门锁', trigger: 'change' }],
  tenantName: [{ required: true, message: '请输入使用人姓名', trigger: 'blur' }],
  passwordType: [{ required: true, message: '请选择密码类型', trigger: 'change' }],
  permissionType: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
  effectiveTime: [{ required: true, message: '请选择生效时间', trigger: 'change' }],
  expireTime: [{ required: true, message: '请选择过期时间', trigger: 'change' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getPasswordPage(queryForm)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const [lockRes, leaseRes] = await Promise.all([
      getLockList(),
      getLeasePage({ pageNum: 1, pageSize: 100, status: 'ACTIVE' })
    ])
    lockList.value = lockRes.data
    leaseList.value = leaseRes.data.records
  } catch (e) {
    console.error('Load options error:', e)
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  fetchData()
}

function handleReset() {
  queryForm.passwordNo = ''
  queryForm.lockNo = ''
  queryForm.passwordType = ''
  queryForm.permissionType = ''
  queryForm.status = ''
  handleSearch()
}

function togglePassword(row) {
  showPasswordId.value = showPasswordId.value === row.id ? null : row.id
}

function handleSend() {
  Object.assign(formData, {
    lockId: null,
    contractId: null,
    tenantId: null,
    tenantName: '',
    passwordType: 'TEMPORARY',
    permissionType: 'TENANT',
    effectiveTime: '',
    expireTime: '',
    useLimit: -1
  })
  loadOptions()
  dialogVisible.value = true
}

async function handleView(row) {
  const res = await getPasswordDetail(row.id)
  detailData.value = res.data
  detailVisible.value = true
}

function handleResend(row) {
  ElMessageBox.confirm(`确定要重发密码【${row.passwordNo}】吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await resendPassword(row.id)
    ElMessage.success('重发成功')
    fetchData()
  }).catch(() => {})
}

function handleCancel(row) {
  ElMessageBox.confirm(`确定要取消密码【${row.passwordNo}】吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await cancelPassword(row.id)
    ElMessage.success('取消成功')
    fetchData()
  }).catch(() => {})
}

function handleFreeze(row) {
  ElMessageBox.confirm(`确定要冻结密码【${row.passwordNo}】吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await freezePassword(row.id)
    ElMessage.success('冻结成功')
    fetchData()
  }).catch(() => {})
}

function handleUnfreeze(row) {
  ElMessageBox.confirm(`确定要解冻密码【${row.passwordNo}】吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await unfreezePassword(row.id)
    ElMessage.success('解冻成功')
    fetchData()
  }).catch(() => {})
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const res = await sendPassword(formData)
    ElMessage.success('下发成功，密码：' + res.data.password)
    
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

<style scoped>
.password-text {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--primary-color);
  letter-spacing: 2px;
}
</style>
