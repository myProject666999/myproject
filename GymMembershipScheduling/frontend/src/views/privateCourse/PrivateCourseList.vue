<template>
  <div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="私教课程" name="courses">
        <div class="page-header">
          <div class="page-title">私教课程</div>
          <el-button type="primary" @click="handleAddCourse">
            <el-icon><Plus /></el-icon>
            新增课程
          </el-button>
        </div>

        <div class="search-form">
          <el-select v-model="courseSearchForm.status" placeholder="状态" style="width: 120px;" clearable>
            <el-option label="进行中" :value="1"></el-option>
            <el-option label="已完成" :value="2"></el-option>
          </el-select>
          <el-button type="primary" @click="loadCourses">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>

        <div class="table-container">
          <el-table :data="courseData" style="width: 100%" v-loading="courseLoading">
            <el-table-column label="会员">
              <template #default="{ row }">
                {{ getUserName(row.userId) }}
              </template>
            </el-table-column>
            <el-table-column label="教练">
              <template #default="{ row }">
                {{ getUserName(row.coachId) }}
              </template>
            </el-table-column>
            <el-table-column label="总课时" prop="totalHours"></el-table-column>
            <el-table-column label="剩余课时" prop="remainingHours">
              <template #default="{ row }">
                <el-tag :type="row.remainingHours > 5 ? 'success' : 'warning'">
                  {{ row.remainingHours }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="价格" prop="price"></el-table-column>
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '进行中' : '已完成' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="handleAddSchedule(row)" v-if="row.status === 1">排课</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="私教排课" name="schedules">
        <div class="page-header">
          <div class="page-title">私教排课</div>
        </div>

        <div class="search-form">
          <el-date-picker
            v-model="scheduleSearchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px;"
          ></el-date-picker>
          <el-select v-model="scheduleSearchForm.status" placeholder="状态" style="width: 120px;" clearable>
            <el-option label="待上课" :value="1"></el-option>
            <el-option label="已完成" :value="2"></el-option>
            <el-option label="已取消" :value="3"></el-option>
          </el-select>
          <el-button type="primary" @click="loadSchedules">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>

        <div class="table-container">
          <el-table :data="scheduleData" style="width: 100%" v-loading="scheduleLoading">
            <el-table-column prop="userName" label="会员"></el-table-column>
            <el-table-column prop="coachName" label="教练"></el-table-column>
            <el-table-column prop="scheduleDate" label="日期" width="120"></el-table-column>
            <el-table-column label="时间" width="150">
              <template #default="{ row }">
                {{ row.startTime }} - {{ row.endTime }}
              </template>
            </el-table-column>
            <el-table-column label="消耗课时" prop="consumeHours"></el-table-column>
            <el-table-column prop="statusName" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ row.statusName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="success" size="small" link @click="handleCheckIn(row)" v-if="row.status === 1">签到核销</el-button>
                <el-button type="danger" size="small" link @click="handleCancelSchedule(row)" v-if="row.status === 1">取消</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="schedulePagination.current"
            v-model:page-size="schedulePagination.size"
            :total="schedulePagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadSchedules"
            @current-change="loadSchedules"
            style="margin-top: 20px; justify-content: flex-end;"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="courseDialogVisible" title="新增私教课程" width="500px">
      <el-form :model="courseForm" :rules="courseRules" ref="courseFormRef" label-width="80px" class="form-dialog">
        <el-form-item label="会员" prop="userId">
          <el-select v-model="courseForm.userId" placeholder="请选择会员" style="width: 100%;" filterable>
            <el-option 
              v-for="member in members" 
              :key="member.id" 
              :label="`${member.realName} (${member.phone})`" 
              :value="member.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教练" prop="coachId">
          <el-select v-model="courseForm.coachId" placeholder="请选择教练" style="width: 100%;" filterable>
            <el-option 
              v-for="coach in coaches" 
              :key="coach.id" 
              :label="coach.realName" 
              :value="coach.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="总课时" prop="totalHours">
          <el-input-number v-model="courseForm.totalHours" :min="1" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="courseForm.price" :min="0" :precision="2" style="width: 100%;"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="courseDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleCourseSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="scheduleDialogVisible" title="私教排课" width="500px">
      <el-form :model="scheduleForm" :rules="scheduleRules" ref="scheduleFormRef" label-width="80px" class="form-dialog">
        <el-form-item label="排课日期" prop="scheduleDate">
          <el-date-picker v-model="scheduleForm.scheduleDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker v-model="scheduleForm.startTime" placeholder="选择时间" value-format="HH:mm" style="width: 100%;"></el-time-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker v-model="scheduleForm.endTime" placeholder="选择时间" value-format="HH:mm" style="width: 100%;"></el-time-picker>
        </el-form-item>
        <el-form-item label="消耗课时" prop="consumeHours">
          <el-input-number v-model="scheduleForm.consumeHours" :min="0.5" :step="0.5" :precision="1" style="width: 100%;"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleScheduleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createPrivateCourse, getPrivateCoursePage, createPrivateSchedule, getPrivateSchedulePage, cancelPrivateSchedule, checkInPrivateSchedule } from '@/api/privateCourse'
