<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-form :inline="true" :model="filter">
          <el-form-item label="关键字">
            <el-input v-model="filter.keyword" placeholder="抬头/税号/申请人" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane label="待审核" name="pending">
          <el-table :data="pendingList" stripe style="width: 100%" v-loading="loading">
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
            <el-table-column prop="applicant" label="申请人" width="100" />
            <el-table-column prop="created_at" label="申请时间" width="170">
              <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="handleApprove(row)">通过</el-button>
                <el-button size="small" type="danger" link @click="handleReject(row)">驳回</el-button>
                <el-button size="small" type="info" link @click="$router.push(`/applications/${row.id}`)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="pendingList.length === 0 && !loading" description="暂无待审核申请" />
        </el-tab-pane>

        <el-tab-pane label="已通过" name="approved">
          <el-table :data="approvedList" stripe style="width: 100%" v-loading="loading">
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
            <el-table-column prop="applicant" label="申请人" width="100" />
            <el-table-column prop="created_at" label="申请时间" width="170">
              <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="success" link @click="handleIssue(row)">开票</el-button>
                <el-button size="small" type="info" link @click="$router.push(`/applications/${row.id}`)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="approvedList.length === 0 && !loading" description="暂无已通过申请" />
        </el-tab-pane>

        <el-tab-pane label="已驳回" name="rejected">
          <el-table :data="rejectedList" stripe style="width: 100%" v-loading="loading">
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
            <el-table-column prop="applicant" label="申请人" width="100" />
            <el-table-column prop="created_at" label="申请时间" width="170">
              <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="info" link @click="$router.push(`/applications/${row.id}`)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="rejectedList.length === 0 && !loading" description="暂无已驳回申请" />
        </el-tab-pane>
      </el-tabs>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { applicationApi, invoiceApi } from '../api'

const loading = ref(false)
const applications = ref([])
const filter = ref({ keyword: '' })
const activeTab = ref('pending')
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

const pendingList = computed(() => applications.value.filter(a => a.status === 1))
const approvedList = computed(() => applications.value.filter(a => a.status === 2))
const rejectedList = computed(() => applications.value.filter(a => a.status === 3))

const loadData = async () => {
  loading.value = true
  try {
    const params = {}
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
  filter.value = { keyword: '' }
  loadData()
}

const onTabChange = () => {}

const handleApprove = (row) => {
  ElMessageBox.confirm(`确认通过申请 #${row.id} (${row.title?.name})？`, '审核通过', {
    confirmButtonText: '通过',
    type: 'success'
  }).then(async () => {
    try {
      await applicationApi.review(row.id, { status: 2 })
      ElMessage.success('审核通过')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const handleReject = (row) => {
  ElMessageBox.confirm(`确认驳回申请 #${row.id} (${row.title?.name})？`, '审核驳回', {
    confirmButtonText: '驳回',
    type: 'warning'
  }).then(async () => {
    try {
      await applicationApi.review(row.id, { status: 3 })
      ElMessage.success('已驳回')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
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
  justify-content: flex-start;
  margin-bottom: 16px;
}

.filter-bar .el-form {
  margin-bottom: 0;
}
</style>