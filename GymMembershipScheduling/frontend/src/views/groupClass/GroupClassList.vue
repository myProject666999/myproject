<template>
  <div>
    <div class="page-header">
      <div class="page-title">团体课管理</div>
      <el-button type="primary" @click="handleAddSchedule">
        <el-icon><Plus /></el-icon>
        新增排课
      </el-button>
    </div>

    <div class="search-form">
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px;"
      ></el-date-picker>
      <el-select v-model="searchForm.courseTypeId" placeholder="课程类型" style="width: 150px;" clearable>
        <el-option 
          v-for="type in courseTypes" 
          :key="type.id" 
          :label="type.typeName" 
          :value="type.id"
        ></el-option>
      </el-select>
      <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px;" clearable>
        <el-option label="可预约" :value="1"></el-option>
        <el-option label="已取消" :value="2"></el-option>
      </el-select>
      <el-button type="primary" @click="loadData">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="courseTypeName" label="课程名称"></el-table-column>
        <el-table-column prop="coachName" label="教练"></el-table-column>
        <el-table-column prop="classDate" label="日期" width="120"></el-table-column>
        <el-table-column label="时间" width="150">
          <template #default="{ row }">
            {{ row.startTime }} - {{ row.endTime }}
          </template>
        </el-table-column>
        <el-table-column prop="classroom" label="教室"></el-table-column>
        <el-table-column label="人数" width="100">
          <template #default="{ row }">
            {{ row.currentParticipants }}/{{ row.maxParticipants }}
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleBook(row)" v-if="isAdminOrReception">预约</el-button>
            <el-button type="danger" size="small" link @click="handleCancel(row)" v-if="row.status === 1 && isAdminOrReception">取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <el-dialog v-model="scheduleDialogVisible" :title="scheduleDialogTitle" width="500px">
      <el-form :model="scheduleForm" :rules="scheduleRules" ref="scheduleFormRef" label-width="80px" class="form-dialog">
        <el-form-item label="课程类型" prop="courseTypeId">
          <el-select v-model="scheduleForm.courseTypeId" placeholder="请选择课程类型" style="width: 100%;">
            <el-option 
              v-for="type in courseTypes" 
              :key="type.id" 
              :label="type.typeName" 
              :value="type.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教练" prop="coachId">
          <el-select v-model="scheduleForm.coachId" placeholder="请选择教练" style="width: 100%;" filterable>
            <el-option 
              v-for="coach in coaches" 
              :key="coach.id" 
              :label="coach.realName" 
              :value="coach.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上课日期" prop="classDate">
          <el-date-picker v-model="scheduleForm.classDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker v-model="scheduleForm.startTime" placeholder="选择时间" value-format="HH:mm" style="width: 100%;"></el-time-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker v-model="scheduleForm.endTime" placeholder="选择时间" value-format="HH:mm" style="width: 100%;"></el-time-picker>
        </el-form-item>
        <el-form-item label="教室" prop="classroom">
          <el-input v-model="scheduleForm.classroom"></el-input>
        </el-form-item>
        <el-form-item label="最大人数" prop="maxParticipants">
          <el-input-number v-model="scheduleForm.maxParticipants" :min="1" style="width: 100%;"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleScheduleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="bookDialogVisible" title="预约课程" width="400px">
      <el-form :model="bookForm" :rules="bookRules" ref="bookFormRef" label-width="80px" class="form-dialog">
        <el-form-item label="会员" prop="userId">
          <el-select v-model="bookForm.userId" placeholder="请选择会员" style="width: 100%;" filterable>
            <el-option 
              v-for="member in members" 
              :key="member.id" 
              :label="`${member.realName} (${member.phone})`" 
              :value="member.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bookDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleBookSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCourseTypes, createSchedule, getSchedulePage, cancelSchedule, bookClass } from '@/api/groupClass'
import { getCoaches, getMembers } from '@/api/user'

const loading = ref(false)
const submitLoading = ref(false)
const scheduleDialogVisible = ref(false)
const bookDialogVisible = ref(false)
const scheduleFormRef = ref()
const bookFormRef = ref()

const userInfo = computed(() => JSON.parse(localStorage.getItem('userInfo') || '{}'))
const isAdminOrReception = computed(() => ['ADMIN', 'RECEPTION'].includes(userInfo.value.role))

const searchForm = reactive({
  dateRange: [],
  courseTypeId: null,
  status: null
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const courseTypes = ref([])
const coaches = ref([])
const members = ref([])

const scheduleForm = reactive({
  courseTypeId: null,
  coachId: null,
  classDate: null,
  startTime: null,
  endTime: null,
  classroom: '',
  maxParticipants: 20
})

const bookForm = reactive({
  scheduleId: null,
  userId: null
})

const scheduleRules = {
  courseTypeId: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  coachId: [{ required: true, message: '请选择教练', trigger: 'change' }],
  classDate: [{ required: true, message: '请选择上课日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  maxParticipants: [{ required: true, message: '请输入最大人数', trigger: 'blur' }]
}

const bookRules = {
  userId: [{ required: true, message: '请选择会员', trigger: 'change' }]
}

const scheduleDialogTitle = '新增排课'

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      courseTypeId: searchForm.courseTypeId,
      status: searchForm.status
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    const res = await getSchedulePage(params)
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadCourseTypes = async () => {
  try {
    const res = await getCourseTypes()
    courseTypes.value = res.data || []
  } catch (error) {
    console.error(error)
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

const resetSearch = () => {
  searchForm.dateRange = []
  searchForm.courseTypeId = null
  searchForm.status = null
  loadData()
}

const handleAddSchedule = () => {
  Object.assign(scheduleForm, {
    courseTypeId: null,
    coachId: null,
    classDate: null,
    startTime: null,
    endTime: null,
    classroom: '',
    maxParticipants: 20
  })
  scheduleDialogVisible.value = true
}

const handleScheduleSubmit = async () => {
  try {
    await scheduleFormRef.value.validate()
    submitLoading.value = true
    await createSchedule(scheduleForm)
    ElMessage.success('排课成功')
    scheduleDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定要取消该排课吗？已预约的会员将被取消预约', '提示', {
    type: 'warning'
  }).then(async () => {
    await cancelSchedule(row.id)
    ElMessage.success('取消成功')
    loadData()
  }).catch(() => {})
}

const handleBook = (row) => {
  bookForm.scheduleId = row.id
  bookForm.userId = null
  bookDialogVisible.value = true
}

const handleBookSubmit = async () => {
  try {
    await bookFormRef.value.validate()
    submitLoading.value = true
    await bookClass(bookForm.scheduleId, bookForm.userId)
    ElMessage.success('预约成功')
    bookDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadData()
  loadCourseTypes()
  loadCoaches()
  loadMembers()
})
</script>