import { getCoaches, getMembers } from '@/api/user'

const activeTab = ref('courses')
const courseLoading = ref(false)
const scheduleLoading = ref(false)
const submitLoading = ref(false)
const courseDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)
const courseFormRef = ref()
const scheduleFormRef = ref()

const courseSearchForm = reactive({
  status: null
})

const scheduleSearchForm = reactive({
  dateRange: [],
  status: null
})

const schedulePagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const courseData = ref([])
const scheduleData = ref([])
const coaches = ref([])
const members = ref([])

const courseForm = reactive({
  userId: null,
  coachId: null,
  totalHours: 10,
  price: 0
})

const scheduleForm = reactive({
  courseId: null,
  scheduleDate: null,
  startTime: null,
  endTime: null,
  consumeHours: 1
})

const courseRules = {
  userId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  coachId: [{ required: true, message: '请选择教练', trigger: 'change' }],
  totalHours: [{ required: true, message: '请输入总课时', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const scheduleRules = {
  scheduleDate: [{ required: true, message: '请选择排课日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  consumeHours: [{ required: true, message: '请输入消耗课时', trigger: 'blur' }]
}

const getStatusType = (status) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'info'
    default: return 'info'
  }
}

const getUserName = (id) => {
  const user = [...coaches.value, ...members.value].find(u => u.id === id)
  return user ? user.realName : ''
}

const loadCourses = async () => {
  courseLoading.value = true
  try {
    const res = await getPrivateCoursePage({
      pageNum: 1,
      pageSize: 100,
      status: courseSearchForm.status
    })
    courseData.value = res.data.records || []
  } catch (error) {
    console.error(error)
  } finally {
    courseLoading.value = false
  }
}

const loadSchedules = async () => {
  scheduleLoading.value = true
  try {
    const params = {
      pageNum: schedulePagination.current,
      pageSize: schedulePagination.size,
      status: scheduleSearchForm.status
    }
    if (scheduleSearchForm.dateRange && scheduleSearchForm.dateRange.length === 2) {
      params.startDate = scheduleSearchForm.dateRange[0]
      params.endDate = scheduleSearchForm.dateRange[1]
    }
    const res = await getPrivateSchedulePage(params)
    scheduleData.value = res.data.records || []
    schedulePagination.total = res.data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    scheduleLoading.value = false
  }
}

const loadCoaches = async () => {
  try {
    const res = await getCoaches()
    coaches.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const loadMembers = async () => {
  try {
    const res = await getMembers()
    members.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const handleAddCourse = () => {
  Object.assign(courseForm, {
    userId: null,
    coachId: null,
    totalHours: 10,
    price: 0
  })
  courseDialogVisible.value = true
}

const handleCourseSubmit = async () => {
  try {
    await courseFormRef.value.validate()
    submitLoading.value = true
    await createPrivateCourse(courseForm)
    ElMessage.success('创建成功')
    courseDialogVisible.value = false
    loadCourses()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleAddSchedule = (row) => {
  scheduleForm.courseId = row.id
  Object.assign(scheduleForm, {
    scheduleDate: null,
    startTime: null,
    endTime: null,
    consumeHours: 1
  })
  scheduleDialogVisible.value = true
}

const handleScheduleSubmit = async () => {
  try {
    await scheduleFormRef.value.validate()
    submitLoading.value = true
    await createPrivateSchedule(scheduleForm)
    ElMessage.success('排课成功')
    scheduleDialogVisible.value = false
    loadSchedules()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleCheckIn = (row) => {
  ElMessageBox.confirm('确定要签到吗？签到后将自动核销课时', '提示', {
    type: 'warning'
  }).then(async () => {
    await checkInPrivateSchedule(row.id)
    ElMessage.success('签到成功，课时已核销')
    loadSchedules()
    loadCourses()
  }).catch(() => {})
}

const handleCancelSchedule = (row) => {
  ElMessageBox.confirm('确定要取消该排课吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await cancelPrivateSchedule(row.id)
    ElMessage.success('取消成功')
    loadSchedules()
  }).catch(() => {})
}

onMounted(() => {
  loadCourses()
  loadSchedules()
  loadCoaches()
  loadMembers()
})
</script>
