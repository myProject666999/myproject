<template>
  <div class="page-container">
    <el-page-header @back="$router.back()" :content="`申请 #${application?.id || ''}`" style="margin-bottom: 16px" />

    <el-card v-if="application" shadow="never">
      <el-descriptions title="申请基本信息" :column="2" border>
        <el-descriptions-item label="申请ID">{{ application.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(application.status)">{{ application.status_text }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请人">{{ application.applicant || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(application.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ application.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="抬头信息" :column="2" border style="margin-top: 20px">
        <el-descriptions-item label="抬头名称">{{ application.title?.name }}</el-descriptions-item>
        <el-descriptions-item label="税号">{{ application.title?.tax_number }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ application.title?.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ application.title?.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="银行账户" :span="2">{{ application.title?.bank_account || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="明细信息" :column="1" border style="margin-top: 20px">
        <el-descriptions-item label="明细列表">
          <el-table :data="application.items" border style="width: 100%">
            <el-table-column prop="product_name" label="商品/服务名称" min-width="180" />
            <el-table-column prop="specification" label="规格型号" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="quantity" label="数量" width="80" align="right" />
            <el-table-column prop="unit_price" label="单价" width="100" align="right">
              <template #default="{ row }">{{ formatMoney(row.unit_price) }}</template>
            </el-table-column>
            <el-table-column prop="tax_rate" label="税率" width="80" align="right">
              <template #default="{ row }">{{ (row.tax_rate * 100).toFixed(0) }}%</template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="tax_amount" label="税额" width="100" align="right">
              <template #default="{ row }">{{ formatMoney(row.tax_amount) }}</template>
            </el-table-column>
          </el-table>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="金额汇总" :column="3" border style="margin-top: 20px">
        <el-descriptions-item label="不含税金额">
          <span style="color: #303133; font-weight: 600">¥{{ formatMoney(application.net_amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="税额合计">
          <span style="color: #e6a23c; font-weight: 600">¥{{ formatMoney(application.tax_amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="价税合计">
          <span style="color: #409eff; font-weight: 600">¥{{ formatMoney(application.total_amount) }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 24px; display: flex; gap: 12px">
        <el-button v-if="application.status === 1" type="success" @click="handleApprove">通过</el-button>
        <el-button v-if="application.status === 1" type="danger" @click="handleReject">驳回</el-button>
        <el-button v-if="application.status === 2" type="primary" @click="handleIssue">开具发票</el-button>
      </div>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { applicationApi, invoiceApi } from '../api'

const route = useRoute()
const router = useRouter()
const application = ref(null)
const issueDialogVisible = ref(false)
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
  try {
    const res = await applicationApi.get(route.params.id)
    application.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const statusType = (status) => {
  const map = { 1: 'warning', 2: 'success', 3: 'danger', 4: 'info' }
  return map[status] || ''
}

const handleApprove = () => {
  ElMessageBox.confirm('确认通过此申请？', '审核确认', {
    confirmButtonText: '通过',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    try {
      await applicationApi.review(application.value.id, { status: 2 })
      ElMessage.success('审核通过')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const handleReject = () => {
  ElMessageBox.confirm('确认驳回此申请？', '审核确认', {
    confirmButtonText: '驳回',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await applicationApi.review(application.value.id, { status: 3 })
      ElMessage.success('已驳回')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const handleIssue = () => {
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
        await invoiceApi.issue(application.value.id, issueForm.value)
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
</style>