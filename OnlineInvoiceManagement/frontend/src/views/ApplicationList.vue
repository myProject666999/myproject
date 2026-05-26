<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-form :inline="true" :model="filter">
          <el-form-item label="状态">
            <el-select v-model="filter.status" placeholder="全部" clearable style="width: 140px">
              <el-option label="待审核" :value="1" />
              <el-option label="已通过" :value="2" />
              <el-option label="已驳回" :value="3" />
              <el-option label="已开票" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键字">
            <el-input v-model="filter.keyword" placeholder="抬头/税号/申请人" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="$router.push('/applications/create')">
          <el-icon><Plus /></el-icon>
          新建申请
        </el-button>
      </div>

      <el-table :data="applications" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="抬头名称" min-width="180">
          <template #default="{ row }">{{ row.title?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="税号" min-width="180">
          <template #default="{ row }">{{ row.title?.tax_number || '-' }}</template>
        </el-table-column>
        <el-table-column prop="total_amount" label="价税合计(¥)" width="140" align="right">
          <template #default="{ row }">{{ formatMoney(row.total_amount) }}</template>
        </el-table-column>
        <el-table-column prop="net_amount" label="金额(¥)" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.net_amount) }}</template>
        </el-table-column>
        <el-table-column prop="tax_amount" label="税额(¥)" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.tax_amount) }}</template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="$router.push(`/applications/${row.id}`)">查看</el-button>
            <el-button v-if="row.status === 2" size="small" type="success" link @click="handleIssue(row)">开票</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="issueDialogVisible" title="开具发票" width="600px">
      <el-form :model="issueForm" label-width="100px" :rules="issueRules" ref="issueFormRef">
        <el-form-item label="发票号码" prop="invoice_number">
          <el-input v-model="issueForm.invoice_number" placeholder="请输入发票号码" />
        </el-form-item>
        <el-form-item label="发票代码" prop="invoice_code">
          <el-input v-model="issueForm.invoice_code" placeholder="请输入发票代码(可选)" />
        </el-form-item>
        <el-form-item label="开票日期" prop="issued_date">
          <el-date-picker v-model="issueForm.issued_date" type="date" value-format="YYYY-MM-DD" placeholder="选择开票日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="PDF路径" prop="pdf_path">
          <el-input v-model="issueForm.pdf_path" placeholder="PDF文件路径(可选)" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="issueForm.remark" type="textarea" :rows="3" placeholder="备注信息(可选)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="issueDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmIssue">确认开票</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { applicationApi, invoiceApi } from '../api'

const router = useRouter()
const loading = ref(false)
const applications = ref([])
const filter = ref({ status: undefined, keyword: '' })
const issueDialogVisible = ref(false)
const currentApplication = ref(null)
const issueFormRef = ref(null)
const issueForm = ref({
  invoice_number: '',
  invoice_code: '',
  issued_date: '',
  pdf_path: '',
  remark: ''
})

const issueRules = {
  invoice_number: [{ required: true, message: '请输入发票号码', trigger: 'blur' }],
  issued_date: [{ required: true, message: '请选择开票日期', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {}
    if (filter.value.status) params.status = filter.value.status
    if (filter.value.keyword) params.keyword = filter.value.keyword
    const res = await applicationApi.list(params)
    applications.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filter.value = { status: undefined, keyword: '' }
  loadData()
}

const statusType = (status) => {
  const map = { 1: 'warning', 2: 'success', 3: 'danger', 4: 'info' }
  return map[status] || ''
}

const handleIssue = (row) => {
  currentApplication.value = row
  issueForm.value = {
    invoice_number: '',
    invoice_code: '',
    issued_date: '',
    pdf_path: '',
    remark: ''
  }
  issueDialogVisible.value = true
}

const confirmIssue = async () => {
  if (!issueFormRef.value) return
  await issueFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await invoiceApi.issue(currentApplication.value.id, issueForm.value)
        ElMessage.success('开票成功')
        issueDialogVisible.value = false
        loadData()
      } catch (e) {
        console.error(e)
      }
    }
  })
}

const formatMoney = (v) => Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', { hour12: false })
}

onMounted(loadData)
</script>

<style scoped>
.page-container {
  padding: 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.filter-bar .el-form {
  margin-bottom: 0;
}
</style>