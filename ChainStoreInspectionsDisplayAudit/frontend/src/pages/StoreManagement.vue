<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Store,
  MapPin,
  User,
  Phone,
  Navigation,
  RefreshCw
} from 'lucide-vue-next'
import { getStores, createStore, updateStore, deleteStore } from '@/api/store'
import Empty from '@/components/Empty.vue'
import type { Store as StoreType } from '@/types'

const loading = ref(false)
const stores = ref<StoreType[]>([])
const total = ref(0)

const filters = reactive({
  keyword: '',
  area: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const areaOptions = [
  { label: '全部区域', value: '' },
  { label: '华东区', value: '华东区' },
  { label: '华南区', value: '华南区' },
  { label: '华北区', value: '华北区' },
  { label: '华中区', value: '华中区' },
  { label: '西南区', value: '西南区' },
  { label: '西北区', value: '西北区' },
  { label: '东北区', value: '东北区' }
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '营业中', value: '1' },
  { label: '已关闭', value: '0' }
]

const provinceOptions = [
  { label: '北京市', value: '北京市' },
  { label: '上海市', value: '上海市' },
  { label: '广东省', value: '广东省' },
  { label: '江苏省', value: '江苏省' },
  { label: '浙江省', value: '浙江省' },
  { label: '山东省', value: '山东省' },
  { label: '四川省', value: '四川省' },
  { label: '湖北省', value: '湖北省' },
  { label: '湖南省', value: '湖南省' },
  { label: '河南省', value: '河南省' },
  { label: '河北省', value: '河北省' },
  { label: '福建省', value: '福建省' }
]

const cityOptions = ref<{ label: string; value: string }[]>([])
const districtOptions = ref<{ label: string; value: string }[]>([])

const regionData: Record<string, Record<string, string[]>> = {
  '北京市': {
    '北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区']
  },
  '上海市': {
    '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区']
  },
  '广东省': {
    '广州市': ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '番禺区'],
    '深圳市': ['福田区', '南山区', '罗湖区', '宝安区', '龙岗区', '龙华区'],
    '东莞市': ['莞城区', '南城区', '东城区', '万江区']
  },
  '江苏省': {
    '南京市': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区'],
    '苏州市': ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区', '工业园区']
  },
  '浙江省': {
    '杭州市': ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区', '余杭区'],
    '宁波市': ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区']
  }
}

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const formData = reactive({
  id: null as number | null,
  code: '',
  name: '',
  province: '',
  city: '',
  district: '',
  address: '',
  longitude: null as number | null,
  latitude: null as number | null,
  manager: '',
  managerPhone: '',
  area: '',
  status: 1
})

const formRules: FormRules = {
  code: [{ required: true, message: '请输入门店编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  district: [{ required: true, message: '请选择区县', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入店长姓名', trigger: 'blur' }],
  managerPhone: [
    { required: true, message: '请输入店长电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  area: [{ required: true, message: '请选择区域', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const fetchStores = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      area: filters.area || undefined,
      status: filters.status || undefined
    }
    const response = await getStores(params)
    if (response.code === 0) {
      stores.value = response.data.list
      total.value = response.data.total
    }
  } catch (error) {
    ElMessage.error('获取门店列表失败')
  } finally {
    loading.value = false
  }
}

const handleProvinceChange = (val: string) => {
  formData.city = ''
  formData.district = ''
  if (val && regionData[val]) {
    cityOptions.value = Object.keys(regionData[val]).map(city => ({
      label: city,
      value: city
    }))
  } else {
    cityOptions.value = []
  }
  districtOptions.value = []
}

