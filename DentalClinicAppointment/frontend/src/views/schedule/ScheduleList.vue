<template>
  <div class="schedule-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>医生排班</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增排班
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="医生">
          <el-select v-model="searchForm.doctorId" placeholder="全部医生" clearable style="width: 150px">
            <el-option v-for="doctor in doctors" :key="doctor.id" :label="doctor.name" :value="doctor.id" />
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
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="scheduleDate" label="排班日期" width="120" />
        <el-table-column prop="doctorId" label="医生ID" width="80" />
        <el-table-column label="时间段" width="150">
          <template #default="scope">
            {{ scope.row.startTime }} - {{ scope.row.endTime }}
          </template>
        </el-table-column>
        <el-table-column label="号源情况" width="120">
          <template #default="scope">
            <el-progress
              :percentage="Math.round(scope.row.bookedSlots / scope.row.totalSlots * 100)"
              :status="scope.row.bookedSlots >= scope.row.totalSlots ? 'exception' : ''"
            >
              <template #default>
                {{ scope.row.bookedSlots }}/{{ scope.row.totalSlots }}
              </template>
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="医生" prop="doctorId">
          <el-select v-model="form.doctorId" placeholder="请选择医生" style="width: 100%">
            <el-option v-for="doctor in doctors" :key="doctor.id" :label="doctor.name" :value="doctor.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排班日期" prop="scheduleDate">
          <el-date-picker
            v-model="form.scheduleDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker
            v-model="form.startTime"
            placeholder="选择开始时间"
            style="width: 100%"
            value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
            v-model="form.endTime"
            placeholder="选择结束时间"
            style="width: 100%"
            value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="总号源数" prop="totalSlots">
          <el-input-number v-model="form.totalSlots" :min="1" :max="50" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入排班描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getDoctors } from '../../api'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增排班')
const isEdit = ref(false)
const formRef = ref()

const searchForm = reactive({
  doctorId: null
})

const dateRange = ref([])

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const doctors = ref([])

const form = reactive({
  id: null,
  doctorId: null,
  clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1,
  scheduleDate: '',
  startTime: '',
  endTime: '',
  totalSlots: 10,
  description: '',
  status: 1
})

const rules = {
  doctorId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  scheduleDate: [{ required: true, message: '请选择排班日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  totalSlots: [{ required: true, message: '请输入总号源数', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      doctorId: searchForm.doctorId,
      clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getSchedules(params)
    tableData.value = res.data.records
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const loadDoctors = async () => {
  try {
    const res = await getDoctors(userStore.clinicId ? parseInt(userStore.clinicId) : 1)
    doctors.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const resetSearch = () => {
  searchForm.doctorId = null
  dateRange.value = []
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增排班'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑排班'
  isEdit.value = true
  Object.assign(form, row)
  form.scheduleDate = row.scheduleDate
  form.startTime = row.startTime
  form.endTime = row.endTime
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该排班吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await deleteSchedule(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    doctorId: null,
    clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1,
    scheduleDate: '',
    startTime: '',
    endTime: '',
    totalSlots: 10,
    description: '',
    status: 1
  })
}

const handleSubmit = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateSchedule(form)
    ElMessage.success('更新成功')
  } else {
    await createSchedule(form)
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  loadData()
}

onMounted(() => {
  loadData()
  loadDoctors()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
