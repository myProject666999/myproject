<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px">
      <h2>预约管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增预约
      </el-button>
    </div>

    <el-form :inline="true" style="margin-bottom: 20px">
      <el-form-item label="预约类型">
        <el-select v-model="filterType" placeholder="全部类型" clearable style="width: 150px" @change="loadAppointments">
          <el-option label="到店服务" value="in_store" />
          <el-option label="上门服务" value="home_service" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 150px" @change="loadAppointments">
          <el-option label="待确认" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="服务中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="loadAppointments"
        />
      </el-form-item>
    </el-form>

    <el-table :data="appointments" border stripe>
      <el-table-column prop="pet.name" label="宠物" width="100" />
      <el-table-column prop="service.name" label="服务项目" width="120" />
      <el-table-column label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === 'in_store' ? 'primary' : 'success'">
            {{ scope.row.type === 'in_store' ? '到店' : '上门' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="appointmentTime" label="预约时间" width="170">
        <template #default="scope">
          {{ formatDate(scope.row.appointmentTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="vehicle.plateNumber" label="车辆" width="100" />
      <el-table-column prop="address" label="地址" show-overflow-tooltip />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-dropdown trigger="click" @command="handleStatusChange">
            <el-button type="success" link>
              更改状态
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ id: scope.row.id, status: 'confirmed' }">确认</el-dropdown-item>
                <el-dropdown-item :command="{ id: scope.row.id, status: 'in_progress' }">开始服务</el-dropdown-item>
                <el-dropdown-item :command="{ id: scope.row.id, status: 'completed' }">完成</el-dropdown-item>
                <el-dropdown-item :command="{ id: scope.row.id, status: 'cancelled' }">取消</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="warning" link @click="handlePhotos(scope.row)">照片</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑预约' : '新增预约'"
      width="700px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="宠物" prop="petId">
              <el-select v-model="form.petId" placeholder="请选择宠物" style="width: 100%" filterable>
                <el-option
                  v-for="pet in pets"
                  :key="pet.id"
                  :label="pet.name + ' (' + pet.breed + ')'"
                  :value="pet.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务项目" prop="serviceId">
              <el-select v-model="form.serviceId" placeholder="请选择服务" style="width: 100%">
                <el-option
                  v-for="service in services"
                  :key="service.id"
                  :label="service.name + ' - ¥' + service.price"
                  :value="service.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预约时间" prop="appointmentTime">
              <el-date-picker
                v-model="form.appointmentTime"
                type="datetime"
                placeholder="选择预约时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="到店服务" value="in_store" />
                <el-option label="上门服务" value="home_service" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="form.type === 'home_service'" label="上门地址">
          <el-input v-model="form.address" placeholder="请输入上门地址" />
        </el-form-item>
        <el-form-item v-if="form.type === 'home_service'" label="分配车辆">
          <el-select v-model="form.vehicleId" placeholder="请选择车辆" style="width: 100%" clearable>
            <el-option
              v-for="vehicle in availableVehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber + ' - ' + (vehicle.driverName || '未分配司机')"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="photoDialogVisible" title="服务照片对比" width="900px">
      <el-row :gutter="20">
        <el-col :span="12">
          <h3 style="margin-bottom: 10px">服务前照片</h3>
          <el-upload
            :action="uploadAction"
            :data="{ appointmentId: currentAppointmentId, type: 'before' }"
            :on-success="handlePhotoUploadSuccess"
            list-type="picture-card"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <el-image
            v-for="photo in beforePhotos"
            :key="photo.id"
            :src="photo.filePath"
            style="width: 100px; height: 100px; margin: 5px"
            :preview-src-list="[photo.filePath]"
          />
        </el-col>
        <el-col :span="12">
          <h3 style="margin-bottom: 10px">服务后照片</h3>
          <el-upload
            :action="uploadAction"
            :data="{ appointmentId: currentAppointmentId, type: 'after' }"
            :on-success="handlePhotoUploadSuccess"
            list-type="picture-card"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <el-image
            v-for="photo in afterPhotos"
            :key="photo.id"
            :src="photo.filePath"
            style="width: 100px; height: 100px; margin: 5px"
            :preview-src-list="[photo.filePath]"
          />
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAppointments, createAppointment, updateAppointment } from '@/api/appointment'
import { getPets } from '@/api/pet'
import { getServices } from '@/api/service'
import { getVehicles } from '@/api/vehicle'
import { getPhotos, uploadPhoto } from '@/api/photo'
import dayjs from 'dayjs'

const appointments = ref([])
const pets = ref([])
const services = ref([])
const vehicles = ref([])
const filterType = ref('')
const filterStatus = ref('')
const dateRange = ref([])
const dialogVisible = ref(false)
const photoDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentAppointmentId = ref('')
const beforePhotos = ref([])
const afterPhotos = ref([])

const uploadAction = '/api/photos/upload'

const form = reactive({
  id: '',
  petId: '',
  serviceId: '',
  appointmentTime: '',
  type: 'in_store',
  address: '',
  vehicleId: '',
  notes: ''
})

const rules = {
  petId: [{ required: true, message: '请选择宠物', trigger: 'change' }],
  serviceId: [{ required: true, message: '请选择服务', trigger: 'change' }],
  appointmentTime: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const availableVehicles = computed(() => {
  return vehicles.value.filter(v => v.status === 'idle')
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待确认',
    confirmed: '已确认',
    in_progress: '服务中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'primary',
    in_progress: 'success',
    completed: 'info',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const resetForm = () => {
  Object.assign(form, {
    id: '',
    petId: '',
    serviceId: '',
    appointmentTime: '',
    type: 'in_store',
    address: '',
    vehicleId: '',
    notes: ''
  })
}

const loadAppointments = async () => {
  const params = {}
  if (filterType.value) params.type = filterType.value
  if (filterStatus.value) params.status = filterStatus.value
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }
  const data = await getAppointments(params)
  appointments.value = data
}

const loadPets = async () => {
  pets.value = await getPets()
}

const loadServices = async () => {
  services.value = await getServices()
}

const loadVehicles = async () => {
  vehicles.value = await getVehicles()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    petId: row.petId,
    serviceId: row.serviceId,
    appointmentTime: row.appointmentTime,
    type: row.type,
    address: row.address,
    vehicleId: row.vehicleId,
    notes: row.notes
  })
  dialogVisible.value = true
}

const handleStatusChange = async ({ id, status }) => {
  await updateAppointment(id, { status })
  ElMessage.success('状态已更新')
  loadAppointments()
}

const handlePhotos = async (row) => {
  currentAppointmentId.value = row.id
  const photos = await getPhotos(row.id)
  beforePhotos.value = photos.filter(p => p.type === 'before')
  afterPhotos.value = photos.filter(p => p.type === 'after')
  photoDialogVisible.value = true
}

const handlePhotoUploadSuccess = () => {
  ElMessage.success('上传成功')
  handlePhotos({ id: currentAppointmentId.value })
}

const submitForm = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateAppointment(form.id, form)
    ElMessage.success('更新成功')
  } else {
    await createAppointment(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadAppointments()
}

onMounted(() => {
  loadAppointments()
  loadPets()
  loadServices()
  loadVehicles()
})
</script>
