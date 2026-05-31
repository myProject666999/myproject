<template>
  <div class="inbound-page">
    <div class="page-title">
      <el-icon :size="24"><Upload /></el-icon>
      <span>进场登记</span>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><DocumentAdd /></el-icon>
          <span>进场集装箱信息登记</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="inbound-form"
      >
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="箱号" prop="containerNo">
              <el-input v-model="formData.containerNo" placeholder="请输入箱号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="箱型" prop="containerType">
              <el-select v-model="formData.containerType" placeholder="请选择箱型" clearable>
                <el-option label="20GP" value="20GP" />
                <el-option label="40GP" value="40GP" />
                <el-option label="40HQ" value="40HQ" />
                <el-option label="45HQ" value="45HQ" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="尺寸" prop="size">
              <el-select v-model="formData.size" placeholder="请选择尺寸" clearable>
                <el-option label="20英尺" value="20" />
                <el-option label="40英尺" value="40" />
                <el-option label="45英尺" value="45" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="箱属" prop="owner">
              <el-input v-model="formData.owner" placeholder="请输入箱属公司" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="重量(吨)" prop="weight">
              <el-input-number v-model="formData.weight" :min="0" :max="50" :step="0.5" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="货物类型" prop="cargoType">
              <el-select v-model="formData.cargoType" placeholder="请选择货物类型" clearable>
                <el-option label="普通货物" value="GENERAL" />
                <el-option label="危险品" value="DANGER" />
                <el-option label="冷藏货物" value="REEFER" />
                <el-option label="易碎品" value="FRAGILE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="是否危险品" prop="isDanger">
              <el-switch v-model="formData.isDanger" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否冷藏" prop="isReefer">
              <el-switch v-model="formData.isReefer" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="危险品等级" v-if="formData.isDanger" prop="dangerLevel">
              <el-select v-model="formData.dangerLevel" placeholder="请选择等级" clearable>
                <el-option label="一级" value="LEVEL1" />
                <el-option label="二级" value="LEVEL2" />
                <el-option label="三级" value="LEVEL3" />
              </el-select>
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
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            提交登记
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
          <span>今日进场记录</span>
        </div>
      </template>
      <el-table :data="todayList" size="small">
        <el-table-column prop="containerNo" label="箱号" width="140" />
        <el-table-column prop="containerType" label="箱型" width="100" />
        <el-table-column prop="cargoType" label="货物类型" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getCargoTypeTag(row.cargoType)">
              {{ getCargoTypeText(row.cargoType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(吨)" width="100" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inboundTime" label="进场时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.inboundTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small">查看</el-button>
            <el-button type="danger" link size="small">删除</el-button>
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
  Upload,
  DocumentAdd,
  Check,
  Refresh,
  List
} from '@element-plus/icons-vue'
import { createInbound, getTodayInboundCount } from '@/api/container'
import { formatDateTime } from '@/utils/date'

const formRef = ref(null)
const loading = ref(false)
const todayList = ref([])

const formData = reactive({
  containerNo: '',
  containerType: '',
  size: '',
  owner: '',
  weight: 0,
  cargoType: '',
  isDanger: false,
  isReefer: false,
  dangerLevel: '',
  plateNumber: '',
  voyageNo: '',
  billNo: '',
  remark: ''
})

const formRules = {
  containerNo: [
    { required: true, message: '请输入箱号', trigger: 'blur' }
  ],
  containerType: [
    { required: true, message: '请选择箱型', trigger: 'change' }
  ],
  size: [
    { required: true, message: '请选择尺寸', trigger: 'change' }
  ],
  cargoType: [
    { required: true, message: '请选择货物类型', trigger: 'change' }
  ]
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await createInbound(formData)
    ElMessage.success('进场登记成功')
    
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
    owner: '',
    weight: 0,
    cargoType: '',
    isDanger: false,
    isReefer: false,
    dangerLevel: '',
    plateNumber: '',
    voyageNo: '',
    billNo: '',
    remark: ''
  })
}

async function fetchTodayList() {
  try {
    const res = await getTodayInboundCount()
    todayList.value = res.data || []
  } catch (error) {
    console.error('获取今日进场记录失败:', error)
  }
}

function getCargoTypeText(type) {
  const map = { GENERAL: '普通货物', DANGER: '危险品', REEFER: '冷藏货物', FRAGILE: '易碎品' }
  return map[type] || type
}

function getCargoTypeTag(type) {
  const map = { GENERAL: 'info', DANGER: 'danger', REEFER: 'success', FRAGILE: 'warning' }
  return map[type] || 'info'
}

function getStatusText(status) {
  const map = { PENDING: '待分配', ALLOCATED: '已分配', STOWED: '已归位' }
  return map[status] || status
}

function getStatusTag(status) {
  const map = { PENDING: 'warning', ALLOCATED: 'primary', STOWED: 'success' }
  return map[status] || 'info'
}

onMounted(() => {
  fetchTodayList()
})
</script>

<style scoped>
.inbound-page {
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

.inbound-form {
  max-width: 1200px;
}
</style>
