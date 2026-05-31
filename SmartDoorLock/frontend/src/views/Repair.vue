<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">报修管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增工单</el-button>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">待分配</div>
          <div class="stat-card-value text-warning">
            {{ statusStats.PENDING || 0 }}<span class="stat-card-unit">单</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">已分配</div>
          <div class="stat-card-value text-primary">
            {{ statusStats.ASSIGNED || 0 }}<span class="stat-card-unit">单</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">处理中</div>
          <div class="stat-card-value text-info">
            {{ statusStats.PROCESSING || 0 }}<span class="stat-card-unit">单</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">已完成</div>
          <div class="stat-card-value text-success">
            {{ statusStats.COMPLETED || 0 }}<span class="stat-card-unit">单</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="search-bar">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="工单号/房源/租客"
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
            <el-option label="待分配" value="PENDING" />
            <el-option label="已分配" value="ASSIGNED" />
            <el-option label="处理中" value="PROCESSING" />
            <el-option label="已完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select
            v-model="queryForm.priority"
            placeholder="全部优先级"
            clearable
            style="width: 120px"
          >
            <el-option label="低" value="LOW" />
            <el-option label="中" value="MEDIUM" />
            <el-option label="高" value="HIGH" />
            <el-option label="紧急" value="URGENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="报修类型">
          <el-select
            v-model="queryForm.repairType"
            placeholder="全部类型"
            clearable
            style="width: 140px"
          >
            <el-option label="水电维修" value="PLUMBING_ELECTRICAL" />
            <el-option label="家电维修" value="APPLIANCE" />
            <el-option label="家具维修" value="FURNITURE" />
            <el-option label="门锁维修" value="LOCK" />
            <el-option label="其他" value="OTHER" />
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
        <el-table-column prop="orderNo" label="工单号" width="140" />
        <el-table-column prop="apartmentNo" label="房源" width="100" />
        <el-table-column prop="tenantName" label="报修人" width="100" />
        <el-table-column prop="repairType" label="报修类型" width="110">
          <template #default="{ row }">
            {{ { PLUMBING_ELECTRICAL: '水电维修', APPLIANCE: '家电维修', FURNITURE: '家具维修', LOCK: '门锁维修', OTHER: '其他' }[row.repairType] }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)">
              {{ getStatusText(row.priority, 'priority') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="问题描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="assigneeName" label="处理人" width="100">
          <template #default="{ row }">
            {{ row.assigneeName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status, 'repair') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="costAmount" label="费用(元)" width="100">
          <template #default="{ row }">
            {{ row.costAmount ? '¥' + formatMoney(row.costAmount) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">详情</el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              type="primary"
              link
              @click="handleAssign(row)"
            >
              分配
            </el-button>
            <el-button
              v-if="row.status === 'ASSIGNED'"
              type="warning"
              link
              @click="handleStartProcess(row)"
            >
              开始处理
            </el-button>
            <el-button
              v-if="row.status === 'PROCESSING'"
              type="success"
              link
              @click="handleComplete(row)"
            >
              完成
            </el-button>
            <el-button
              v-if="row.status === 'COMPLETED' && !row.satisfactionScore"
              type="warning"
              link
              @click="handleEvaluate(row)"
            >
              评价
            </el-button>
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
      v-model="assignDialogVisible"
      title="分配工单"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border class="mb-20">
        <el-descriptions-item label="工单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="问题描述">{{ currentOrder.description }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="assignForm" :rules="assignRules" ref="assignFormRef" label-width="100px">
        <el-form-item label="处理人ID" prop="assigneeId">
          <el-input-number v-model="assignForm.assigneeId" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="处理人姓名" prop="assigneeName">
          <el-input v-model="assignForm.assigneeName" placeholder="请输入处理人姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleAssignSubmit">确认分配</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="processDialogVisible"
      title="处理工单"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border class="mb-20">
        <el-descriptions-item label="工单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="问题描述">{{ currentOrder.description }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="processForm" :rules="processRules" ref="processFormRef" label-width="100px">
        <el-form-item label="处理说明" prop="processDescription">
          <el-input
            v-model="processForm.processDescription"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleProcessSubmit">开始处理</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="completeDialogVisible"
      title="完成工单"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border class="mb-20">
        <el-descriptions-item label="工单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="问题描述">{{ currentOrder.description }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="completeForm" :rules="completeRules" ref="completeFormRef" label-width="100px">
        <el-form-item label="处理说明" prop="processDescription">
          <el-input
            v-model="completeForm.processDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入处理结果说明"
          />
        </el-form-item>
        <el-form-item label="维修费用">
          <el-input-number
            v-model="completeForm.costAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="费用承担方">
          <el-select v-model="completeForm.costBearer" clearable style="width: 100%">
            <el-option label="租客承担" value="TENANT" />
            <el-option label="业主承担" value="OWNER" />
            <el-option label="公司承担" value="COMPANY" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleCompleteSubmit">确认完成</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="evaluateDialogVisible"
      title="评价工单"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border class="mb-20">
        <el-descriptions-item label="工单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="问题描述">{{ currentOrder.description }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="evaluateForm" :rules="evaluateRules" ref="evaluateFormRef" label-width="100px">
        <el-form-item label="满意度评分" prop="satisfactionScore">
          <el-rate v-model="evaluateForm.satisfactionScore" :max="5" show-text />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input
            v-model="evaluateForm.satisfactionComment"
            type="textarea"
            :rows="3"
            placeholder="请输入评价内容（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleEvaluateSubmit">提交评价</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="工单详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单号">{{ detailData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(detailData.status)">
            {{ getStatusText(detailData.status, 'repair') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="房源">{{ detailData.apartmentNo }}</el-descriptions-item>
        <el-descriptions-item label="租客">{{ detailData.tenantName }}</el-descriptions-item>
        <el-descriptions-item label="报修类型">
          {{ { PLUMBING_ELECTRICAL: '水电维修', APPLIANCE: '家电维修', FURNITURE: '家具维修', LOCK: '门锁维修', OTHER: '其他' }[detailData.repairType] }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityTagType(detailData.priority)">
            {{ getStatusText(detailData.priority, 'priority') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="2">{{ detailData.description }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ detailData.assigneeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="维修费用">
          {{ detailData.costAmount ? '¥' + formatMoney(detailData.costAmount) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="费用承担方">
          {{ { TENANT: '租客承担', OWNER: '业主承担', COMPANY: '公司承担' }[detailData.costBearer] || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="处理过程" :span="2">{{ detailData.processDescription || '-' }}</el-descriptions-item>
        <el-descriptions-item label="满意度">
          {{ detailData.satisfactionScore ? detailData.satisfactionScore + '分' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="评价内容" :span="2">{{ detailData.satisfactionComment || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ detailData.completeTime ? formatDateTime(detailData.completeTime) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, View } from '@element-plus/icons-vue'
import {
  getRepairPage,
  assignRepair,
  startProcessRepair,
  completeRepair,
  evaluateRepair,
  createRepair,
  getRepairDetail
} from '@/api/repair'
import { formatDateTime, formatMoney, getStatusTagType, getStatusText, getPriorityTagType } from '@/utils/format'

const loading = ref(false)
const submitLoading = ref(false)
const assignDialogVisible = ref(false)
const processDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const evaluateDialogVisible = ref(false)
const detailVisible = ref(false)
const assignFormRef = ref()
const processFormRef = ref()
const completeFormRef = ref()
const evaluateFormRef = ref()
const total = ref(0)
const tableData = ref([])
const detailData = ref({})
const currentOrder = ref({})

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  priority: '',
  repairType: '',
  apartmentId: null
})

const assignForm = reactive({
  assigneeId: null,
  assigneeName: ''
})

const processForm = reactive({
  processDescription: ''
})

const completeForm = reactive({
  processDescription: '',
  costAmount: null,
  costBearer: ''
})

const evaluateForm = reactive({
  satisfactionScore: null,
  satisfactionComment: ''
})

const assignRules = {
  assigneeId: [{ required: true, message: '请输入处理人ID', trigger: 'blur' }],
  assigneeName: [{ required: true, message: '请输入处理人姓名', trigger: 'blur' }]
}

const processRules = {
  processDescription: [{ required: true, message: '请输入处理说明', trigger: 'blur' }]
}

const completeRules = {
  processDescription: [{ required: true, message: '请输入处理说明', trigger: 'blur' }]
}

const evaluateRules = {
  satisfactionScore: [{ required: true, message: '请选择评分', trigger: 'change' }]
}

const statusStats = computed(() => {
  const stats = {}
  tableData.value.forEach(item => {
    stats[item.status] = (stats[item.status] || 0) + 1
  })
  return stats
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getRepairPage(queryForm)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  fetchData()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.status = ''
  queryForm.priority = ''
  queryForm.repairType = ''
  handleSearch()
}

function handleAdd() {
  ElMessage.info('新增工单功能开发中')
}

function handleAssign(row) {
  currentOrder.value = row
  assignForm.assigneeId = null
  assignForm.assigneeName = ''
  assignDialogVisible.value = true
}

async function handleAssignSubmit() {
  if (!assignFormRef.value) return
  
  try {
    await assignFormRef.value.validate()
    submitLoading.value = true
    
    await assignRepair(currentOrder.value.id, assignForm.assigneeId, assignForm.assigneeName)
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== false) {
      console.error('Assign error:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

function handleStartProcess(row) {
  currentOrder.value = row
  processForm.processDescription = ''
  processDialogVisible.value = true
}

async function handleProcessSubmit() {
  if (!processFormRef.value) return
  
  try {
    await processFormRef.value.validate()
    submitLoading.value = true
    
    await startProcessRepair(currentOrder.value.id, processForm.processDescription)
    ElMessage.success('已开始处理')
    processDialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== false) {
      console.error('Process error:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

function handleComplete(row) {
  currentOrder.value = row
  completeForm.processDescription = ''
  completeForm.costAmount = null
  completeForm.costBearer = ''
  completeDialogVisible.value = true
}

async function handleCompleteSubmit() {
  if (!completeFormRef.value) return
  
  try {
    await completeFormRef.value.validate()
    submitLoading.value = true
    
    await completeRepair(
      currentOrder.value.id,
      completeForm.processDescription,
      completeForm.costAmount,
      completeForm.costBearer
    )
    ElMessage.success('工单已完成')
    completeDialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== false) {
      console.error('Complete error:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

function handleEvaluate(row) {
  currentOrder.value = row
  evaluateForm.satisfactionScore = null
  evaluateForm.satisfactionComment = ''
  evaluateDialogVisible.value = true
}

async function handleEvaluateSubmit() {
  if (!evaluateFormRef.value) return
  
  try {
    await evaluateFormRef.value.validate()
    submitLoading.value = true
    
    await evaluateRepair(currentOrder.value.id, evaluateForm.satisfactionScore, evaluateForm.satisfactionComment)
    ElMessage.success('评价成功')
    evaluateDialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== false) {
      console.error('Evaluate error:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

async function handleView(row) {
  const res = await getRepairDetail(row.id)
  detailData.value = res.data
  detailVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>
