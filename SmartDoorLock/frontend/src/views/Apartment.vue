<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">房源管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增房源</el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="房源编号/地址"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
          >
            <el-option label="空闲" value="VACANT" />
            <el-option label="已占用" value="OCCUPIED" />
            <el-option label="维护中" value="MAINTENANCE" />
            <el-option label="已预订" value="RESERVED" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋">
          <el-input
            v-model="queryForm.buildingNo"
            placeholder="楼栋号"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="apartmentNo" label="房源编号" width="120" />
        <el-table-column prop="buildingNo" label="楼栋" width="80" />
        <el-table-column prop="roomNo" label="房间号" width="80" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="area" label="面积(㎡)" width="100" />
        <el-table-column prop="houseType" label="户型" width="100" />
        <el-table-column prop="floor" label="楼层" width="80" />
        <el-table-column prop="monthlyRent" label="月租金(元)" width="120">
          <template #default="{ row }">
            <span class="text-primary font-medium">¥{{ formatMoney(row.monthlyRent) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deposit" label="押金(元)" width="120">
          <template #default="{ row }">
            ¥{{ formatMoney(row.deposit) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status, 'apartment') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房源编号" prop="apartmentNo">
              <el-input v-model="formData.apartmentNo" placeholder="请输入房源编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="楼栋号" prop="buildingNo">
              <el-input v-model="formData.buildingNo" placeholder="请输入楼栋号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间号" prop="roomNo">
              <el-input v-model="formData.roomNo" placeholder="请输入房间号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="楼层" prop="floor">
              <el-input v-model="formData.floor" placeholder="如：3/6" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="地址" prop="address">
              <el-input v-model="formData.address" placeholder="请输入详细地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积(㎡)" prop="area">
              <el-input-number v-model="formData.area" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="户型" prop="houseType">
              <el-input v-model="formData.houseType" placeholder="如：1室1厅" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月租金(元)" prop="monthlyRent">
              <el-input-number v-model="formData.monthlyRent" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="押金(元)" prop="deposit">
              <el-input-number v-model="formData.deposit" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option label="空闲" value="VACANT" />
                <el-option label="已占用" value="OCCUPIED" />
                <el-option label="维护中" value="MAINTENANCE" />
                <el-option label="已预订" value="RESERVED" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="房源详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="房源编号">{{ detailData.apartmentNo }}</el-descriptions-item>
        <el-descriptions-item label="楼栋">{{ detailData.buildingNo }}</el-descriptions-item>
        <el-descriptions-item label="房间号">{{ detailData.roomNo }}</el-descriptions-item>
        <el-descriptions-item label="楼层">{{ detailData.floor }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ detailData.address }}</el-descriptions-item>
        <el-descriptions-item label="面积">{{ detailData.area }}㎡</el-descriptions-item>
        <el-descriptions-item label="户型">{{ detailData.houseType }}</el-descriptions-item>
        <el-descriptions-item label="月租金">¥{{ formatMoney(detailData.monthlyRent) }}</el-descriptions-item>
        <el-descriptions-item label="押金">¥{{ formatMoney(detailData.deposit) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(detailData.status)">
            {{ getStatusText(detailData.status, 'apartment') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, View, Edit, Delete } from '@element-plus/icons-vue'
import {
  getApartmentPage,
  addApartment,
  updateApartment,
  deleteApartment,
  getApartmentDetail
} from '@/api/apartment'
import { formatMoney, formatDateTime, getStatusTagType, getStatusText } from '@/utils/format'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const total = ref(0)
const tableData = ref([])
const detailData = ref({})

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  buildingNo: ''
})

const formData = reactive({
  id: null,
  apartmentNo: '',
  buildingNo: '',
  roomNo: '',
  floor: '',
  address: '',
  area: null,
  houseType: '',
  monthlyRent: null,
  deposit: null,
  status: 'VACANT',
  remark: ''
})

const formRules = {
  apartmentNo: [{ required: true, message: '请输入房源编号', trigger: 'blur' }],
  buildingNo: [{ required: true, message: '请输入楼栋号', trigger: 'blur' }],
  roomNo: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
  houseType: [{ required: true, message: '请输入户型', trigger: 'blur' }],
  monthlyRent: [{ required: true, message: '请输入月租金', trigger: 'blur' }],
  deposit: [{ required: true, message: '请输入押金', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getApartmentPage(queryForm)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  fetchData()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.status = ''
  queryForm.buildingNo = ''
  handleSearch()
}

function handleAdd() {
  isEdit.value = false
  dialogTitle.value = '新增房源'
  Object.assign(formData, {
    id: null,
    apartmentNo: '',
    buildingNo: '',
    roomNo: '',
    floor: '',
    address: '',
    area: null,
    houseType: '',
    monthlyRent: null,
    deposit: null,
    status: 'VACANT',
    remark: ''
  })
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  dialogTitle.value = '编辑房源'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

async function handleView(row) {
  const res = await getApartmentDetail(row.id)
  detailData.value = res.data
  detailVisible.value = true
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除房源【${row.apartmentNo}】吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await deleteApartment(row.id)
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      await updateApartment(formData)
      ElMessage.success('更新成功')
    } else {
      await addApartment(formData)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== false) {
      console.error('Submit error:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
