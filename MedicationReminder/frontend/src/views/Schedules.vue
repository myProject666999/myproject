<template>
  <div class="schedules-page">
    <div class="page-header">
      <h2>用药表</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增用药计划
      </el-button>
    </div>

    <el-table
      :data="schedules"
      v-loading="loading"
      stripe
      style="width: 100%"
      :empty-text="'暂无用药计划'"
    >
      <el-table-column prop="userName" label="用户" width="100" />
      <el-table-column prop="medicineName" label="药品名称" min-width="140" />
      <el-table-column prop="specification" label="规格" width="120" />
      <el-table-column prop="dosage" label="剂量" width="100" />
      <el-table-column label="频率" width="120">
        <template #default="{ row }">
          <el-tag :type="getFrequencyTagType(row.frequencyType)">
            {{ row.frequencyDesc }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="timeSlots" label="用药时间" min-width="160" />
      <el-table-column label="有效期" width="200">
        <template #default="{ row }">
          {{ formatDate(row.startDate) }} ~ {{ row.endDate ? formatDate(row.endDate) : '长期' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button
            size="small"
            :type="row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '停用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDeleteSchedule(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用药计划' : '新增用药计划'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="选择用户" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择用户" style="width: 100%">
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择药品" prop="medicineId">
          <el-select v-model="form.medicineId" placeholder="请选择药品" style="width: 100%" filterable>
            <el-option
              v-for="med in medicines"
              :key="med.id"
              :label="med.name + (med.specification ? ' (' + med.specification + ')' : '')"
              :value="med.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="每次剂量" prop="dosage">
          <el-input v-model="form.dosage" placeholder="如: 1片、2粒" />
        </el-form-item>
        <el-form-item label="频率类型" prop="frequencyType">
          <el-radio-group v-model="form.frequencyType">
            <el-radio label="daily">每日</el-radio>
            <el-radio label="alternate_day">隔日</el-radio>
            <el-radio label="weekly">每周</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.frequencyType === 'weekly'" label="选择星期" prop="weekDays">
          <el-checkbox-group v-model="weekDaysArr">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="7">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="用药时间" prop="timeSlots">
          <div class="time-slots">
            <div v-for="(time, idx) in timeSlotsArr" :key="idx" class="time-slot-item">
              <el-time-picker
                v-model="timeSlotsArr[idx]"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择时间"
                style="width: 160px"
              />
              <el-button
                v-if="timeSlotsArr.length > 1"
                link
                type="danger"
                @click="removeTimeSlot(idx)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" link @click="addTimeSlot">
              <el-icon><Plus /></el-icon>
              添加时间
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择开始日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="不选则为长期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '@/api/schedule'
import { getMedicines } from '@/api/medicine'
import { getUsers } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  userId: { type: Number, default: 1 }
})

const loading = ref(false)
const schedules = ref([])
const medicines = ref([])
const users = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const defaultForm = () => ({
  id: null,
  userId: props.userId,
  medicineId: null,
  dosage: '',
  frequencyType: 'daily',
  weekDays: '',
  timeSlots: '08:00',
  startDate: new Date().toISOString().split('T')[0],
  endDate: null,
  status: 1,
  remark: ''
})

const form = reactive(defaultForm())
const weekDaysArr = ref([])
const timeSlotsArr = ref(['08:00'])

const rules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  medicineId: [{ required: true, message: '请选择药品', trigger: 'change' }],
  dosage: [{ required: true, message: '请输入剂量', trigger: 'blur' }],
  frequencyType: [{ required: true, message: '请选择频率', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }]
}

const getFrequencyTagType = (type) => {
  const map = { daily: 'success', alternate_day: 'warning', weekly: 'primary' }
  return map[type] || 'info'
}

const formatDate = (date) => {
  if (!date) return ''
  return date
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, defaultForm())
  form.userId = props.userId
  weekDaysArr.value = ['1', '3', '5']
  timeSlotsArr.value = ['08:00']
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    userId: row.userId,
    medicineId: row.medicineId,
    dosage: row.dosage,
    frequencyType: row.frequencyType,
    weekDays: row.weekDays,
    timeSlots: row.timeSlots,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    remark: row.remark
  })
  weekDaysArr.value = row.weekDays ? row.weekDays.split(',') : []
  timeSlotsArr.value = row.timeSlots ? row.timeSlots.split(',') : ['08:00']
  dialogVisible.value = true
}

const addTimeSlot = () => {
  timeSlotsArr.value.push('12:00')
}

const removeTimeSlot = (idx) => {
  timeSlotsArr.value.splice(idx, 1)
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    form.weekDays = form.frequencyType === 'weekly'
      ? weekDaysArr.value.join(',')
      : null

    form.timeSlots = timeSlotsArr.value.filter(Boolean).join(',')
    if (!form.timeSlots) {
      ElMessage.warning('请至少添加一个用药时间')
      return
    }

    try {
      if (isEdit.value) {
        await updateSchedule(form)
        ElMessage.success('更新成功')
      } else {
        await createSchedule(form)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchData(props.userId)
    } catch (e) {
      console.error(e)
    }
  })
}

const toggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 1 ? '停用' : '启用'}该用药计划吗？`,
      '提示',
      { type: 'warning' }
    )
    row.status = row.status === 1 ? 0 : 1
    await updateSchedule(row)
    ElMessage.success('操作成功')
    fetchData(props.userId)
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const handleDeleteSchedule = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该用药计划吗？', '提示', { type: 'warning' })
    await deleteSchedule(row.id)
    ElMessage.success('删除成功')
    fetchData(props.userId)
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const handleUserChange = (e) => {
  fetchData(e.detail.userId)
}

const fetchData = async (userId) => {
  loading.value = true
  try {
    const res = await getSchedules()
    schedules.value = (res.data || []).filter(s => !userId || s.userId === userId)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchBaseData = async () => {
  try {
    const [medRes, userRes] = await Promise.all([getMedicines(), getUsers()])
    medicines.value = medRes.data || []
    users.value = userRes.data || []
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchData(props.userId)
  fetchBaseData()
  window.addEventListener('user-change', handleUserChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('user-change', handleUserChange)
})
</script>

<style scoped>
.schedules-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-header h2 {
  color: #303133;
  margin: 0;
}
.time-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.time-slot-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
