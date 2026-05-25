<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">出入记录</h2>
      <div>
        <el-button type="success" :icon="VideoPlay" @click="showEntryDialog = true">车辆入场</el-button>
        <el-button type="warning" :icon="VideoPause" @click="showExitDialog = true">车辆出场</el-button>
      </div>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.plate_number" placeholder="请输入车牌号" clearable @clear="fetchList" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.access_type" placeholder="全部" clearable @change="fetchList">
            <el-option label="入场" :value="1" />
            <el-option label="出场" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchList">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="plate_number" label="车牌号" width="120" />
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="row.access_type === 1 ? 'success' : 'info'">
            {{ row.access_type === 1 ? '入场' : '出场' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="出入时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.access_time) }}
        </template>
      </el-table-column>
      <el-table-column label="停车时长" width="120">
        <template #default="{ row }">
          {{ row.parking_duration ? row.parking_duration + ' 分钟' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="停车费用" width="100">
        <template #default="{ row }">
          {{ row.parking_fee ? '¥' + row.parking_fee : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="支付状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.pay_status === 1" type="success">已支付</el-tag>
          <el-tag v-else-if="row.pay_status === 2" type="info">免费</el-tag>
          <el-tag v-else type="warning">未支付</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="pay_method" label="支付方式" width="100" />
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.page_size"
      :page-sizes="[10, 20, 50]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="fetchList"
      @current-change="fetchList"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <el-dialog v-model="showEntryDialog" title="车辆入场" width="400px">
      <el-form :model="entryForm" label-width="80px">
        <el-form-item label="车牌号">
          <el-input v-model="entryForm.plate_number" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车位号">
          <el-input v-model="entryForm.spot_number" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEntryDialog = false">取消</el-button>
        <el-button type="primary" :loading="entryLoading" @click="handleEntry">确认入场</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showExitDialog" title="车辆出场" width="500px">
      <el-form :model="exitForm" label-width="80px">
        <el-form-item label="车牌号">
          <el-input v-model="exitForm.plate_number" placeholder="请输入车牌号" @blur="calculateExitFee" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="exitForm.pay_method">
            <el-option label="现金" value="现金" />
            <el-option label="微信" value="微信" />
            <el-option label="支付宝" value="支付宝" />
          </el-select>
        </el-form-item>
      </el-form>
      <div v-if="exitFeeInfo" class="fee-info">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="入场时间">
            {{ exitFeeInfo.entry_time }}
          </el-descriptions-item>
          <el-descriptions-item label="出场时间">
            {{ exitFeeInfo.exit_time }}
          </el-descriptions-item>
          <el-descriptions-item label="停车时长">
            {{ exitFeeInfo.duration_min }} 分钟
          </el-descriptions-item>
          <el-descriptions-item label="停车费用" label-class-name="fee-label">
            <span class="fee-amount">¥{{ exitFeeInfo.fee }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showExitDialog = false">取消</el-button>
        <el-button type="primary" :loading="exitLoading" @click="handleExit">确认出场</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getRecordList,
  entryVehicle,
  exitVehicle,
  calculateFee
} from '@/api'

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const searchForm = reactive({
  plate_number: '',
  access_type: ''
})
const dateRange = ref([])

const showEntryDialog = ref(false)
const showExitDialog = ref(false)
const entryLoading = ref(false)
const exitLoading = ref(false)
const exitFeeInfo = ref(null)

const entryForm = reactive({
  plate_number: '',
  spot_number: ''
})

const exitForm = reactive({
  plate_number: '',
  pay_method: '现金'
})

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    
    const res = await getRecordList(params)
    if (res.code === 0) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.plate_number = ''
  searchForm.access_type = ''
  dateRange.value = []
  pagination.page = 1
  fetchList()
}

const handleDateChange = () => {
  pagination.page = 1
  fetchList()
}

const handleEntry = async () => {
  if (!entryForm.plate_number) {
    ElMessage.warning('请输入车牌号')
    return
  }
  
  entryLoading.value = true
  try {
    const data = { plate_number: entryForm.plate_number }
    const res = await entryVehicle(data)
    
    if (res.code === 0) {
      ElMessage.success('入场成功')
      showEntryDialog.value = false
      entryForm.plate_number = ''
      entryForm.spot_number = ''
      fetchList()
    }
  } finally {
    entryLoading.value = false
  }
}

const calculateExitFee = async () => {
  if (!exitForm.plate_number) {
    exitFeeInfo.value = null
    return
  }
  
  try {
    const res = await calculateFee(exitForm.plate_number)
    if (res.code === 0 && res.data) {
      exitFeeInfo.value = res.data
    }
  } catch {
    exitFeeInfo.value = null
  }
}

const handleExit = async () => {
  if (!exitForm.plate_number) {
    ElMessage.warning('请输入车牌号')
    return
  }
  
  exitLoading.value = true
  try {
    const data = {
      plate_number: exitForm.plate_number,
      pay_method: exitForm.pay_method
    }
    const res = await exitVehicle(data)
    
    if (res.code === 0) {
      ElMessage.success('出场成功')
      showExitDialog.value = false
      exitForm.plate_number = ''
      exitFeeInfo.value = null
      fetchList()
    }
  } finally {
    exitLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.fee-info {
  margin: 20px 0;
}

.fee-label {
  font-weight: 600;
}

.fee-amount {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}
</style>
