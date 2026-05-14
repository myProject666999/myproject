<template>
  <div class="reservations-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>预约管理</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增预约
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="未到场" value="no_show" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="searchForm.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadReservations">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="reservations" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="reservation_no" label="预约编号" width="150" />
        <el-table-column prop="bay_number" label="打位" width="100" />
        <el-table-column label="客户" width="130">
          <template #default="{ row }">
            <div>{{ row.member_name || row.customer_name }}</div>
            <div class="text-sm">{{ row.customer_phone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="reservation_date" label="日期" width="110" />
        <el-table-column label="时间" width="140">
          <template #default="{ row }">
            {{ row.start_time }} - {{ row.end_time }}
          </template>
        </el-table-column>
        <el-table-column prop="coach_name" label="教练" width="100">
          <template #default="{ row }">
            {{ row.coach_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="balls_count" label="球数" width="70" />
        <el-table-column prop="total_amount" label="金额" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.total_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-dropdown @command="handleStatusChange($event, row)" v-if="['pending', 'confirmed', 'in_progress'].includes(row.status)">
              <el-button type="success" link size="small">更新状态</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="row.status === 'pending'" command="confirmed">确认</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'confirmed'" command="in_progress">开始</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'in_progress'" command="completed">完成</el-dropdown-item>
                  <el-dropdown-item command="cancelled" divided>取消</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="handleDialogClose">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="打位" prop="bay_id">
              <el-select v-model="form.bay_id" placeholder="请选择打位" style="width: 100%">
                <el-option v-for="bay in availableBays" :key="bay.id" :label="`${bay.bay_number} - ${getBayTypeText(bay.bay_type)}`" :value="bay.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教练">
              <el-select v-model="form.coach_id" placeholder="请选择教练（可选）" clearable style="width: 100%">
                <el-option v-for="coach in coaches" :key="coach.id" :label="`${coach.coach_name} (${coach.title})`" :value="coach.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customer_name">
              <el-input v-model="form.customer_name" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="customer_phone">
              <el-input v-model="form.customer_phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预约日期" prop="reservation_date">
              <el-date-picker
                v-model="form.reservation_date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="开始时间" prop="start_time">
              <el-time-picker
                v-model="form.start_time"
                placeholder="开始时间"
                value-format="HH:mm:ss"
                format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="结束时间" prop="end_time">
              <el-time-picker
                v-model="form.end_time"
                placeholder="结束时间"
                value-format="HH:mm:ss"
                format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="球数" prop="balls_count">
              <el-input-number v-model="form.balls_count" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="总金额" prop="total_amount">
              <el-input-number v-model="form.total_amount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="待确认" value="pending" />
                <el-option label="已确认" value="confirmed" />
                <el-option label="进行中" value="in_progress" />
                <el-option label="已完成" value="completed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付方式">
              <el-select v-model="form.payment_method" placeholder="请选择支付方式" clearable style="width: 100%">
                <el-option label="现金" value="cash" />
                <el-option label="刷卡" value="card" />
                <el-option label="余额" value="balance" />
                <el-option label="微信" value="wechat" />
                <el-option label="支付宝" value="alipay" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已付金额">
              <el-input-number v-model="form.paid_amount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const reservations = ref([])
const availableBays = ref([])
const coaches = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const submitting = ref(false)

const today = new Date().toISOString().split('T')[0]

const searchForm = reactive({
  status: '',
  date: ''
})

const form = reactive({
  id: null,
  member_id: null,
  customer_name: '',
  customer_phone: '',
  bay_id: null,
  reservation_date: today,
  start_time: '09:00:00',
  end_time: '10:00:00',
  coach_id: null,
  balls_count: 50,
  status: 'pending',
  payment_method: '',
  total_amount: 50,
  paid_amount: 0,
  remark: ''
})

const rules = {
  bay_id: [{ required: true, message: '请选择打位', trigger: 'change' }],
  customer_name: [{ required: true, message: '请输入客户姓名', trigger: 'change' }],
  customer_phone: [{ required: true, message: '请输入联系电话', trigger: 'change' }],
  reservation_date: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end_time: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑预约' : '新增预约')

const getStatusText = (status) => {
  const map = {
    pending: '待确认',
    confirmed: '已确认',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    no_show: '未到场'
  }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'primary',
    in_progress: 'success',
    completed: 'info',
    cancelled: 'info',
    no_show: 'danger'
  }
  return map[status] || 'info'
}

const getBayTypeText = (type) => {
  const map = { single: '单人', double: '双人', vip: 'VIP' }
  return map[type] || type
}

const loadReservations = async () => {
  loading.value = true
  try {
    const res = await request.get('/reservations')
    reservations.value = res.data || []
  } catch (error) {
    ElMessage.error('加载预约列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const loadBays = async () => {
  try {
    const res = await request.get('/bays')
    availableBays.value = (res.data || []).filter(b => b.status === 'available')
  } catch (error) {
    ElMessage.error('加载打位失败')
  }
}

const loadCoaches = async () => {
  try {
    const res = await request.get('/coaches')
    coaches.value = (res.data || []).filter(c => c.status === 1)
  } catch (error) {
    ElMessage.error('加载教练失败')
  }
}

const resetSearch = () => {
  searchForm.status = ''
  searchForm.date = ''
  loadReservations()
}

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      member_id: row.member_id,
      customer_name: row.customer_name || row.member_name || '',
      customer_phone: row.customer_phone || '',
      bay_id: row.bay_id,
      reservation_date: row.reservation_date,
      start_time: row.start_time,
      end_time: row.end_time,
      coach_id: row.coach_id,
      balls_count: Number(row.balls_count),
      status: row.status,
      payment_method: row.payment_method || '',
      total_amount: Number(row.total_amount),
      paid_amount: Number(row.paid_amount),
      remark: row.remark || ''
    })
  } else {
    isEdit.value = false
    Object.assign(form, {
      id: null,
      member_id: null,
      customer_name: '',
      customer_phone: '',
      bay_id: availableBays.value[0]?.id || null,
      reservation_date: today,
      start_time: '09:00:00',
      end_time: '10:00:00',
      coach_id: null,
      balls_count: 50,
      status: 'pending',
      payment_method: '',
      total_amount: 50,
      paid_amount: 0,
      remark: ''
    })
  }
  dialogVisible.value = true
}

const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate().catch(err => {
      console.error('表单验证失败:', err)
      return false
    })
    
    if (!valid) {
      ElMessage.warning('请填写必填项')
      return
    }
    
    submitting.value = true
    
    if (isEdit.value) {
      await request.put(`/reservations/${form.id}`, form)
      ElMessage.success('编辑成功')
    } else {
      await request.post('/reservations', form)
      ElMessage.success('预约成功')
    }
    
    dialogVisible.value = false
    await loadReservations()
  } catch (error) {
    console.error('提交失败:', error)
    if (error.response) {
      ElMessage.error('提交失败: ' + (error.response.data?.message || error.response.data?.error || '服务器错误'))
    } else if (error.request) {
      ElMessage.error('提交失败: 网络错误，请检查后端服务是否运行')
    } else {
      ElMessage.error('提交失败: ' + (error.message || '未知错误'))
    }
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (newStatus, row) => {
  try {
    await ElMessageBox.confirm(`确定将状态改为"${getStatusText(newStatus)}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.put(`/reservations/${row.id}/status`, { status: newStatus })
    ElMessage.success('状态更新成功')
    loadReservations()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('状态更新失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该预约吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/reservations/${row.id}`)
    ElMessage.success('删除成功')
    loadReservations()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadReservations()
  loadBays()
  loadCoaches()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 16px;
}

.price {
  color: #f56c6c;
  font-weight: 500;
}

.text-sm {
  font-size: 12px;
  color: #909399;
}
</style>
