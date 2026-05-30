<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">分账任务</span>
      <el-button type="primary" @click="handleCalculate">
        <el-icon><Calculator /></el-icon>
        触发分账计算
      </el-button>
    </div>

    <div class="table-container">
      <div class="search-bar">
        <el-input
          v-model="searchForm.task_no"
          placeholder="任务编号"
          clearable
          style="width: 200px"
        />
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="待处理" :value="0" />
          <el-option label="处理中" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="失败" :value="3" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="task_no" label="任务编号" width="220" />
        <el-table-column prop="settlement_period" label="结算周期" width="120" />
        <el-table-column prop="task_type" label="任务类型" width="100">
          <template #default="{ row }">
            {{ getTaskTypeText(row.task_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="retry_count" label="重试次数" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="finished_at" label="完成时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetails(row)">查看明细</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog
      v-model="calculateDialogVisible"
      title="触发分账计算"
      width="500px"
    >
      <el-form :model="calculateForm" :rules="calculateRules" ref="calculateFormRef" label-width="100px">
        <el-form-item label="剧集ID" prop="drama_id">
          <el-input-number v-model="calculateForm.drama_id" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结算周期" prop="settlement_period">
          <el-input v-model="calculateForm.settlement_period" placeholder="如：202605" />
        </el-form-item>
        <el-form-item label="任务类型" prop="task_type">
          <el-select v-model="calculateForm.task_type" style="width: 100%">
            <el-option label="播放分账" :value="1" />
            <el-option label="付费分账" :value="2" />
            <el-option label="全部分账" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="calculateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCalculate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCalculationTasks, calculateShare } from '@/api/share'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const calculateDialogVisible = ref(false)
const calculateFormRef = ref(null)

const searchForm = reactive({
  task_no: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const calculateForm = reactive({
  drama_id: 1,
  settlement_period: '202605',
  task_type: 3
})

const calculateRules = {
  drama_id: [{ required: true, message: '请输入剧集ID', trigger: 'blur' }],
  settlement_period: [{ required: true, message: '请输入结算周期', trigger: 'blur' }],
  task_type: [{ required: true, message: '请选择任务类型', trigger: 'change' }]
}

const getStatusType = (status) => {
  const types = ['info', 'warning', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待处理', '处理中', '已完成', '失败']
  return texts[status] || '未知'
}

const getTaskTypeText = (type) => {
  const texts = ['', '播放分账', '付费分账', '全部分账']
  return texts[type] || '未知'
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      task_no: searchForm.task_no
    }
    if (searchForm.status !== '') {
      params.status = searchForm.status
    }
    const res = await getCalculationTasks(params)
    if (res) {
      tableData.value = res.list || []
      pagination.total = res.total || 0
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.task_no = ''
  searchForm.status = ''
  handleSearch()
}

const handleCalculate = () => {
  calculateDialogVisible.value = true
}

const handleSubmitCalculate = async () => {
  if (!calculateFormRef.value) return
  
  await calculateFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await calculateShare(calculateForm)
        ElMessage.success('分账任务已提交')
        calculateDialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交失败', error)
      }
    }
  })
}

const handleViewDetails = (row) => {
  router.push({ path: '/share/details', query: { task_id: row.id } })
}

onMounted(() => {
  loadData()
})
</script>
