<template>
  <div class="assets-page">
    <div class="page-header">
      <h2 class="page-title">资产列表</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增资产
        </el-button>
        <el-button @click="openScanDialog">
          <el-icon><Camera /></el-icon>
          扫码查询
        </el-button>
      </div>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="资产名称/编号/品牌" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filterForm.category_id" placeholder="请选择分类" clearable>
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="空闲" value="IDLE" />
            <el-option label="使用中" value="IN_USE" />
            <el-option label="维修中" value="MAINTENANCE" />
            <el-option label="已报废" value="SCRAPPED" />
            <el-option label="已丢失" value="LOST" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAssets">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="assets" v-loading="loading">
        <el-table-column prop="asset_code" label="资产编号" width="120" />
        <el-table-column prop="name" label="资产名称" min-width="150" />
        <el-table-column prop="category_name" label="分类" width="100" />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="specification" label="规格型号" min-width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="current_user_name" label="使用人" width="100" />
        <el-table-column prop="current_department_name" label="使用部门" width="120" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button type="success" link @click="showQRCode(row)">
              <el-icon><QrCode /></el-icon>
              二维码
            </el-button>
            <el-button type="warning" link @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="deleteAsset(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadAssets"
        @current-change="loadAssets"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="assetForm" :rules="rules" ref="assetFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资产编号" prop="asset_code">
              <el-input v-model="assetForm.asset_code" placeholder="自动生成或手动输入">
                <template #append>
                  <el-button @click="generateCode">生成</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产名称" prop="name">
              <el-input v-model="assetForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产分类" prop="category_id">
              <el-select v-model="assetForm.category_id" style="width: 100%">
                <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌">
              <el-input v-model="assetForm.brand" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="assetForm.specification" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="序列号">
              <el-input v-model="assetForm.serial_number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购日期">
              <el-date-picker v-model="assetForm.purchase_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购价格">
              <el-input-number v-model="assetForm.purchase_price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商">
              <el-input v-model="assetForm.supplier" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存放位置">
              <el-input v-model="assetForm.location" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="assetForm.description" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAsset">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="qrDialogVisible" title="资产二维码" width="400px">
      <div class="qr-container" v-if="currentQRCode">
        <img :src="currentQRCode" alt="二维码" class="qr-image" />
        <p class="qr-tip">扫码查看资产详情</p>
      </div>
    </el-dialog>

    <el-dialog v-model="scanDialogVisible" title="扫码查询" width="500px">
      <div class="scan-container">
        <div id="qr-reader" style="width: 100%"></div>
        <el-input v-model="scanResult" placeholder="扫码结果" class="scan-result" />
        <div class="scan-actions">
          <el-button type="primary" @click="startScan">开始扫码</el-button>
          <el-button @click="stopScan">停止扫码</el-button>
          <el-button type="success" @click="queryByQRCode" :disabled="!scanResult">查询</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Html5Qrcode } from 'html5-qrcode'
import { assets as assetsApi, categories as categoriesApi, qrcode as qrcodeApi } from '../api'

const router = useRouter()
const loading = ref(false)
const assets = ref([])
const categories = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filterForm = reactive({
  keyword: '',
  category_id: '',
  status: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const assetFormRef = ref(null)
const assetForm = reactive({
  id: null,
  asset_code: '',
  name: '',
  category_id: '',
  brand: '',
  specification: '',
  serial_number: '',
  purchase_date: '',
  purchase_price: 0,
  supplier: '',
  location: '',
  description: '',
  status: 'IDLE'
})

const rules = {
  asset_code: [{ required: true, message: '请输入资产编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择资产分类', trigger: 'change' }]
}

const qrDialogVisible = ref(false)
const currentQRCode = ref('')
const currentAsset = ref(null)

const scanDialogVisible = ref(false)
const scanResult = ref('')
let html5QrCode = null

const getStatusType = (status) => {
  const types = {
    IDLE: 'success',
    IN_USE: 'primary',
    MAINTENANCE: 'warning',
    SCRAPPED: 'info',
    LOST: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    IDLE: '空闲',
    IN_USE: '使用中',
    MAINTENANCE: '维修中',
    SCRAPPED: '已报废',
    LOST: '已丢失'
  }
  return texts[status] || status
}

const loadAssets = async () => {
  loading.value = true
  try {
    const res = await assetsApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: filterForm.keyword,
      category_id: filterForm.category_id,
      status: filterForm.status
    })
    if (res.code === 200) {
      assets.value = res.data
      total.value = res.total
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await categoriesApi.getList()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.category_id = ''
  filterForm.status = ''
  page.value = 1
  loadAssets()
}

const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增资产'
  Object.keys(assetForm).forEach(key => {
    assetForm[key] = key === 'status' ? 'IDLE' : key === 'purchase_price' ? 0 : ''
  })
  generateCode()
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑资产'
  Object.assign(assetForm, row)
  dialogVisible.value = true
}

const generateCode = async () => {
  try {
    const res = await assetsApi.generateCode()
    if (res.code === 200) {
      assetForm.asset_code = res.data
    }
  } catch (error) {
    console.error('生成编号失败', error)
  }
}

const saveAsset = async () => {
  if (!assetFormRef.value) return
  await assetFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (isEdit.value) {
          res = await assetsApi.update(assetForm.id, assetForm)
        } else {
          res = await assetsApi.create(assetForm)
        }
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          loadAssets()
        }
      } catch (error) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

const deleteAsset = (row) => {
  ElMessageBox.confirm('确定要删除该资产吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await assetsApi.delete(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadAssets()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const viewDetail = (row) => {
  router.push(`/assets/${row.id}`)
}

const showQRCode = async (row) => {
  currentAsset.value = row
  try {
    const res = await qrcodeApi.getAssetQR(row.id)
    if (res.code === 200) {
      currentQRCode.value = res.data
      qrDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取二维码失败')
  }
}

const openScanDialog = () => {
  scanResult.value = ''
  scanDialogVisible.value = true
}

const startScan = async () => {
  try {
    html5QrCode = new Html5Qrcode('qr-reader')
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

const queryByQRCode = async () => {
  try {
    const res = await qrcodeApi.decode({ qr_data: scanResult.value })
    if (res.code === 200) {
      scanDialogVisible.value = false
      router.push(`/assets/${res.data.id}`)
    }
  } catch (error) {
    ElMessage.error('未找到对应资产')
  }
}

onMounted(() => {
  loadAssets()
  loadCategories()
})

onUnmounted(() => {
  stopScan()
})
</script>

<style scoped>
.assets-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.qr-container {
  text-align: center;
  padding: 20px 0;
}

.qr-image {
  width: 250px;
  height: 250px;
}

.qr-tip {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}

.scan-container {
  padding: 20px 0;
}

.scan-result {
  margin-top: 20px;
}

.scan-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