const handleCityChange = (val: string) => {
  formData.district = ''
  if (val && formData.province && regionData[formData.province]?.[val]) {
    districtOptions.value = regionData[formData.province][val].map(district => ({
      label: district,
      value: district
    }))
  } else {
    districtOptions.value = []
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchStores()
}

const handleReset = () => {
  filters.keyword = ''
  filters.area = ''
  filters.status = ''
  pagination.page = 1
  fetchStores()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchStores()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchStores()
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  formData.id = null
  formData.code = ''
  formData.name = ''
  formData.province = ''
  formData.city = ''
  formData.district = ''
  formData.address = ''
  formData.longitude = null
  formData.latitude = null
  formData.manager = ''
  formData.managerPhone = ''
  formData.area = ''
  formData.status = 1
  cityOptions.value = []
  districtOptions.value = []
  dialogVisible.value = true
}

const openEditDialog = (row: StoreType) => {
  dialogMode.value = 'edit'
  formData.id = row.id
  formData.code = row.code
  formData.name = row.name
  formData.province = row.province || ''
  formData.city = row.city
  formData.district = row.district
  formData.address = row.address
  formData.longitude = row.longitude || null
  formData.latitude = row.latitude || null
  formData.manager = row.manager || ''
  formData.managerPhone = row.managerPhone || ''
  formData.area = row.area || ''
  formData.status = row.status
  handleProvinceChange(formData.province)
  if (formData.province && formData.city) {
    handleCityChange(formData.city)
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const submitData = {
          code: formData.code,
          name: formData.name,
          province: formData.province,
          city: formData.city,
          district: formData.district,
          address: formData.address,
          longitude: formData.longitude,
          latitude: formData.latitude,
          manager: formData.manager,
          managerPhone: formData.managerPhone,
          area: formData.area,
          status: formData.status
        }

        let response
        if (dialogMode.value === 'create') {
          response = await createStore(submitData)
        } else {
          response = await updateStore(formData.id!, submitData)
        }

        if (response.code === 0) {
          ElMessage.success(dialogMode.value === 'create' ? '新增门店成功' : '编辑门店成功')
          dialogVisible.value = false
          fetchStores()
        }
      } catch (error) {
        ElMessage.error(dialogMode.value === 'create' ? '新增门店失败' : '编辑门店失败')
      }
    }
  })
}

