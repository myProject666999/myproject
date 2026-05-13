<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-select v-model="filter.status" placeholder="工单状态" clearable style="width: 150px" @change="fetchList">
        <el-option label="待处理" value="pending" />
        <el-option label="处理中" value="processing" />
        <el-option label="待审核" value="reviewing" />
        <el-option label="已返修" value="revised" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-select v-model="filter.type" placeholder="工单类型" clearable style="width: 150px" @change="fetchList">
        <el-option label="二修" value="second_revision" />
        <el-option label="精修" value="retouch" />
        <el-option label="设计" value="design" />
      </el-select>
      <el-button type="primary" @click="fetchList">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="success" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增工单
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="工单号" width="180" />
        <el-table-column label="订单信息" width="200">
          <template #default="{ row }">
            <div>{{ row.appointment?.orderNo }}</div>
            <div style="color: #909399; font-size: 12px;">{{ row.appointment?.customer?.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分配给" width="100">
          <template #default="{ row }">
            {{ row.assignee?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityTag(row.priority)">{{ getPriorityText(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="截止日期" width="120">
          <template #default="{ row }">
            {{ row.dueDate ? formatDate(row.dueDate) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="success" @click="handleUpdateStatus(row)">状态</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="关联订单" prop="appointmentId">
          <el-select v-model="form.appointmentId" filterable placeholder="请选择订单" style="width: 100%">
            <el-option
              v-for="a in appointments"
              :key="a.id"
              :label="`${a.orderNo} - ${a.customer?.name}`"
              :value="a.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工单类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="二修" value="second_revision" />
            <el-option label="精修" value="retouch" />
            <el-option label="设计" value="design" />
          </el-select>
        </el-form-item>
        <el-form-item label="分配给" prop="assigneeId">
          <el-select v-model="form.assigneeId" placeholder="请选择处理人员" clearable style="width: 100%">
            <el-option
              v-for="u in staff"
              :key="u.id"
              :label="u.name"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="普通" value="normal" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            placeholder="选择截止日期"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="修图要求" prop="requirements">
          <el-input v-model="form.requirements" type="textarea" :rows="3" placeholder="请输入修图要求" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="statusDialogVisible" title="更新工单状态" width="450px">
      <el-form label-width="80px">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusTag(currentWorkOrder?.status)">
            {{ getStatusText(currentWorkOrder?.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="更新为">
          <el-select v-model="selectedStatus" style="width: 100%">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="待审核" value="reviewing" />
            <el-option label="已返修" value="revised" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="反馈意见" v-if="['revised', 'completed'].includes(selectedStatus)">
          <el-input v-model="feedback" type="textarea" :rows="2" placeholder="请输入反馈意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="statusLoading" @click="handleStatusSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  updateWorkOrderStatus,
  getAppointments,
  getStaff
} from '@/api'

const loading = ref(false)
const submitLoading = ref(false)
const statusLoading = ref(false)
const dialogVisible = ref(false)
const statusDialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

const filter = reactive({
  status: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])
const appointments = ref([])
const staff = ref([])
const currentWorkOrder = ref(null)
const selectedStatus = ref('')
const feedback = ref('')

const form = reactive({
  id: null,
  appointmentId: null,
  type: 'retouch',
  assigneeId: null,
  priority: 'normal',
  dueDate: null,
  requirements: '',
  remark: ''
})

const rules = {
  appointmentId: [{ required: true, message: '请选择订单', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑工单' : '新增工单')

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD')

const getTypeText = (type) => {
  const map = { second_revision: '二修', retouch: '精修', design: '设计' }
  return map[type] || type
}

const getTypeTag = (type) => {
  const map = { second_revision: 'warning', retouch: 'primary', design: 'success' }
  return map[type] || 'info'
}

const getPriorityText = (p) => {
  const map = { low: '低', normal: '普通', high: '高', urgent: '紧急' }
  return map[p] || p
}

const getPriorityTag = (p) => {
  const map = { low: 'info', normal: '', high: 'warning', urgent: 'danger' }
  return map[p] || ''
}

const getStatusText = (status) => {
  const map = {
    pending: '待处理',
    processing: '处理中',
    reviewing: '待审核',
    revised: '已返修',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = {
    pending: 'warning',
    processing: 'primary',
    reviewing: 'info',
    revised: 'success',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const fetchList = async () => {
  loading.value = true
  try {
    const data = await getWorkOrders({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filter
    })
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchAppointments = async () => {
  try {
    const data = await getAppointments({ pageSize: 1000 })
    appointments.value = data.list
  } catch (error) {
    console.error(error)
  }
}

const fetchStaff = async () => {
  try {
    const data = await getStaff()
    staff.value = data
  } catch (error) {
    console.error(error)
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    appointmentId: null,
    type: 'retouch',
    assigneeId: null,
    priority: 'normal',
    dueDate: null,
    requirements: '',
    remark: ''
  })
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    ...row,
    dueDate: row.dueDate ? dayjs(row.dueDate).toDate() : null
  })
  dialogVisible.value = true
}

const handleUpdateStatus = (row) => {
  currentWorkOrder.value = row
  selectedStatus.value = row.status
  feedback.value = ''
  statusDialogVisible.value = true
}

const handleStatusSubmit = async () => {
  try {
    statusLoading.value = true
    await updateWorkOrderStatus(currentWorkOrder.value.id, selectedStatus.value, feedback.value)
    ElMessage.success('状态更新成功')
    statusDialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
  } finally {
    statusLoading.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该工单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteWorkOrder(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    const submitData = {
      ...form,
      dueDate: form.dueDate ? dayjs(form.dueDate).format('YYYY-MM-DD') : null
    }
    if (isEdit.value) {
      await updateWorkOrder(form.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createWorkOrder(submitData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchList()
  fetchAppointments()
  fetchStaff()
})
</script>
