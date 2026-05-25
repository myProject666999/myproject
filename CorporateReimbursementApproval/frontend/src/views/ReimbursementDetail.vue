<template>
  <div class="detail-page">
    <el-card class="detail-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button
            :icon="ArrowLeft"
            circle
            @click="handleBack"
          />
          <span class="card-title">报销单详情</span>
          <el-tag
            :type="statusTagType(detail.status)"
            effect="light"
            class="status-tag"
          >
            {{ statusLabel(detail.status) }}
          </el-tag>
        </div>
      </template>

      <el-descriptions
        :column="3"
        border
        class="info-section"
      >
        <el-descriptions-item label="报销单号">
          {{ detail.reimburseNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="标题">
          {{ detail.title || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="报销类型">
          {{ detail.typeName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人">
          {{ detail.applicantName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="所属部门">
          {{ detail.departmentName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="总金额">
          <span class="amount-value">¥ {{ formatMoney(detail.totalAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">
          {{ detail.submitTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="当前审批人">
          {{ detail.currentApproverName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="当前审批层级">
          {{ detail.currentLevel ? `第 ${detail.currentLevel} 级` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="报销事由" :span="3">
          {{ detail.reason || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">报销明细</el-divider>

      <el-table
        :data="detail.items || []"
        border
        stripe
        style="width: 100%"
        class="section"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="itemName" label="费用名称" min-width="160" />
        <el-table-column prop="itemTypeName" label="费用类型" width="120" />
        <el-table-column label="数量" width="100" align="center">
          <template #default="{ row }">
            {{ row.quantity ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="单价(元)" width="120" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.unitPrice) }}
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" width="130" align="right">
          <template #default="{ row }">
            <span class="amount-value">¥ {{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="expenseDate"
          label="发生日期"
          width="130"
          align="center"
        />
        <el-table-column
          prop="description"
          label="说明"
          min-width="200"
          show-overflow-tooltip
        />
      </el-table>

      <el-divider content-position="left">发票附件</el-divider>

      <el-table
        :data="detail.attachments || []"
        border
        stripe
        style="width: 100%"
        class="section"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="fileName" label="文件名称" min-width="200" />
        <el-table-column prop="fileType" label="文件类型" width="120" />
        <el-table-column prop="invoiceNo" label="发票号码" width="180" />
        <el-table-column label="文件大小" width="110" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="Download"
              :disabled="!row.fileUrl"
              @click="handleDownload(row)"
            >
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="(detail.attachments || []).length === 0"
        description="暂无发票附件"
        :image-size="80"
      />

      <el-divider content-position="left">审批流程</el-divider>

      <div class="timeline-section">
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in detail.approvalRecords || []"
            :key="record.id || index"
            :timestamp="record.approvalTime || '-'"
            placement="top"
            :type="record.action === 'APPROVE' ? 'success' : 'danger'"
            :hollow="index === (detail.approvalRecords || []).length - 1"
          >
            <div class="timeline-header">
              <span class="timeline-approver">
                {{ record.approverName || '-' }}
              </span>
              <el-tag
                :type="record.action === 'APPROVE' ? 'success' : 'danger'"
                effect="light"
                size="small"
              >
                第 {{ record.level || '-' }} 级
              </el-tag>
              <el-tag
                :type="record.action === 'APPROVE' ? 'success' : 'danger'"
                size="small"
              >
                {{ record.action === 'APPROVE' ? '已通过' : '已驳回' }}
              </el-tag>
            </div>
            <div class="timeline-opinion">
              <span class="opinion-label">审批意见：</span>
              <span>{{ record.opinion || '无' }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>

        <el-empty
          v-if="(detail.approvalRecords || []).length === 0"
          description="暂无审批记录"
          :image-size="80"
        />
      </div>

      <div class="action-bar">
        <template v-if="isCurrentApprover">
          <el-button
            type="success"
            :icon="Check"
            :loading="actionLoading"
            @click="handleApprove"
          >
            审批通过
          </el-button>
          <el-button
            type="danger"
            :icon="Close"
            :loading="actionLoading"
            @click="handleReject"
          >
            审批驳回
          </el-button>
        </template>

        <template v-else-if="isApplicant && detail.status === 'DRAFT'">
          <el-button
            type="warning"
            :icon="Edit"
            :loading="actionLoading"
            @click="handleEdit"
          >
            编辑
          </el-button>
          <el-button
            type="primary"
            :icon="Promotion"
            :loading="actionLoading"
            @click="handleSubmit"
          >
            提交审批
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            :loading="actionLoading"
            @click="handleDelete"
          >
            删除
          </el-button>
        </template>

        <template v-else-if="isApplicant && detail.status === 'REJECTED'">
          <el-button
            type="warning"
            :icon="Edit"
            :loading="actionLoading"
            @click="handleEdit"
          >
            编辑
          </el-button>
          <el-button
            type="success"
            :icon="Refresh"
            :loading="actionLoading"
            @click="handleResubmit"
          >
            重新提交
          </el-button>
        </template>
      </div>
    </el-card>

    <el-dialog
      v-model="actionDialog.visible"
      :title="actionDialog.type === 'approve' ? '审批通过' : '审批驳回'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="opinionFormRef"
        :model="opinionForm"
        :rules="opinionRules"
        label-width="80px"
      >
        <el-form-item label="报销单">
          <span>{{ detail.title }}</span>
        </el-form-item>
        <el-form-item label="审批意见" prop="opinion">
          <el-input
            v-model="opinionForm.opinion"
            type="textarea"
            :rows="4"
            :placeholder="actionDialog.type === 'approve' ? '请输入审批意见（可选）' : '请输入驳回原因'"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="actionDialog.visible = false">取消</el-button>
        <el-button
          :type="actionDialog.type === 'approve' ? 'success' : 'danger'"
          :loading="actionSubmitting"
          @click="submitAction"
        >
          确认{{ actionDialog.type === 'approve' ? '通过' : '驳回' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Download,
  Check,
  Close,
  Edit,
  Promotion,
  Delete,
  Refresh
} from '@element-plus/icons-vue'
import { getDetail, submitReimbursement, deleteReimbursement } from '@/api/reimbursement'
import { approve, reject } from '@/api/approval'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const actionLoading = ref(false)
const detail = ref({
  items: [],
  attachments: [],
  approvalRecords: []
})

const actionDialog = reactive({
  visible: false,
  type: 'approve'
})
const actionSubmitting = ref(false)
const opinionFormRef = ref(null)
const opinionForm = reactive({
  opinion: ''
})
const opinionRules = {
  opinion: [
    {
      validator: (_rule, value, callback) => {
        if (actionDialog.type === 'reject' && !value.trim()) {
          callback(new Error('驳回原因不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const isCurrentApprover = computed(() => {
  return detail.value.status === 'PENDING'
    && detail.value.currentApproverId
    && String(detail.value.currentApproverId) === String(userStore.userInfo?.id || userStore.userId)
})

const isApplicant = computed(() => {
  return detail.value.applicantId
    && String(detail.value.applicantId) === String(userStore.userInfo?.id || userStore.userId)
})

const formatMoney = (val) => {
  const n = Number(val) || 0
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatFileSize = (bytes) => {
  if (bytes == null) return '-'
  const n = Number(bytes) || 0
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

const statusTagType = (status) => {
  const map = {
    DRAFT: 'info',
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    PAID: 'primary'
  }
  return map[status] || 'info'
}

const statusLabel = (status) => {
  const map = {
    DRAFT: '草稿',
    PENDING: '审批中',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    PAID: '已付款'
  }
  return map[status] || status || '-'
}

const fetchDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('缺少报销单ID')
    return
  }
  loading.value = true
  try {
    const res = await getDetail(id)
    if (res.code === 200) {
      const data = res.data || {}
      detail.value = {
        ...data,
        items: data.items || [],
        attachments: data.attachments || [],
        approvalRecords: data.approvalRecords || data.records || []
      }
    } else {
      ElMessage.error(res.message || '获取详情失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '获取详情失败')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/my')
  }
}

const handleDownload = (row) => {
  if (!row.fileUrl) return
  window.open(row.fileUrl, '_blank')
}

const openActionDialog = (type) => {
  actionDialog.visible = true
  actionDialog.type = type
  opinionForm.opinion = ''
  if (opinionFormRef.value) {
    opinionFormRef.value.clearValidate()
  }
}

const handleApprove = () => {
  openActionDialog('approve')
}

const handleReject = () => {
  openActionDialog('reject')
}

const submitAction = async () => {
  if (!opinionFormRef.value) return
  try {
    await opinionFormRef.value.validate()
  } catch (_e) {
    return
  }
  actionSubmitting.value = true
  try {
    const res = actionDialog.type === 'approve'
      ? await approve(detail.value.id, opinionForm.opinion)
      : await reject(detail.value.id, opinionForm.opinion)
    if (res.code === 200) {
      ElMessage.success(actionDialog.type === 'approve' ? '审批通过成功' : '已驳回')
      actionDialog.visible = false
      fetchDetail()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    actionSubmitting.value = false
  }
}

const handleEdit = () => {
  router.push({
    path: '/submit',
    query: { id: detail.value.id }
  })
}

const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
      `确认提交报销单「${detail.value.title}」？提交后将进入审批流程。`,
      '提交确认',
      { confirmButtonText: '确认提交', cancelButtonText: '取消', type: 'info' }
    )
    actionLoading.value = true
    const res = await submitReimbursement(detail.value.id)
    if (res.code === 200) {
      ElMessage.success('提交成功，已进入审批流程')
      fetchDetail()
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '提交失败')
  } finally {
    actionLoading.value = false
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认删除报销单「${detail.value.title}」？删除后无法恢复。`,
      '删除确认',
      { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' }
    )
    actionLoading.value = true
    const res = await deleteReimbursement(detail.value.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      router.push('/my')
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '删除失败')
  } finally {
    actionLoading.value = false
  }
}

const handleResubmit = async () => {
  try {
    await ElMessageBox.confirm(
      `确认重新提交报销单「${detail.value.title}」？`,
      '重新提交',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'info' }
    )
    actionLoading.value = true
    const res = await submitReimbursement(detail.value.id)
    if (res.code === 200) {
      ElMessage.success('已重新提交，进入审批流程')
      fetchDetail()
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '提交失败')
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.detail-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.detail-card {
  max-width: 1280px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.status-tag {
  margin-left: auto;
}

.info-section {
  margin-bottom: 8px;
}

.section {
  margin-bottom: 8px;
}

.amount-value {
  color: #f56c6c;
  font-weight: 600;
}

.timeline-section {
  padding: 8px 4px;
  background: #fafafa;
  border-radius: 6px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.timeline-approver {
  font-weight: 600;
  color: #303133;
}

.timeline-opinion {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.opinion-label {
  color: #909399;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>
