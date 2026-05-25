<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">月卡管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">办理月卡</el-button>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-label">月卡总数</div>
          <div class="stat-value">{{ stats.total || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-label">有效月卡</div>
          <div class="stat-value text-success">{{ stats.active || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-label">已过期</div>
          <div class="stat-value text-danger">{{ stats.expired || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-label">即将到期</div>
          <div class="stat-value text-warning">{{ stats.expiring || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.plate_number" placeholder="请输入车牌号" clearable @clear="fetchList" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable @change="fetchList">
            <el-option label="有效" :value="1" />
            <el-option label="已过期" :value="2" />
            <el-option label="已退卡" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="card_number" label="月卡编号" width="180" />
      <el-table-column prop="plate_number" label="车牌号" width="120" />
      <el-table-column prop="owner_name" label="车主" width="100" />
      <el-table-column prop="owner_phone" label="联系电话" width="130" />
      <el-table-column label="有效期" width="240">
        <template #default="{ row }">
          {{ formatDate(row.start_date) }} 至 {{ formatDate(row.end_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="months" label="月数" width="80">
        <template #default="{ row }">
          {{ row.months }} 个月
        </template>
      </el-table-column>
      <el-table-column label="总费用" width="100">
        <template #default="{ row }">
          ¥{{ row.total_fee }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success">有效</el-tag>
          <el-tag v-else-if="row.status === 2" type="danger">已过期</el-tag>
          <el-tag v-else type="info">已退卡</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 1"
            type="success"
            link
            @click="handleRenew(row)"
          >续期</el-button>
          <el-button
            v-if="row.status === 1"
            type="danger"
            link
            @click="handleRefund(row)"
          >退卡</el-button>
        </template>
      </el-table-column>
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="车牌号" prop="plate_number">
          <el-input v-model="form.plate_number" placeholder="请输入车牌号" @blur="searchVehicle" />
          <div v-if="vehicleInfo" class="vehicle-info">
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="车主">{{ vehicleInfo.owner_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="电话">{{ vehicleInfo.owner_phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="类型">
                {{ vehicleInfo.vehicle_type === 1 ? '小型车' : vehicleInfo.vehicle_type === 2 ? '中型车' : '大型车' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-form-item>
        <el-form-item label="车主姓名">
          <el-input v-model="form.owner_name" placeholder="请输入车主姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.owner_phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="开始日期" prop="start_date">
          <el-date-picker
            v-model="form.start_date"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="购买月数" prop="months">
          <el-input-number v-model="form.months" :min="1" :max="36" />
          <span style="margin-left: 10px">个月</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="form.pay_method">
            <el-option label="现金" value="现金" />
            <el-option label="微信" value="微信" />
            <el-option label="支付宝" value="支付宝" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="renewDialogVisible"
      title="月卡续期"
      width="400px"
    >
      <el-form :model="renewForm" label-width="100px">
        <el-form-item label="车牌号">
          <span>{{ currentRenewCard?.plate_number }}</span>
        </el-form-item>
        <el-form-item label="当前到期">
          <span>{{ currentRenewCard ? formatDate(currentRenewCard.end_date) : '-' }}</span>
        </el-form-item>
        <el-form-item label="续期月数" prop="months">
          <el-input-number v-model="renewForm.months" :min="1" :max="36" />
          <span style="margin-left: 10px">个月</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="renewForm.pay_method">
            <el-option label="现金" value="现金" />
            <el-option label="微信" value="微信" />
            <el-option label="支付宝" value="支付宝" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="renewLoading" @click="handleRenewSubmit">确认续期</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCardList,
  getCardStatistics,
  getVehicleByPlate,
  createCard,
  renewCard,
  refundCard
} from '@/api'

const loading = ref(false)
const tableData = ref([])
const stats = ref({})
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const searchForm = reactive({
  plate_number: '',
  status: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('办理月卡')
const submitting = ref(false)
const formRef = ref(null)
const vehicleInfo = ref(null)

const form = reactive({
  plate_number: '',
  owner_name: '',
  owner_phone: '',
  start_date: '',
  months: 1,
  pay_method: '现金',
  remark: ''
})

const rules = {
  plate_number: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  months: [{ required: true, message: '请输入购买月数', trigger: 'blur' }]
}

const renewDialogVisible = ref(false)
const renewLoading = ref(false)
const currentRenewCard = ref(null)
const renewForm = reactive({
  months: 1,
  pay_method: '现金'
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm
    }
    
    const res = await getCardList(params)
    if (res.code === 0) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await getCardStatistics()
    if (res.code === 0) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('Fetch stats error:', error)
  }
}

const resetForm = () => {
  Object.assign(form, {
    plate_number: '',
    owner_name: '',
    owner_phone: '',
    start_date: '',
    months: 1,
    pay_method: '现金',
    remark: ''
  })
  vehicleInfo.value = null
  formRef.value?.resetFields()
}

const searchVehicle = async () => {
  if (!form.plate_number) {
    vehicleInfo.value = null
    return
  }
  
  try {
    const res = await getVehicleByPlate(form.plate_number)
    if (res.code === 0 && res.data) {
      vehicleInfo.value = res.data
      form.owner_name = res.data.owner_name || ''
      form.owner_phone = res.data.owner_phone || ''
    }
  } catch {
    vehicleInfo.value = null
  }
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const data = { ...form }
        const res = await createCard(data)
        
        if (res.code === 0) {
          ElMessage.success('办理成功')
          dialogVisible.value = false
          fetchList()
          fetchStats()
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleRenew = (row) => {
  currentRenewCard.value = row
  renewForm.months = 1
  renewForm.pay_method = '现金'
  renewDialogVisible.value = true
}

const handleRenewSubmit = async () => {
  if (!currentRenewCard.value) return
  
  renewLoading.value = true
  try {
    const res = await renewCard(currentRenewCard.value.id, renewForm)
    if (res.code === 0) {
      ElMessage.success('续期成功')
      renewDialogVisible.value = false
      fetchList()
      fetchStats()
    }
  } finally {
    renewLoading.value = false
  }
}

const handleRefund = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要退卡吗？车牌号: ${row.plate_number}`, '提示', {
      type: 'warning'
    })
    const res = await refundCard(row.id)
    if (res.code === 0) {
      ElMessage.success('退卡成功')
      fetchList()
      fetchStats()
    }
  } catch {}
}

onMounted(() => {
  fetchList()
  fetchStats()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.text-success { color: #67c23a; }
.text-danger { color: #f56c6c; }
.text-warning { color: #e6a23c; }

.vehicle-info {
  margin-top: 10px;
  width: 100%;
}
</style>
