<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  User,
  Eye,
  Play,
  FileText,
  ClipboardList,
  Flag
} from 'lucide-vue-next'
import dayjs from 'dayjs'
import { getTasks, createTask, startTask } from '@/api/task'
import { getTemplates } from '@/api/template'
import { getStores } from '@/api/store'
import { getUsers } from '@/api/auth'
import Empty from '@/components/Empty.vue'
import StatusTag from '@/components/StatusTag.vue'
import type { InspectionTask, ChecklistTemplate, Store, User } from '@/types'

const router = useRouter()

const loading = ref(false)
const tasks = ref<InspectionTask[]>([])
const total = ref(0)

const filters = reactive({
  status: '',
  priority: '',
  dateRange: [] as string[],
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 9
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const priorityOptions = [
  { label: '全部', value: '' },
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' }
]

const priorityConfig: Record<string, { label: string; type: string }> = {
  high: { label: '高', type: 'danger' },
  medium: { label: '中', type: 'warning' },
  low: { label: '低', type: 'info' }
}

const dialogVisible = ref(false)
const formRef = ref()
const formData = reactive({
  name: '',
  templateId: null as number | null,
  storeIds: [] as number[],
  inspectorIds: [] as number[],
  startDate: '',
  endDate: '',
  priority: 'medium'
})

const templates = ref<ChecklistTemplate[]>([])
const stores = ref<Store[]>([])
const inspectors = ref<User[]>([])

const fetchTasks = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: filters.status || undefined,
      keyword: filters.keyword || undefined
    }
    const response = await getTasks(params)
    if (response.code === 0) {
      tasks.value = response.data.list.map((task: any) => ({
        ...task,
        priority: task.priority || ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
      }))
      total.value = response.data.total
    }
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const fetchOptions = async () => {
  try {
    const [templateRes, storeRes, userRes] = await Promise.all([
      getTemplates({ pageSize: 100 }),
      getStores({ pageSize: 100 }),
      getUsers()
    ])
    if (templateRes.code === 0) templates.value = templateRes.data.list
    if (storeRes.code === 0) stores.value = storeRes.data.list
    if (userRes.code === 0) inspectors.value = userRes.data.filter((u: User) => u.role === 'inspector')
  } catch (error) {
    console.error('获取选项数据失败', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchTasks()
}

const handleReset = () => {
  filters.status = ''
  filters.priority = ''
  filters.dateRange = []
  filters.keyword = ''
  pagination.page = 1
  fetchTasks()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchTasks()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchTasks()
}

const openCreateDialog = () => {
  formData.name = ''
  formData.templateId = null
  formData.storeIds = []
  formData.inspectorIds = []
  formData.startDate = ''
  formData.endDate = ''
  formData.priority = 'medium'
  dialogVisible.value = true
}

const handleCreate = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const response = await createTask({
          ...formData,
          priority: formData.priority
        })
        if (response.code === 0) {
          ElMessage.success('创建任务成功')
          dialogVisible.value = false
          fetchTasks()
        }
      } catch (error) {
        ElMessage.error('创建任务失败')
      }
    }
  })
}

const handleViewDetail = (id: number) => {
  router.push(`/tasks/${id}`)
}

