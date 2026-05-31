<template>
  <div class="transfers-page">
    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="单号">
          <el-input v-model="queryParams.orderNo" placeholder="请输入调拨单号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable multiple collapse-tags style="width: 200px">
            <el-option
              v-for="(label, key) in statusTextMap"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 140px">
            <el-option label="应急调拨" value="emergency" />
            <el-option label="普通调拨" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="queryParams.priority" placeholder="全部" clearable style="width: 120px">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">查询</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增调拨</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table
        v-loading="loading"
        :data="transferList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="单号" min-width="150" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="fromWarehouseName" label="调出仓库" min-width="130" />
        <el-table-column prop="toWarehouseName" label="调入仓库" min-width="130" />
        <el-table-column prop="type" label="类型" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'emergency' ? 'danger' : ''" effect="plain">
              {{ row.type === 'emergency' ? '应急' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" min-width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="priorityTagType[row.priority]" effect="plain">
              {{ priorityTextMap[row.priority] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status]" effect="plain">
              {{ statusTextMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" min-width="160" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'draft'">
              <el-button type="primary" link size="small" @click="handleSubmit(row)">提交</el-button>
            </template>
            <template v-else-if="row.status === 'pending_approval'">
              <el-button type="success" link size="small" @click="handleApprove(row)">审批通过</el-button>
              <el-button type="danger" link size="small" @click="handleReject(row)">拒绝</el-button>
            </template>
            <template v-else-if="row.status === 'approved'">
              <el-button type="primary" link size="small" @click="handleSend(row)">发货</el-button>
            </template>
            <template v-else-if="row.status === 'in_transit'">
              <el-button type="primary" link size="small" @click="handleReceive(row)">收货</el-button>
            </template>
            <template v-else-if="row.status === 'received'">
              <el-button type="success" link size="small" @click="handleComplete(row)">完成</el-button>
            </template>
            <el-button type="info" link size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="createDialogVisible" title="新增调拨单" width="700px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入调拨标题" maxlength="200" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select v-model="createForm.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="应急调拨" value="emergency" />
                <el-option label="普通调拨" value="normal" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="createForm.priority" placeholder="请选择优先级" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="调出仓库" prop="fromWarehouseId">
              <el-select v-model="createForm.fromWarehouseId" placeholder="请选择调出仓库" style="width: 100%">
                <el-option
                  v-for="item in warehouseList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调入仓库" prop="toWarehouseId">
              <el-select v-model="createForm.toWarehouseId" placeholder="请选择调入仓库" style="width: 100%">
                <el-option
                  v-for="item in warehouseList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.id === createForm.fromWarehouseId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="物资明细" required>
          <div class="items-wrapper">
            <div v-for="(item, index) in createForm.items" :key="index" class="item-row">
              <el-select
                v-model="item.materialId"
                placeholder="选择物资"
                filterable
                style="width: 240px"
              >
                <el-option
                  v-for="mat in materialList"
                  :key="mat.id"
                  :label="mat.name"
                  :value="mat.id"
                />
              </el-select>
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="99999"
                placeholder="数量"
                style="width: 140px; margin-left: 10px"
              />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                style="margin-left: 10px"
                @click="removeItem(index)"
              />
            </div>
            <el-button type="primary" :icon="Plus" plain @click="addItem">添加物资</el-button>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="remarkDialogVisible" :title="remarkDialogTitle" width="500px" destroy-on-close>
      <el-form :model="remarkForm" label-width="80px">
        <el-form-item label="备注" required>
          <el-input
            v-model="remarkForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="remarkDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="remarkLoading" @click="submitRemark">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="调拨单详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="单号">{{ detailData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.type === 'emergency' ? '应急调拨' : '普通调拨' }}</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ priorityTextMap[detailData.priority] }}</el-descriptions-item>
        <el-descriptions-item label="调出仓库">{{ detailData.fromWarehouseName }}</el-descriptions-item>
        <el-descriptions-item label="调入仓库">{{ detailData.toWarehouseName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType[detailData.status]" effect="plain">
            {{ statusTextMap[detailData.status] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detailData.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '--' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { transferApi, warehouseApi, materialApi } from '@/api'

const statusTextMap = {
  draft: '草稿',
  pending_approval: '待审批',
  approved: '已审批',
  rejected: '已拒绝',
  in_transit: '运输中',
  received: '已收货',
  completed: '已完成',
  cancelled: '已取消'
}

const statusTagType = {
  draft: 'info',
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'danger',
  in_transit: 'primary',
  received: 'primary',
  completed: 'success',
  cancelled: 'info'
}

const priorityTextMap = {
  high: '高',
  medium: '中',
  low: '低'
}

const priorityTagType = {
  high: 'danger',
  medium: 'warning',
  low: 'info'
}

const loading = ref(false)
const createLoading = ref(false)
const remarkLoading = ref(false)
const transferList = ref([])
const total = ref(0)
const warehouseList = ref([])
const materialList = ref([])
const createDialogVisible = ref(false)
const remarkDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const createFormRef = ref(null)
const remarkDialogTitle = ref('')
const remarkAction = ref('')
const currentRow = ref({})
const detailData = ref({})

const queryParams = reactive({
  orderNo: '',
  status: [],
  type: undefined,
  priority: undefined,
  dateRange: null,
  page: 1,
  pageSize: 10
})

const createForm = reactive({
  title: '',
  type: 'normal',
  priority: 'medium',
  fromWarehouseId: undefined,
  toWarehouseId: undefined,
  items: [{ materialId: undefined, quantity: 1 }],
  remark: ''
})

const createRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  fromWarehouseId: [{ required: true, message: '请选择调出仓库', trigger: 'change' }],
  toWarehouseId: [{ required: true, message: '请选择调入仓库', trigger: 'change' }]
}

const remarkForm = reactive({ remark: '' })

async function loadWarehouses() {
  try {
    const res = await warehouseApi.getAll()
    warehouseList.value = res.data || []
  } catch {
    warehouseList.value = []
  }
}

async function loadMaterials() {
  try {
    const res = await materialApi.getList({ pageSize: 9999, status: 1 })
    materialList.value = res.data?.records || res.data?.list || res.data || []
  } catch {
    materialList.value = []
  }
}

async function loadData() {
  loading.value = true
  try {
    const params = {
      page: queryParams.page,
      pageSize: queryParams.pageSize
    }
    if (queryParams.orderNo) params.orderNo = queryParams.orderNo
    if (queryParams.status.length) params.status = queryParams.status.join(',')
    if (queryParams.type) params.type = queryParams.type
    if (queryParams.priority) params.priority = queryParams.priority
    if (queryParams.dateRange?.length === 2) {
      params.startDate = queryParams.dateRange[0]
      params.endDate = queryParams.dateRange[1]
    }
    const res = await transferApi.getList(params)
    transferList.value = res.data?.records || res.data?.list || []
    total.value = res.data?.total || 0
  } catch {
    transferList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  queryParams.orderNo = ''
  queryParams.status = []
  queryParams.type = undefined
  queryParams.priority = undefined
  queryParams.dateRange = null
  queryParams.page = 1
  loadData()
}

function openCreateDialog() {
  createForm.title = ''
  createForm.type = 'normal'
  createForm.priority = 'medium'
  createForm.fromWarehouseId = undefined
  createForm.toWarehouseId = undefined
  createForm.items = [{ materialId: undefined, quantity: 1 }]
  createForm.remark = ''
  createDialogVisible.value = true
}

function addItem() {
  createForm.items.push({ materialId: undefined, quantity: 1 })
}

function removeItem(index) {
  if (createForm.items.length <= 1) {
    ElMessage.warning('至少保留一条物资明细')
    return
  }
  createForm.items.splice(index, 1)
}

async function submitCreate() {
  try {
    await createFormRef.value.validate()
  } catch {
    return
  }
  const validItems = createForm.items.filter(item => item.materialId && item.quantity > 0)
  if (!validItems.length) {
    ElMessage.warning('请至少添加一条物资明细')
    return
  }
  if (createForm.fromWarehouseId === createForm.toWarehouseId) {
    ElMessage.warning('调出仓库与调入仓库不能相同')
    return
  }
  createLoading.value = true
  try {
    await transferApi.create({
      title: createForm.title,
      type: createForm.type,
      priority: createForm.priority,
      fromWarehouseId: createForm.fromWarehouseId,
      toWarehouseId: createForm.toWarehouseId,
      items: validItems.map(item => ({
        materialId: item.materialId,
        applyQuantity: item.quantity
      })),
      remark: createForm.remark
    })
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    loadData()
  } catch {
    // error handled by interceptor
  } finally {
    createLoading.value = false
  }
}

async function handleSubmit(row) {
  try {
    await ElMessageBox.confirm(`确定提交调拨单 ${row.orderNo} 吗？`, '提交确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await transferApi.submit(row.id)
    ElMessage.success('提交成功')
    loadData()
  } catch {
    // cancelled or error
  }
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm(`确定审批通过调拨单 ${row.orderNo} 吗？`, '审批确认', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success'
    })
    await transferApi.approve(row.id, { approved: true })
    ElMessage.success('审批通过')
    loadData()
  } catch {
    // cancelled or error
  }
}

function handleReject(row) {
  currentRow.value = row
  remarkDialogTitle.value = '拒绝调拨单'
  remarkAction.value = 'reject'
  remarkForm.remark = ''
  remarkDialogVisible.value = true
}

async function handleSend(row) {
  try {
    await ElMessageBox.confirm(`确定对调拨单 ${row.orderNo} 发货吗？`, '发货确认', {
      confirmButtonText: '确定发货',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await transferApi.send(row.id, {})
    ElMessage.success('发货成功')
    loadData()
  } catch {
    // cancelled or error
  }
}

async function handleReceive(row) {
  try {
    await ElMessageBox.confirm(`确定签收调拨单 ${row.orderNo} 吗？`, '收货确认', {
      confirmButtonText: '确定收货',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await transferApi.receive(row.id, {})
    ElMessage.success('收货成功')
    loadData()
  } catch {
    // cancelled or error
  }
}

async function handleComplete(row) {
  try {
    await ElMessageBox.confirm(`确定完成调拨单 ${row.orderNo} 吗？`, '完成确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    await transferApi.approve(row.id, { completed: true })
    ElMessage.success('已完成')
    loadData()
  } catch {
    // cancelled or error
  }
}

async function viewDetail(row) {
  try {
    const res = await transferApi.getById(row.id)
    detailData.value = res.data || {}
    detailDialogVisible.value = true
  } catch {
    // error handled by interceptor
  }
}

async function submitRemark() {
  if (!remarkForm.remark.trim()) {
    ElMessage.warning('请输入备注')
    return
  }
  remarkLoading.value = true
  try {
    if (remarkAction.value === 'reject') {
      await transferApi.reject(currentRow.value.id, { remark: remarkForm.remark })
      ElMessage.success('已拒绝')
    }
    remarkDialogVisible.value = false
    loadData()
  } catch {
    // error handled by interceptor
  } finally {
    remarkLoading.value = false
  }
}

onMounted(() => {
  loadWarehouses()
  loadMaterials()
  loadData()
})
</script>

<style scoped>
.transfers-page {
  height: 100%;
}

.filter-card :deep(.el-card__body) {
  padding-bottom: 0;
}

.items-wrapper {
  width: 100%;
}

.item-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
