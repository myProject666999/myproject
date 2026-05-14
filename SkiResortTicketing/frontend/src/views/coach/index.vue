<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>教练预约管理</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            新增教练
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8" v-for="coach in coaches" :key="coach.id">
          <el-card shadow="hover" class="coach-card">
            <div class="coach-header">
              <el-avatar :size="60">
                <el-icon :size="30"><User /></el-icon>
              </el-avatar>
              <div class="coach-info">
                <div class="coach-name">{{ coach.name }}</div>
                <div class="coach-level">
                  <el-tag :type="getLevelType(coach.level)" size="small">{{ coach.level }}</el-tag>
                </div>
              </div>
            </div>
            <div class="coach-detail">
              <p><el-icon><Phone /></el-icon> {{ coach.phone }}</p>
              <p><el-icon><Money /></el-icon> ¥{{ coach.hourlyRate }}/小时</p>
              <p class="coach-desc">{{ coach.description }}</p>
            </div>
            <div class="coach-footer">
              <el-button type="success" link @click="viewSchedule(coach)">查看排班</el-button>
              <el-button type="primary" link @click="editCoach(coach)">编辑</el-button>
              <el-button type="danger" link @click="deleteCoach(coach)">删除</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="addDialogVisible" :title="isEdit ? '编辑教练' : '新增教练'" width="500px">
      <el-form :model="coachForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="coachForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="coachForm.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="coachForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="教练等级">
          <el-select v-model="coachForm.level" placeholder="请选择等级" style="width: 100%">
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
            <el-option label="国家级" value="国家级" />
          </el-select>
        </el-form-item>
        <el-form-item label="时薪(元/小时)">
          <el-input-number v-model="coachForm.hourlyRate" :min="0" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="coachForm.description" type="textarea" :rows="3" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="coachForm.status" :active-value="1" :inactive-value="0" active-text="在岗" inactive-text="休假" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCoach">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="scheduleDialogVisible" title="教练排班" width="700px">
      <div v-if="currentCoach">
        <el-alert type="info" :closable="false" class="mb-20">
          教练: {{ currentCoach.name }} | 等级: {{ currentCoach.level }} | 时薪: ¥{{ currentCoach.hourlyRate }}/小时
        </el-alert>
        <el-date-picker
          v-model="scheduleDate"
          type="date"
          placeholder="选择日期"
          style="width: 200px; margin-bottom: 20px;"
        />
        <el-table :data="scheduleList" border>
          <el-table-column prop="timeSlot" label="时间段" width="150" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getScheduleStatusType(row.status)">
                {{ getScheduleStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="bookingNo" label="预约订单" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" link size="small" v-if="row.status === 0" @click="bookSchedule(row)">预约</el-button>
              <el-button type="success" link size="small" v-if="row.status === 1" @click="completeSchedule(row)">完成</el-button>
              <el-button type="warning" link size="small" v-if="row.status === 0" @click="disableSchedule(row)">禁用</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const addDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)
const isEdit = ref(false)
const currentCoach = ref(null)
const scheduleDate = ref(new Date())

const coaches = ref([
  { id: 1, name: '张伟', gender: 1, phone: '13900000001', level: '国家级', hourlyRate: 500, status: 1, description: '国家队退役运动员，15年滑雪教学经验' },
  { id: 2, name: '李娜', gender: 2, phone: '13900000002', level: '高级', hourlyRate: 400, status: 1, description: '全国冠军，单板自由式专家' },
  { id: 3, name: '王强', gender: 1, phone: '13900000003', level: '高级', hourlyRate: 380, status: 1, description: '10年教学经验，擅长零基础学员' },
  { id: 4, name: '刘洋', gender: 1, phone: '13900000004', level: '中级', hourlyRate: 280, status: 1, description: '认证滑雪教练，耐心细致' },
  { id: 5, name: '陈静', gender: 2, phone: '13900000005', level: '中级', hourlyRate: 280, status: 1, description: '温柔女教练，适合儿童和女性' },
  { id: 6, name: '赵鹏', gender: 1, phone: '13900000006', level: '初级', hourlyRate: 200, status: 1, description: '新晋教练，性价比首选' }
])

const coachForm = reactive({
  id: null,
  name: '',
  gender: 1,
  phone: '',
  level: '初级',
  hourlyRate: 200,
  description: '',
  status: 1
})

const scheduleList = ref([
  { id: 1, timeSlot: '08:00-10:00', status: 0, bookingNo: '' },
  { id: 2, timeSlot: '10:00-12:00', status: 1, bookingNo: 'COACH20240514001' },
  { id: 3, timeSlot: '13:00-15:00', status: 0, bookingNo: '' },
  { id: 4, timeSlot: '15:00-17:00', status: 2, bookingNo: '' },
  { id: 5, timeSlot: '18:00-20:00', status: 0, bookingNo: '' }
])

const getLevelType = (level) => {
  const map = { '国家级': 'danger', '高级': 'warning', '中级': 'primary', '初级': 'success' }
  return map[level] || 'info'
}

const getScheduleStatusName = (status) => {
  const map = { 0: '可预约', 1: '已预约', 2: '已完成', 3: '已禁用' }
  return map[status] || status
}

const getScheduleStatusType = (status) => {
  const map = { 0: 'success', 1: 'warning', 2: 'info', 3: 'danger' }
  return map[status] || 'info'
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(coachForm, {
    id: null,
    name: '',
    gender: 1,
    phone: '',
    level: '初级',
    hourlyRate: 200,
    description: '',
    status: 1
  })
  addDialogVisible.value = true
}

const editCoach = (coach) => {
  isEdit.value = true
  Object.assign(coachForm, coach)
  addDialogVisible.value = true
}

const deleteCoach = (coach) => {
  ElMessageBox.confirm(`确定要删除教练"${coach.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = coaches.value.findIndex(c => c.id === coach.id)
    if (index > -1) {
      coaches.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const saveCoach = () => {
  if (!coachForm.name) {
    ElMessage.warning('请输入教练姓名！')
    return
  }
  if (!coachForm.phone) {
    ElMessage.warning('请输入联系电话！')
    return
  }

  if (isEdit.value) {
    const index = coaches.value.findIndex(c => c.id === coachForm.id)
    if (index > -1) {
      coaches.value[index] = { ...coachForm }
    }
    ElMessage.success('编辑成功')
  } else {
    coaches.value.unshift({
      ...coachForm,
      id: Date.now()
    })
    ElMessage.success('新增成功')
  }
  addDialogVisible.value = false
}

const viewSchedule = (coach) => {
  currentCoach.value = coach
  scheduleDialogVisible.value = true
}

const bookSchedule = (row) => {
  ElMessageBox.confirm(`确定要预约 ${row.timeSlot} 时段吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    row.status = 1
    row.bookingNo = 'COACH' + Date.now().toString().slice(-10)
    ElMessage.success('预约成功')
  }).catch(() => {})
}

const completeSchedule = (row) => {
  row.status = 2
  ElMessage.success('课程已完成')
}

const disableSchedule = (row) => {
  ElMessageBox.confirm(`确定要禁用 ${row.timeSlot} 时段吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 3
    ElMessage.success('已禁用')
  }).catch(() => {})
}
</script>

<style scoped>
.coach-card {
  margin-bottom: 20px;
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.coach-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.coach-detail {
  font-size: 14px;
  color: #606266;
}

.coach-detail p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.coach-desc {
  color: #909399;
  font-size: 12px;
}

.coach-footer {
  margin-top: 15px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 5px;
}
</style>