const handleStartTask = async (task: InspectionTask) => {
  try {
    await ElMessageBox.confirm('确定要开始这个任务吗？', '开始确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const response = await startTask(task.id)
    if (response.code === 0) {
      ElMessage.success('任务已开始')
      router.push(`/inspection/${task.id}`)
    }
  } catch {
    // 用户取消
  }
}

const handleViewReport = (id: number) => {
  router.push(`/reports?taskId=${id}`)
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const getStoreName = (task: InspectionTask) => {
  if (task.stores && task.stores.length > 0) {
    return task.stores[0].name
  }
  return '未分配门店'
}

const getInspectorName = (task: InspectionTask) => {
  if (task.inspectors && task.inspectors.length > 0) {
    return task.inspectors.map(i => i.realName).join('、')
  }
  return '未分配'
}

const getTaskCode = (id: number) => {
  return `IT${String(id).padStart(6, '0')}`
}

onMounted(() => {
  fetchTasks()
  fetchOptions()
})
</script>

<template>
  <div class="task-list-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <ClipboardList class="title-icon" />
          巡店任务列表
        </h2>
        <p class="page-desc">管理和查看所有巡店任务</p>
      </div>
      <el-button type="primary" size="large" class="create-btn" @click="openCreateDialog">
        <Plus :size="18" />
        新增任务
      </el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" style="width: 140px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filters.priority" placeholder="全部优先级" style="width: 140px">
            <el-option v-for="item in priorityOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item>
          <div class="search-box">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索任务名称/编号"
              clearable
              style="width: 240px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <Search :size="16" />
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <Filter :size="16" />
            筛选
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="task-grid" v-loading="loading">
      <template v-if="tasks.length > 0">
        <div v-for="task in tasks" :key="task.id" class="task-card">
          <div class="card-header">
            <div class="task-title">{{ task.name }}</div>
            <div class="task-code">{{ getTaskCode(task.id) }}</div>
          </div>
          <div class="card-body">
            <div class="info-row">
              <MapPin :size="14" class="info-icon" />
              <span class="info-text">{{ getStoreName(task) }}</span>
            </div>
            <div class="info-row">
              <Calendar :size="14" class="info-icon" />
              <span class="info-text">{{ formatDate(task.startDate) }} ~ {{ formatDate(task.endDate) }}</span>
            </div>
            <div class="info-row">
              <User :size="14" class="info-icon" />
              <span class="info-text">{{ getInspectorName(task) }}</span>
            </div>
            <div class="tags-row">
              <StatusTag :status="task.status" type="task" />
              <el-tag :type="priorityConfig[(task as any).priority]?.type as any" effect="light" round size="small">
                <Flag :size="12" class="tag-icon" />
                {{ priorityConfig[(task as any).priority]?.label || '中' }}
              </el-tag>
            </div>
            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-label">巡检进度</span>
                <span class="progress-value">{{ task.progress }}%</span>
              </div>
              <el-progress
                :percentage="task.progress"
                :stroke-width="8"
                :color="task.progress === 100 ? '#10B981' : '#165DFF'"
                :format="() => ''"
              />
            </div>
          </div>
          <div class="card-footer">
            <el-button size="small" @click="handleViewDetail(task.id)">
              <Eye :size="14" />
              查看详情
            </el-button>
            <el-button
              v-if="task.status === 'pending'"
              type="primary"
              size="small"
              @click="handleStartTask(task)"
            >
              <Play :size="14" />
              开始任务
            </el-button>
            <el-button
              v-if="task.status === 'completed'"
              type="success"
              size="small"
              @click="handleViewReport(task.id)"
            >
              <FileText :size="14" />
              查看报告
            </el-button>
          </div>
        </div>
      </template>
      <Empty v-else description="暂无任务数据" />
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[9, 18, 36]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="新增巡店任务" width="600px" class="create-dialog">
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-form-item label="任务名称" prop="name" :rules="[{ required: true, message: '请输入任务名称', trigger: 'blur' }]">
          <el-input v-model="formData.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="检查模板" prop="templateId" :rules="[{ required: true, message: '请选择检查模板', trigger: 'change' }]">
          <el-select v-model="formData.templateId" placeholder="请选择检查模板" style="width: 100%">
            <el-option v-for="t in templates" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查门店" prop="storeIds" :rules="[{ required: true, message: '请选择检查门店', trigger: 'change' }]">
          <el-select v-model="formData.storeIds" multiple placeholder="请选择检查门店" style="width: 100%">
            <el-option v-for="s in stores" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="巡店员" prop="inspectorIds" :rules="[{ required: true, message: '请选择巡店员', trigger: 'change' }]">
          <el-select v-model="formData.inspectorIds" multiple placeholder="请选择巡店员" style="width: 100%">
            <el-option v-for="u in inspectors" :key="u.id" :label="u.realName" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate" :rules="[{ required: true, message: '请选择开始日期', trigger: 'change' }]">
          <el-date-picker v-model="formData.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate" :rules="[{ required: true, message: '请选择结束日期', trigger: 'change' }]">
          <el-date-picker v-model="formData.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="formData.priority" style="width: 100%">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.task-list-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #F8FAFC;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.title-icon {
  color: #165DFF;
  width: 28px;
  height: 28px;
}

.page-desc {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

.create-btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.filter-card {
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  margin-bottom: 24px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search-box {
  display: flex;
  align-items: center;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.task-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.task-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(22, 93, 255, 0.12);
  border-color: #165DFF;
}

.card-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  line-height: 1.4;
  flex: 1;
  padding-right: 12px;
}

.task-code {
  font-size: 12px;
  color: #94A3B8;
  background: #F1F5F9;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: 'SF Mono', monospace;
  flex-shrink: 0;
}

.card-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748B;
}

.info-icon {
  color: #94A3B8;
  flex-shrink: 0;
}

.info-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag-icon {
  margin-right: 4px;
}

.progress-section {
  padding-top: 4px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 12px;
  color: #64748B;
}

.progress-value {
  font-size: 12px;
  font-weight: 600;
  color: #165DFF;
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #F1F5F9;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  background: #FAFAFA;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #F1F5F9;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid #F1F5F9;
}

@media (max-width: 1200px) {
  .task-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .task-list-container {
    padding: 16px;
  }

  .task-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filter-form {
    flex-direction: column;
  }

  .filter-form .el-form-item {
    margin-right: 0 !important;
    margin-bottom: 12px;
  }
}
</style>
