<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-select v-model="filter.type" placeholder="交付类型" clearable style="width: 150px" @change="fetchList">
        <el-option label="云相册" value="cloud" />
        <el-option label="U盘" value="usb" />
        <el-option label="两者" value="both" />
      </el-select>
      <el-select v-model="filter.status" placeholder="交付状态" clearable style="width: 150px" @change="fetchList">
        <el-option label="待交付" value="pending" />
        <el-option label="配送中" value="delivering" />
        <el-option label="已送达" value="delivered" />
        <el-option label="已签收" value="received" />
      </el-select>
      <el-button type="primary" @click="fetchList">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="success" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增交付
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column label="订单信息" width="200">
          <template #default="{ row }">
            <div>{{ row.appointment?.orderNo }}</div>
            <div style="color: #909399; font-size: 12px;">{{ row.appointment?.customer?.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="交付类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="云相册" width="200">
          <template #default="{ row }">
            <div v-if="row.cloudAlbumUrl">
              <el-link type="primary" :href="row.cloudAlbumUrl" target="_blank">查看</el-link>
              <span v-if="row.cloudAlbumPassword" style="margin-left: 10px; color: #909399;">
                密码: {{ row.cloudAlbumPassword }}
              </span>
            </div>
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="U盘信息" width="200">
          <template #default="{ row }">
            <div v-if="row.usbSerial">
              <div>序列号: {{ row.usbSerial }}</div>
              <div style="color: #909399; font-size: 12px;">容量: {{ row.usbCapacity }}</div>
            </div>
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="photoCount" label="照片数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
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
        <el-form-item label="交付类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="云相册" value="cloud" />
            <el-option label="U盘" value="usb" />
            <el-option label="两者" value="both" />
          </el-select>
        </el-form-item>
        <el-form-item label="照片数量" prop="photoCount">
          <el-input-number v-model="form.photoCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-divider v-if="form.type === 'cloud' || form.type === 'both'">云相册信息</el-divider>
        <el-form-item label="相册链接" prop="cloudAlbumUrl" v-if="form.type === 'cloud' || form.type === 'both'">
          <el-input v-model="form.cloudAlbumUrl" placeholder="请输入云相册链接" />
        </el-form-item>
        <el-form-item label="相册密码" prop="cloudAlbumPassword" v-if="form.type === 'cloud' || form.type === 'both'">
          <el-input v-model="form.cloudAlbumPassword" placeholder="请输入云相册密码" />
        </el-form-item>
        <el-divider v-if="form.type === 'usb' || form.type === 'both'">U盘信息</el-divider>
        <el-form-item label="U盘序列号" prop="usbSerial" v-if="form.type === 'usb' || form.type === 'both'">
          <el-input v-model="form.usbSerial" placeholder="请输入U盘序列号" />
        </el-form-item>
        <el-form-item label="U盘容量" prop="usbCapacity" v-if="form.type === 'usb' || form.type === 'both'">
          <el-input v-model="form.usbCapacity" placeholder="如 64GB" />
        </el-form-item>
        <el-form-item label="收件人" prop="receiverName">
          <el-input v-model="form.receiverName" placeholder="请输入收件人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="receiverPhone">
          <el-input v-model="form.receiverPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="收货地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入收货地址" />
        </el-form-item>
        <el-form-item label="快递公司" prop="logistics">
          <el-input v-model="form.logistics" placeholder="如 顺丰、京东" />
        </el-form-item>
        <el-form-item label="快递单号" prop="trackingNo">
          <el-input v-model="form.trackingNo" placeholder="请输入快递单号" />
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

    <el-dialog v-model="statusDialogVisible" title="更新交付状态" width="400px">
      <el-form label-width="80px">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusTag(currentDelivery?.status)">
            {{ getStatusText(currentDelivery?.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="更新为">
          <el-select v-model="selectedStatus" style="width: 100%">
            <el-option label="待交付" value="pending" />
            <el-option label="配送中" value="delivering" />
            <el-option label="已送达" value="delivered" />
            <el-option label="已签收" value="received" />
          </el-select>
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
import {
  getDeliveries,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  updateDeliveryStatus,
  getAppointments
} from '@/api'

const loading = ref(false)
const submitLoading = ref(false)
const statusLoading = ref(false)
const dialogVisible = ref(false)
const statusDialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

const filter = reactive({
  type: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])
const appointments = ref([])
const currentDelivery = ref(null)
const selectedStatus = ref('')

const form = reactive({
  id: null,
  appointmentId: null,
  type: 'cloud',
  photoCount: 0,
  cloudAlbumUrl: '',
  cloudAlbumPassword: '',
  usbSerial: '',
  usbCapacity: '',
  receiverName: '',
  receiverPhone: '',
  address: '',
  logistics: '',
  trackingNo: '',
  remark: ''
})

const rules = {
  appointmentId: [{ required: true, message: '请选择订单', trigger: 'change' }],
  type: [{ required: true, message: '请选择交付类型', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑交付' : '新增交付')

const getTypeText = (type) => {
  const map = { cloud: '云相册', usb: 'U盘', both: '两者' }
  return map[type] || type
}

const getTypeTag = (type) => {
  const map = { cloud: 'primary', usb: 'success', both: 'warning' }
  return map[type] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '待交付', delivering: '配送中', delivered: '已送达', received: '已签收' }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = { pending: 'warning', delivering: 'primary', delivered: 'success', received: 'info' }
  return map[status] || 'info'
}

const fetchList = async () => {
  loading.value = true
  try {
    const data = await getDeliveries({
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

const resetForm = () => {
  Object.assign(form, {
    id: null,
    appointmentId: null,
    type: 'cloud',
    photoCount: 0,
    cloudAlbumUrl: '',
    cloudAlbumPassword: '',
    usbSerial: '',
    usbCapacity: '',
    receiverName: '',
    receiverPhone: '',
    address: '',
    logistics: '',
    trackingNo: '',
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
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleUpdateStatus = (row) => {
  currentDelivery.value = row
  selectedStatus.value = row.status
  statusDialogVisible.value = true
}

const handleStatusSubmit = async () => {
  try {
    statusLoading.value = true
    await updateDeliveryStatus(currentDelivery.value.id, selectedStatus.value)
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
  ElMessageBox.confirm('确定要删除该交付记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDelivery(row.id)
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
    if (isEdit.value) {
      await updateDelivery(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createDelivery(form)
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
})
</script>