const handleDelete = async (row: StoreType) => {
  try {
    await ElMessageBox.confirm(`确定要删除门店「${row.name}」吗？删除后数据无法恢复。`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    const response = await deleteStore(row.id)
    if (response.code === 0) {
      ElMessage.success('删除门店成功')
      fetchStores()
    }
  } catch {
    // 用户取消
  }
}

const handleExport = () => {
  ElMessage.success('导出功能开发中')
}

const handleImport = () => {
  ElMessage.success('导入功能开发中')
}

const getStatusTag = (status: number) => {
  return status === 1
    ? { label: '营业中', type: 'success' }
    : { label: '已关闭', type: 'danger' }
}

const getFullAddress = (row: StoreType) => {
  return `${row.province || ''}${row.city || ''}${row.district || ''}${row.address || ''}`
}

const getCoordinate = (row: StoreType) => {
  if (row.longitude && row.latitude) {
    return `${row.longitude.toFixed(6)}, ${row.latitude.toFixed(6)}`
  }
  return '-'
}

onMounted(() => {
  fetchStores()
})
</script>

<template>
  <div class="store-management-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <Store class="title-icon" />
          门店管理
        </h2>
        <p class="page-desc">管理所有门店信息，支持新增、编辑、删除和批量操作</p>
      </div>
      <div class="header-actions">
        <el-button class="action-btn" @click="handleImport">
          <Upload :size="16" />
          批量导入
        </el-button>
        <el-button class="action-btn" @click="handleExport">
          <Download :size="16" />
          批量导出
        </el-button>
        <el-button type="primary" size="large" class="create-btn" @click="openCreateDialog">
          <Plus :size="18" />
          新增门店
        </el-button>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="区域">
          <el-select v-model="filters.area" placeholder="全部区域" style="width: 140px">
            <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" style="width: 140px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="search-box">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索门店编码/名称/地址"
              clearable
              style="width: 280px"
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
          <el-button @click="handleReset">
            <RefreshCw :size="16" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never" v-loading="loading">
      <el-table
        :data="stores"
        class="store-table"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="code" label="门店编码" width="120" min-width="120">
          <template #default="{ row }">
            <span class="code-text">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="门店名称" min-width="140">
          <template #default="{ row }">
            <div class="name-cell">
              <Store :size="16" class="name-icon" />
              <span class="name-text">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="地址" min-width="220">
          <template #default="{ row }">
            <div class="address-cell">
              <MapPin :size="14" class="info-icon" />
              <span class="info-text" :title="getFullAddress(row)">{{ getFullAddress(row) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="area" label="区域" width="100" min-width="100" />
        <el-table-column prop="city" label="城市" width="100" min-width="100" />
        <el-table-column label="店长" width="100" min-width="100">
          <template #default="{ row }">
            <div class="info-cell">
              <User :size="14" class="info-icon" />
              <span>{{ row.manager || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="店长电话" width="130" min-width="130">
          <template #default="{ row }">
            <div class="info-cell">
              <Phone :size="14" class="info-icon" />
              <span>{{ row.managerPhone || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="经纬度" width="180" min-width="180">
          <template #default="{ row }">
            <div class="info-cell">
              <Navigation :size="14" class="info-icon" />
              <span class="coordinate-text">{{ getCoordinate(row) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" min-width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type as any" effect="light" round size="small">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" link size="small" @click="openEditDialog(row)">
                <Edit :size="14" />
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">
                <Trash2 :size="14" />
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <Empty description="暂无门店数据" />
        </template>
      </el-table>

      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增门店' : '编辑门店'"
      width="700px"
      class="store-dialog"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="store-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="门店编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入门店编码" maxlength="20" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门店名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入门店名称" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="省份" prop="province">
              <el-select v-model="formData.province" placeholder="请选择省份" style="width: 100%" @change="handleProvinceChange">
                <el-option v-for="item in provinceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市" prop="city">
              <el-select v-model="formData.city" placeholder="请选择城市" style="width: 100%" @change="handleCityChange" :disabled="!formData.province">
                <el-option v-for="item in cityOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="区县" prop="district">
              <el-select v-model="formData.district" placeholder="请选择区县" style="width: 100%" :disabled="!formData.city">
                <el-option v-for="item in districtOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入详细地址" maxlength="100" show-word-limit />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number v-model="formData.longitude" :precision="6" :min="-180" :max="180" placeholder="经度" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number v-model="formData.latitude" :precision="6" :min="-90" :max="90" placeholder="纬度" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="店长姓名" prop="manager">
              <el-input v-model="formData.manager" placeholder="请输入店长姓名" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="店长电话" prop="managerPhone">
              <el-input v-model="formData.managerPhone" placeholder="请输入店长电话" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属区域" prop="area">
              <el-select v-model="formData.area" placeholder="请选择区域" style="width: 100%">
                <el-option v-for="item in areaOptions.slice(1)" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :value="1">营业中</el-radio>
                <el-radio :value="0">已关闭</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ dialogMode === 'create' ? '确定新增' : '确定修改' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.store-management-container {
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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

.action-btn {
  height: 40px;
  padding: 0 16px;
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
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
}

.table-card {
  border-radius: 16px;
  border: 1px solid #E2E8F0;
}

.store-table {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background: #F8FAFC;
}

:deep(.el-table__header th) {
  background: #F8FAFC;
  color: #475569;
  font-weight: 600;
}

.code-text {
  font-family: 'SF Mono', monospace;
  color: #165DFF;
  font-weight: 500;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-icon {
  color: #94A3B8;
  flex-shrink: 0;
}

.name-text {
  font-weight: 500;
  color: #1E293B;
}

.address-cell,
.info-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.info-icon {
  color: #94A3B8;
  flex-shrink: 0;
}

.info-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.coordinate-text {
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  color: #64748B;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
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

.store-form {
  padding: 8px 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #334155;
}

@media (max-width: 1200px) {
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-form .el-form-item {
    margin-right: 0 !important;
    margin-bottom: 12px;
  }

  .search-box :deep(.el-input) {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .store-management-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-actions .el-button {
    flex: 1;
    min-width: 120px;
  }
}
</style>
