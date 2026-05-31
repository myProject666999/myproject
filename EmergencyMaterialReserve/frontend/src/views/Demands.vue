<template>
  <div class="demands-page">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="单号">
          <el-input v-model="filter.docNo" placeholder="请输入单号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="草稿" value="draft" />
            <el-option label="待审批" value="pending_approval" />
            <el-option label="已审批" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-select v-model="filter.urgency" placeholder="请选择紧急程度" clearable style="width: 130px">
            <el-option label="一般" value="low" />
            <el-option label="紧急" value="medium" />
            <el-option label="特急" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="filter.department" placeholder="请输入部门" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleResetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>需求申报列表</span>
          <el-button type="primary" @click="openCreateDialog">新增需求</el-button>
        </div>
      </template>

      <el-table :data="demandList" v-loading="tableLoading" stripe border style="width: 100%">
        <el-table-column prop="docNo" label="单号" width="180" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="urgency" label="紧急程度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="urgencyTagType[row.urgency]" size="small">
              {{ urgencyMap[row.urgency] || row.urgency }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status]" size="small">
              {{ statusMap[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'draft'"
              type="primary"
              link
              size="small"
              @click="handleSubmit(row)"
            >提交</el-button>
            <el-button
              v-if="row.status === 'pending_approval'"
              type="success"
              link
              size="small"
              @click="handleApprove(row)"
            >审批通过</el-button>
            <el-button
              v-if="row.status === 'pending_approval'"
              type="danger"
              link
              size="small"
              @click="handleReject(row)"
            >拒绝</el-button>
            <el-button
              v-if="row.status === 'processing'"
              type="success"
              link
              size="small"
              @click="handleComplete(row)"
            >完成</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadDemands"
          @current-change="loadDemands"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="新增需求申报"
      width="700px"
      destroy-on-close
      @close="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="createForm.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-input v-model="createForm.department" placeholder="请输入部门" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急程度" prop="urgency">
              <el-select v-model="createForm.urgency" placeholder="请选择紧急程度" style="width: 100%">
                <el-option label="一般" value="low" />
                <el-option label="紧急" value="medium" />
                <el-option label="特急" value="high" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需求日期" prop="demandDate">
              <el-date-picker
                v-model="createForm.demandDate"
                type="date"
                placeholder="请选择需求日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="原因" prop="reason">
          <el-input
            v-model="createForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入需求原因"
          />
        </el-form-item>
        <el-form-item label="物资明细" required>
          <div class="detail-table-wrap">
            <el-table :data="createForm.items" border size="small" style="width: 100%">
              <el-table-column label="物资" min-width="200">
                <template #default="{ row }">
                  <el-select v-model="row.materialId" placeholder="请选择物资" filterable style="width: 100%">
                    <el-option
                      v-for="m in materialList"
                      :key="m.id"
                      :label="m.name"
                      :value="m.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="数量" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.quantity" :min="1" size="small" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    size="small"
                    @click="removeItem($index)"
                    :disabled="createForm.items.length <= 1"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" link @click="addItem" style="margin-top: 8px">
              + 添加物资
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="createLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { demandApi, materialApi } from '@/api'

const tableLoading = ref(false)
const createLoading = ref(false)
const dialogVisible = ref(false)
const createFormRef = ref(null)

const demandList = ref([])
const materialList = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const filter = reactive({
  docNo: '',
  status: '',
  urgency: '',
  department: ''
})

const statusMap = {
  draft: '草稿',
  pending_approval: '待审批',
  approved: '已审批',
  rejected: '已拒绝',
  processing: '处理中',
  completed: '已完成'
}

const statusTagType = {
  draft: 'info',
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'danger',
  processing: 'primary',
  completed: 'success'
}

const urgencyMap = {
  low: '一般',
  medium: '紧急',
  high: '特急'
}

const urgencyTagType = {
  low: 'info',
  medium: 'warning',
  high: 'danger'
}

const createForm = reactive({
  title: '',
  department: '',
  urgency: '',
  demandDate: '',
  reason: '',
  items: [{ materialId: null, quantity: 1 }]
})

const createRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  demandDate: [{ required: true, message: '请选择需求日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入需求原因', trigger: 'blur' }]
}

function addItem() {
  createForm.items.push({ materialId: null, quantity: 1 })
}

function removeItem(index) {
  createForm.items.splice(index, 1)
}

async function loadMaterialList() {
  try {
    const res = await materialApi.getList({ pageSize: 1000 })
    materialList.value = res.data?.list || res.data || res.list || []
  } catch {
    materialList.value = []
  }
}

async function loadDemands() {
  tableLoading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (filter.docNo) params.docNo = filter.docNo
    if (filter.status) params.status = filter.status
    if (filter.urgency) params.urgency = filter.urgency
    if (filter.department) params.department = filter.department

    const res = await demandApi.getList(params)
    const data = res.data || res
    demandList.value = data.list || data.records || []
    pagination.total = data.total || 0
  } catch {
    demandList.value = []
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadDemands()
}

function handleResetFilter() {
  filter.docNo = ''
  filter.status = ''
  filter.urgency = ''
  filter.department = ''
  pagination.page = 1
  loadDemands()
}

function openCreateDialog() {
  dialogVisible.value = true
}

function resetCreateForm() {
  createForm.title = ''
  createForm.department = ''
  createForm.urgency = ''
  createForm.demandDate = ''
  createForm.reason = ''
  createForm.items = [{ materialId: null, quantity: 1 }]
  createFormRef.value?.resetFields()
}

async function handleCreate() {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const hasEmptyMaterial = createForm.items.some(item => !item.materialId)
  if (hasEmptyMaterial) {
    ElMessage.warning('请选择物资')
    return
  }

  createLoading.value = true
  try {
    await demandApi.create({
      title: createForm.title,
      department: createForm.department,
      urgency: createForm.urgency,
      demandDate: createForm.demandDate,
      reason: createForm.reason,
      items: createForm.items
    })
    ElMessage.success('创建成功')
    dialogVisible.value = false
    loadDemands()
  } catch {
    // error handled by interceptor
  } finally {
    createLoading.value = false
  }
}

async function handleSubmit(row) {
  try {
    await ElMessageBox.confirm('确定提交该需求申报？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await demandApi.submit(row.id)
    ElMessage.success('提交成功')
    loadDemands()
  } catch {
    // cancelled or error
  }
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm('确定审批通过？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await demandApi.approve(row.id)
    ElMessage.success('审批通过')
    loadDemands()
  } catch {
    // cancelled or error
  }
}

async function handleReject(row) {
  try {
    await ElMessageBox.prompt('请输入拒绝原因', '拒绝', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '请输入拒绝原因'
    }).then(async ({ value }) => {
      await demandApi.reject(row.id, { reason: value })
      ElMessage.success('已拒绝')
      loadDemands()
    })
  } catch {
    // cancelled or error
  }
}

async function handleComplete(row) {
  try {
    await ElMessageBox.confirm('确定标记为完成？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await demandApi.approve(row.id, { status: 'completed' })
    ElMessage.success('已完成')
    loadDemands()
  } catch {
    // cancelled or error
  }
}

onMounted(() => {
  loadMaterialList()
  loadDemands()
})
</script>

<style scoped>
.demands-page {
  padding: 0;
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 4px;
}

.filter-card :deep(.el-card__body) {
  padding-bottom: 2px;
}

.table-card {
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-table-wrap {
  width: 100%;
}
</style>
