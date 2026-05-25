<template>
  <div class="approval-page">
    <el-card class="approval-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#409EFF"><Stamp /></el-icon>
          <span class="card-title">审批工作台</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card" @tab-change="handleTabChange">
        <el-tab-pane label="待我审批" name="pending">
          <el-table
            v-loading="pendingLoading"
            :data="pendingList"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column
              prop="reimburseNo"
              label="报销单号"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="title"
              label="标题"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column prop="applicantName" label="申请人" width="110" />
            <el-table-column prop="typeName" label="类型" width="120" />
            <el-table-column label="金额(元)" width="130" align="right">
              <template #default="{ row }">
                <span class="amount-value">¥ {{ formatMoney(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="submitTime"
              label="提交时间"
              width="170"
              align="center"
            />
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  :icon="View"
                  @click="handleView(row)"
                >
                  查看
                </el-button>
                <el-button
                  type="success"
                  link
                  :icon="Check"
                  @click="handleApprove(row)"
                >
                  通过
                </el-button>
                <el-button
                  type="danger"
                  link
                  :icon="Close"
                  @click="handleReject(row)"
                >
                  驳回
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pendingPagination.pageNum"
              v-model:page-size="pendingPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pendingPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="fetchPendingList"
              @current-change="fetchPendingList"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="我已审批" name="approved">
          <el-table
            v-loading="approvedLoading"
            :data="approvedList"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column
              prop="reimburseNo"
              label="报销单号"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="title"
              label="标题"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column prop="applicantName" label="申请人" width="110" />
            <el-table-column prop="typeName" label="类型" width="120" />
            <el-table-column label="金额(元)" width="130" align="right">
              <template #default="{ row }">
                <span class="amount-value">¥ {{ formatMoney(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="我的操作" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.myAction === 'APPROVE' ? 'success' : 'danger'" effect="light">
                  {{ row.myAction === 'APPROVE' ? '通过' : '驳回' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="myOpinion"
              label="审批意见"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="approvalTime"
              label="审批时间"
              width="170"
              align="center"
            />
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  :icon="View"
                  @click="handleView(row)"
                >
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="approvedPagination.pageNum"
              v-model:page-size="approvedPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="approvedPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="fetchApprovedList"
              @current-change="fetchApprovedList"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
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
          <span>{{ actionDialog.row?.title }}</span>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Stamp, View, Check, Close } from '@element-plus/icons-vue'
import {
  getPendingApprovals,
  getRecords,
  approve,
  reject
} from '@/api/approval'

const router = useRouter()

const activeTab = ref('pending')

const pendingLoading = ref(false)
const pendingList = ref([])
const pendingPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const approvedLoading = ref(false)
const approvedList = ref([])
const approvedPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const actionDialog = reactive({
  visible: false,
  type: 'approve',
  row: null
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

const formatMoney = (val) => {
  const n = Number(val) || 0
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const fetchPendingList = async () => {
  pendingLoading.value = true
  try {
    const params = {
      pageNum: pendingPagination.pageNum,
      pageSize: pendingPagination.pageSize
    }
    const res = await getPendingApprovals(params)
    if (res.code === 200) {
      const data = res.data || {}
      const list = data.records || data.list || data.pendingList || []
      pendingList.value = Array.isArray(list) ? list : []
      pendingPagination.total = data.total || pendingList.value.length
    } else {
      ElMessage.error(res.message || '获取待审批列表失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '获取待审批列表失败')
  } finally {
    pendingLoading.value = false
  }
}

const fetchApprovedList = async () => {
  approvedLoading.value = true
  try {
    const params = {
      pageNum: approvedPagination.pageNum,
      pageSize: approvedPagination.pageSize
    }
    const res = await getRecords(params)
    if (res.code === 200) {
      const data = res.data || {}
      const list = data.records || data.list || data.approvedList || []
      approvedList.value = Array.isArray(list) ? list : []
      approvedPagination.total = data.total || approvedList.value.length
    } else {
      ElMessage.error(res.message || '获取已审批列表失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '获取已审批列表失败')
  } finally {
    approvedLoading.value = false
  }
}

const handleTabChange = (name) => {
  if (name === 'pending' && pendingList.value.length === 0) {
    fetchPendingList()
  } else if (name === 'approved' && approvedList.value.length === 0) {
    fetchApprovedList()
  }
}

const handleView = (row) => {
  router.push(`/detail/${row.id}`)
}

const openActionDialog = (type, row) => {
  actionDialog.visible = true
  actionDialog.type = type
  actionDialog.row = row
  opinionForm.opinion = ''
  if (opinionFormRef.value) {
    opinionFormRef.value.clearValidate()
  }
}

const handleApprove = (row) => {
  openActionDialog('approve', row)
}

const handleReject = (row) => {
  openActionDialog('reject', row)
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
    const row = actionDialog.row
    const res = actionDialog.type === 'approve'
      ? await approve(row.id, opinionForm.opinion)
      : await reject(row.id, opinionForm.opinion)
    if (res.code === 200) {
      ElMessage.success(actionDialog.type === 'approve' ? '审批通过成功' : '已驳回')
      actionDialog.visible = false
      fetchPendingList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    actionSubmitting.value = false
  }
}

onMounted(() => {
  fetchPendingList()
})
</script>

<style scoped>
.approval-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.approval-card {
  max-width: 1280px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.amount-value {
  color: #f56c6c;
  font-weight: 600;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
