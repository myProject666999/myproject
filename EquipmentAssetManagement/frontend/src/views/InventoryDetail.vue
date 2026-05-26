<template>
  <div class="inventory-detail">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="page-title">盘点详情 - {{ inventory?.check_code }}</h2>
      <div class="header-actions">
        <el-button 
          v-if="inventory?.status === 'PROCESSING'"
          type="primary" 
          @click="openScanDialog"
        >
          <el-icon><Camera /></el-icon>
          扫码盘点
        </el-button>
        <el-button 
          v-if="inventory?.status === 'PROCESSING'"
          type="success" 
          @click="completeCheck"
        >
          <el-icon><CircleCheck /></el-icon>
          完成盘点
        </el-button>
      </div>
    </div>

    <el-card v-if="inventory" class="info-card">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="盘点单号">{{ inventory.check_code }}</el-descriptions-item>
        <el-descriptions-item label="盘点名称">{{ inventory.name }}</el-descriptions-item>
        <el-descriptions-item label="盘点日期">{{ inventory.check_date }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ inventory.operator_name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(inventory.status)">
            {{ getStatusText(inventory.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ inventory.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ inventory?.total_count || 0 }}</div>
            <div class="stat-label">应盘数量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ inventory?.checked_count || 0 }}</div>
            <div class="stat-label">已盘数量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value" style="color: #67c23a">{{ inventory?.normal_count || 0 }}</div>
            <div class="stat-label">正常数量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value" style="color: #f56c6c">{{ inventory?.abnormal_count || 0 }}</div>
            <div class="stat-label">异常数量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <el-table :data="details" v-loading="loading">
        <el-table-column prop="asset_code" label="资产编号" width="120" />
        <el-table-column prop="asset_name" label="资产名称" min-width="150" />
        <el-table-column prop="category_name" label="分类" width="100" />
        <el-table-column prop="location" label="登记位置" width="150" />
        <el-table-column label="盘点状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getCheckStatusType(row.check_status)">
              {{ getCheckStatusText(row.check_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location_actual" label="实际位置" width="150" />
        <el-table-column prop="check_time" label="盘点时间" width="180" />
        <el-table-column label="操作" width="120" v-if="inventory?.status === 'PROCESSING'">
          <template #default="{ row }">
            <el-button type="primary" link @click="openManualDialog(row)">
              手工盘点
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="scanDialogVisible" title="扫码盘点" width="600px">
      <div class="scan-container">
        <div id="inventory-qr-reader" style="width: 100%"></div>
        <el-input v-model="scanResult" placeholder="扫码结果或手动输入资产编号" class="scan-result" />
        <el-form :model="scanForm" class="scan-form">
          <el-form-item label="盘点状态">
            <el-radio-group v-model="scanForm.check_status">
              <el-radio value="NORMAL">正常</el-radio>
              <el-radio value="MISSING">丢失</el-radio>
              <el-radio value="DAMAGED">损坏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="实际位置">
            <el-input v-model="scanForm.location_actual" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="scanForm.remarks" type="textarea" :rows="2" />
          </el-form-item>
        </el-form>
        <div class="scan-actions">
          <el-button type="primary" @click="startScan">开始扫码</el-button>
          <el-button @click="stopScan">停止扫码</el-button>
          <el-button type="success" @click="submitScan" :disabled="!scanResult">提交</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="manualDialogVisible" title="手工盘点" width="500px">
      <el-form :model="manualForm" :rules="manualRules" ref="manualFormRef" label-width="100px">
        <el-form-item label="资产">
          <span>{{ currentDetail?.asset_name }} ({{ currentDetail?.asset_code }})</span>
        </el-form-item>
        <el-form-item label="盘点状态" prop="check_status">
          <el-radio-group v-model="manualForm.check_status">
            <el-radio value="NORMAL">正常</el-radio>
            <el-radio value="MISSING">丢失</el-radio>
            <el-radio value="DAMAGED">损坏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="实际位置">
          <el-input v-model="manualForm.location_actual" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="manualForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="manualDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitManual">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Html5Qrcode } from 'html5-qrcode'
import { inventory as inventoryApi, qrcode as qrcodeApi } from '../api'

const route = useRoute()
const router = useRouter()
const checkId = route.params.id

const loading = ref(false)
const inventory = ref(null)
const details = ref([])

const scanDialogVisible = ref(false)
const scanResult = ref('')
const scanForm = reactive({
  check_status: 'NORMAL',
  location_actual: '',
  remarks: ''
})
let html5QrCode = null

const manualDialogVisible = ref(false)
const manualFormRef = ref(null)
const currentDetail = ref(null)
const manualForm = reactive({
  check_status: 'NORMAL',
  location_actual: '',
  remarks: ''
})

const manualRules = {
  check_status: [{ required: true, message: '请选择盘点状态', trigger: 'change' }]
}

const getStatusType = (status) => {
  const types = {
    DRAFT: 'info',
    PROCESSING: 'warning',
    COMPLETED: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    DRAFT: '草稿',
    PROCESSING: '进行中',
    COMPLETED: '已完成'
  }
  return texts[status] || status
}

const getCheckStatusType = (status) => {
  const types = {
    NOT_FOUND: 'info',
    NORMAL: 'success',
    MISSING: 'danger',
    DAMAGED: 'warning'
  }
  return types[status] || 'info'
}

const getCheckStatusText = (status) => {
  const texts = {
    NOT_FOUND: '未盘点',
    NORMAL: '正常',
    MISSING: '丢失',
    DAMAGED: '损坏'
  }
  return texts[status] || status
}

const goBack = () => {
  router.push('/inventory')
}

const loadInventory = async () => {
  try {
    const res = await inventoryApi.getDetail(checkId)
    if (res.code === 200) {
      inventory.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载盘点信息失败')
  }
}

const loadDetails = async () => {
  loading.value = true
  try {
    const res = await inventoryApi.getDetails(checkId)
    if (res.code === 200) {
      details.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载盘点明细失败')
  } finally {
    loading.value = false
  }
}

const openScanDialog = () => {
  scanResult.value = ''
  Object.keys(scanForm).forEach(key => {
    scanForm[key] = key === 'check_status' ? 'NORMAL' : ''
  })
  scanDialogVisible.value = true
}

const startScan = async () => {
  try {
    html5QrCode = new Html5Qrcode('inventory-qr-reader')
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        scanResult.value = decodedText
        stopScan()
      },
      (errorMessage) => {
        console.log(errorMessage)
      }
    )
  } catch (error) {
    ElMessage.error('启动摄像头失败，请检查权限设置')
  }
}

const stopScan = async () => {
  if (html5QrCode) {
    try {
      await html5QrCode.stop()
    } catch (e) {}
    html5QrCode = null
  }
}

const submitScan = async () => {
  try {
    let assetId = null
    
    if (scanResult.value.startsWith('ASSET:')) {
      const res = await qrcodeApi.decode({ qr_data: scanResult.value })
      if (res.code === 200) {
        assetId = res.data.id
      }
    } else {
      const detail = details.value.find(d => d.asset_code === scanResult.value)
      if (detail) {
        assetId = detail.asset_id
      }
    }

    if (!assetId) {
      ElMessage.error('未找到对应资产')
      return
    }

    const res = await inventoryApi.scan(checkId, {
      asset_id: assetId,
      ...scanForm,
      check_operator_id: 1
    })

    if (res.code === 200) {
      ElMessage.success('盘点成功')
      scanResult.value = ''
      loadInventory()
      loadDetails()
    }
  } catch (error) {
    ElMessage.error(error.message || '盘点失败')
  }
}

const openManualDialog = (row) => {
  currentDetail.value = row
  manualForm.check_status = 'NORMAL'
  manualForm.location_actual = ''
  manualForm.remarks = ''
  manualDialogVisible.value = true
}

const submitManual = async () => {
  if (!manualFormRef.value) return
  await manualFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await inventoryApi.scan(checkId, {
          asset_id: currentDetail.value.asset_id,
          ...manualForm,
          check_operator_id: 1
        })
        if (res.code === 200) {
          ElMessage.success('盘点成功')
          manualDialogVisible.value = false
          loadInventory()
          loadDetails()
        }
      } catch (error) {
        ElMessage.error(error.message || '盘点失败')
      }
    }
  })
}

const completeCheck = () => {
  ElMessageBox.confirm('确定要完成盘点吗？完成后将不能再修改盘点结果。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await inventoryApi.complete(checkId)
      if (res.code === 200) {
        ElMessage.success('盘点已完成')
        loadInventory()
      }
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadInventory()
  loadDetails()
})

onUnmounted(() => {
  stopScan()
})
</script>

<style scoped>
.inventory-detail {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.info-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.table-card {
  margin-bottom: 20px;
}

.scan-container {
  padding: 20px 0;
}

.scan-result {
  margin-top: 20px;
}

.scan-form {
  margin-top: 20px;
}

.scan-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
