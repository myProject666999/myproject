<template>
  <div class="admin-page">
    <el-card shadow="never">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="培训班管理" name="training">
          <div class="tab-toolbar">
            <el-button type="primary" :icon="Plus" @click="openTrainingDialog(null)">
              新增培训班
            </el-button>
          </div>
          <el-table :data="trainings" v-loading="trainingLoading" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="培训班名称" min-width="180" />
            <el-table-column prop="instructor" label="讲师" width="120" />
            <el-table-column prop="startDate" label="开始日期" width="120" />
            <el-table-column prop="endDate" label="结束日期" width="120" />
            <el-table-column prop="totalHours" label="学时(h)" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="trainingStatusTag(row.status)" size="small">
                  {{ trainingStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openTrainingDialog(row)">
                  编辑
                </el-button>
                <el-button link type="primary" @click="generateQrcode(row)">
                  二维码
                </el-button>
                <el-button link type="danger" @click="deleteTraining(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="学员管理" name="student">
          <div class="tab-toolbar">
            <el-button type="primary" :icon="Plus" @click="openStudentDialog(null)">
              新增学员
            </el-button>
          </div>
          <el-table :data="students" v-loading="studentLoading" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="idCard" label="身份证号" width="200" />
            <el-table-column prop="phone" label="手机号" width="140" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column label="性别" width="80">
              <template #default="{ row }">
                {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '—' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openStudentDialog(row)">
                  编辑
                </el-button>
                <el-button link type="danger" @click="deleteStudent(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="签到统计" name="statistics">
          <el-form :inline="true" :model="statsForm" @submit.prevent>
            <el-form-item label="选择培训班">
              <el-select
                v-model="statsForm.trainingId"
                placeholder="请选择培训班"
                filterable
                style="width: 280px"
                @change="loadStatistics"
              >
                <el-option
                  v-for="t in trainings"
                  :key="t.id"
                  :label="t.name"
                  :value="t.id"
                />
              </el-select>
            </el-form-item>
          </el-form>

          <el-row v-if="statistics" :gutter="16" class="stats-summary">
            <el-col :span="6">
              <el-card shadow="hover">
                <el-statistic title="应到人数" :value="statistics.total || 0" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <el-statistic title="实到人数" :value="statistics.checked || 0" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <el-statistic title="出勤率" :value="statistics.rate || 0" suffix="%" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <el-statistic title="签到次数" :value="statistics.times || 0" />
              </el-card>
            </el-col>
          </el-row>

          <el-table
            v-if="attendanceList.length"
            :data="attendanceList"
            v-loading="attendanceLoading"
            stripe
            style="margin-top: 16px"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="studentName" label="学员" width="140" />
            <el-table-column prop="studentId" label="学员ID" width="100" />
            <el-table-column prop="checkinTime" label="签到时间" width="180" />
            <el-table-column prop="type" label="方式" width="100">
              <template #default="{ row }">
                <el-tag size="small">
                  {{ row.type === 1 ? '扫码' : '手动' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ipAddress" label="IP 地址" width="160" />
          </el-table>

          <el-empty
            v-if="!statsForm.trainingId && !attendanceList.length"
            description="请选择培训班查看签到记录"
            :image-size="120"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="trainingDialogVisible"
      :title="trainingForm.id ? '编辑培训班' : '新增培训班'"
      width="560px"
    >
      <el-form
        ref="trainingFormRef"
        :model="trainingForm"
        :rules="trainingRules"
        label-width="100px"
      >
        <el-form-item label="培训班名称" prop="name">
          <el-input v-model="trainingForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="trainingForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="讲师" prop="instructor">
          <el-input v-model="trainingForm.instructor" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="trainingForm.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="trainingForm.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总学时" prop="totalHours">
          <el-input-number v-model="trainingForm.totalHours" :min="0" :step="0.5" />
        </el-form-item>
        <el-form-item label="最低出勤率(%)">
          <el-input-number v-model="trainingForm.minAttendanceRate" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="trainingForm.status" style="width: 100%">
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="trainingDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="trainingSubmitting" @click="submitTraining">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="studentDialogVisible"
      :title="studentForm.id ? '编辑学员' : '新增学员'"
      width="520px"
    >
      <el-form
        ref="studentFormRef"
        :model="studentForm"
        :rules="studentRules"
        label-width="90px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="studentForm.idCard" maxlength="18" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="studentForm.phone" maxlength="20" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="studentForm.email" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="studentForm.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="studentSubmitting" @click="submitStudent">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getTrainingList,
  createTraining,
  updateTraining,
  deleteTraining as apiDeleteTraining,
  generateTrainingQrcode
} from '@/api/training'
import {
  getStudentList,
  createStudent,
  updateStudent,
  deleteStudent as apiDeleteStudent
} from '@/api/student'
import { getAttendanceByTraining, getAttendanceStatistics } from '@/api/attendance'

const activeTab = ref('training')

const trainings = ref([])
const trainingLoading = ref(false)
const students = ref([])
const studentLoading = ref(false)
const attendanceList = ref([])
const attendanceLoading = ref(false)
const statistics = ref(null)

const statsForm = reactive({
  trainingId: null
})

const loadTrainings = async () => {
  trainingLoading.value = true
  try {
    const res = await getTrainingList()
    trainings.value = res.data || []
  } catch (e) {
    trainings.value = []
  } finally {
    trainingLoading.value = false
  }
}

const loadStudents = async () => {
  studentLoading.value = true
  try {
    const res = await getStudentList()
    students.value = res.data || []
  } catch (e) {
    students.value = []
  } finally {
    studentLoading.value = false
  }
}

const loadStatistics = async () => {
  if (!statsForm.trainingId) {
    statistics.value = null
    attendanceList.value = []
    return
  }
  attendanceLoading.value = true
  try {
    const [stats, list] = await Promise.all([
      getAttendanceStatistics(statsForm.trainingId).catch(() => null),
      getAttendanceByTraining(statsForm.trainingId).catch(() => null)
    ])
    statistics.value = stats?.data || null
    attendanceList.value = list?.data || []
  } finally {
    attendanceLoading.value = false
  }
}

const trainingStatusText = (s) =>
  s === 0 ? '未开始' : s === 1 ? '进行中' : s === 2 ? '已结束' : '未知'
const trainingStatusTag = (s) =>
  s === 0 ? 'info' : s === 1 ? 'success' : s === 2 ? 'warning' : ''

const trainingDialogVisible = ref(false)
const trainingFormRef = ref(null)
const trainingSubmitting = ref(false)
const trainingForm = reactive({
  id: null,
  name: '',
  description: '',
  instructor: '',
  startDate: '',
  endDate: '',
  totalHours: 0,
  minAttendanceRate: 80,
  status: 0
})
const trainingRules = {
  name: [{ required: true, message: '请输入培训班名称', trigger: 'blur' }],
  instructor: [{ required: true, message: '请输入讲师', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

const openTrainingDialog = (row) => {
  Object.assign(trainingForm, {
    id: null,
    name: '',
    description: '',
    instructor: '',
    startDate: '',
    endDate: '',
    totalHours: 0,
    minAttendanceRate: 80,
    status: 0
  })
  if (row) {
    Object.assign(trainingForm, row)
  }
  trainingDialogVisible.value = true
}

const submitTraining = () => {
  trainingFormRef.value.validate(async (valid) => {
    if (!valid) return
    trainingSubmitting.value = true
    try {
      if (trainingForm.id) {
        await updateTraining(trainingForm)
        ElMessage.success('更新成功')
      } else {
        await createTraining(trainingForm)
        ElMessage.success('创建成功')
      }
      trainingDialogVisible.value = false
      loadTrainings()
    } catch (e) {
      ElMessage.error('操作失败')
    } finally {
      trainingSubmitting.value = false
    }
  })
}

const deleteTraining = (row) => {
  ElMessageBox.confirm(`确认删除培训班【${row.name}】？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeleteTraining(row.id)
      ElMessage.success('删除成功')
      loadTrainings()
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const generateQrcode = async (row) => {
  try {
    await generateTrainingQrcode(row.id)
    ElMessage.success('二维码已生成')
    loadTrainings()
  } catch (e) {
    ElMessage.error('二维码生成失败')
  }
}

const studentDialogVisible = ref(false)
const studentFormRef = ref(null)
const studentSubmitting = ref(false)
const studentForm = reactive({
  id: null,
  name: '',
  idCard: '',
  phone: '',
  email: '',
  gender: null
})
const studentRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const openStudentDialog = (row) => {
  Object.assign(studentForm, {
    id: null,
    name: '',
    idCard: '',
    phone: '',
    email: '',
    gender: null
  })
  if (row) {
    Object.assign(studentForm, row)
  }
  studentDialogVisible.value = true
}

const submitStudent = () => {
  studentFormRef.value.validate(async (valid) => {
    if (!valid) return
    studentSubmitting.value = true
    try {
      if (studentForm.id) {
        await updateStudent(studentForm)
        ElMessage.success('更新成功')
      } else {
        await createStudent(studentForm)
        ElMessage.success('创建成功')
      }
      studentDialogVisible.value = false
      loadStudents()
    } catch (e) {
      ElMessage.error('操作失败')
    } finally {
      studentSubmitting.value = false
    }
  })
}

const deleteStudent = (row) => {
  ElMessageBox.confirm(`确认删除学员【${row.name}】？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeleteStudent(row.id)
      ElMessage.success('删除成功')
      loadStudents()
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadTrainings()
  loadStudents()
})
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tab-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.stats-summary {
  margin-top: 16px;
}
</style>
