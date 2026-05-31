<template>
  <div class="outbound-page">
    <div class="page-title">
      <el-icon :size="24"><Download /></el-icon>
      <span>出场登记</span>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><DocumentRemove /></el-icon>
          <span>出场集装箱信息登记</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="outbound-form"
      >
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="箱号" prop="containerNo">
              <el-input v-model="formData.containerNo" placeholder="请输入或扫描箱号" clearable>
                <template #append>
                  <el-button @click="queryContainer">
                    <el-icon><Search /></el-icon>
                    查询
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="箱型" prop="containerType">
              <el-input v-model="formData.containerType" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="尺寸" prop="size">
              <el-input v-model="formData.size" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="当前位置" prop="currentSlot">
              <el-input v-model="formData.currentSlot" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="进场时间" prop="inboundTime">
              <el-input v-model="formData.inboundTime" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="在场天数" prop="stayDays">
              <el-input v-model="formData.stayDays" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="车牌号" prop="plateNumber">
              <el-input v-model="formData.plateNumber" placeholder="请输入车牌号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="航次" prop="voyageNo">
              <el-input v-model="formData.voyageNo" placeholder="请输入航次" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="提单号" prop="billNo">
              <el-input v-model="formData.billNo" placeholder="请输入提单号" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="16">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" :loading="loading" :disabled="!formData.containerNo" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            确认出场
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>今日出场记录</span>
        </div>
      </template>
      <el-table :data="todayList" size="small">
        <el-table-column prop="containerNo" label="箱号" width="140" />
        <el-table-column prop="containerType" label="箱型" width="100" />
        <el-table-column prop="currentSlot" label="原位置" width="120" />
        <el-table-column prop="stayDays" label="在场天数" width="100" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="outboundTime" label="出场时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.outboundTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download,
  DocumentRemove,
  Search,
  Check,
  Refresh,
  List
} from '@element-plus/icons-vue'
import { getContainerByNo, createOutbound, getTodayOutboundCount } from '@/api/container'
import { formatDateTime } from '@/utils/date'

const formRef = ref(null)
const loading = ref(false)
const todayList = ref([])

const formData = reactive({
  containerNo: '',
  containerType: '',
  size: '',
  currentSlot: '',
  inboundTime: '',
  stayDays: '',
  plateNumber: '',
  voyageNo: '',
  billNo: '',
  remark: ''
})

const formRules = {
  containerNo: [
    { required: true, message: '请输入箱号', trigger: 'blur' }
  ]
}

async function queryContainer() {
  if (!formData.containerNo.trim()) {
    ElMessage.warning('请先输入箱号')
    return
  }
  
  try {
    const res = await getContainerByNo(formData.containerNo.trim())
    const container = res.data
    
    if (container) {
      formData.containerType = container.containerType
      formData.size = container.size
      formData.currentSlot = container.slotCode || '未分配'
      formData.inboundTime = formatDateTime(container.inboundTime)
      formData.stayDays = container.stayDays || '0'
    } else {
      ElMessage.warning('未找到该集装箱信息')
    }
  } catch (error) {
    console.error('查询集装箱失败:', error)
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await createOutbound(formData)
    ElMessage.success('出场登记成功')
    
    handleReset()
    await fetchTodayList()
  } catch (error) {
    if (error !== false) {
      console.error('提交失败:', error)
    }
  } finally {
    loading.value = false
  }
}

function handleReset() {
  formRef.value?.resetFields()
  Object.assign(formData, {
    containerNo: '',
    containerType: '',
    size: '',
    currentSlot: '',
    inboundTime: '',
    stayDays: '',
    plateNumber: '',
    voyageNo: '',
    billNo: '',
    remark: ''
  })
}

async function fetchTodayList() {
  try {
    const res = await getTodayOutboundCount()
    todayList.value = res.data || []
  } catch (error) {
    console.error('获取今日出场记录失败:', error)
  }
}

function getStatusText(status) {
  const map = { PENDING: '待处理', PROCESSING: '处理中', COMPLETED: '已完成' }
  return map[status] || status
}

function getStatusTag(status) {
  const map = { PENDING: 'warning', PROCESSING: 'primary', COMPLETED: 'success' }
  return map[status] || 'info'
}

onMounted(() => {
  fetchTodayList()
})
</script>

<style scoped>
.outbound-page {
  height: 100%;
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-weight: 600;
}

.outbound-form {
  max-width: 1200px;
}
</style>
