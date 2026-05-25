<template>
  <div class="admin-container">
    <div class="page-header">
      <h2>运单管理</h2>
      <el-button type="primary" @click="goCreate">
        <el-icon><Plus /></el-icon>
        创建运单
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" @submit.prevent>
        <el-form-item label="运单号">
          <el-input v-model="filterForm.waybillNo" placeholder="请输入运单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="待揽件" :value="0" />
            <el-option label="运输中" :value="1" />
            <el-option label="派送中" :value="2" />
            <el-option label="已签收" :value="3" />
            <el-option label="已退回" :value="4" />
            <el-option label="异常" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="waybillNo" label="运单号" width="180" />
        <el-table-column prop="goodsName" label="物品名称" />
        <el-table-column prop="senderName" label="寄件人" width="100" />
        <el-table-column prop="receiverName" label="收件人" width="100" />
        <el-table-column prop="senderAddress" label="寄件地址" show-overflow-tooltip />
        <el-table-column prop="receiverAddress" label="收件地址" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button size="small" type="primary" @click="showAddNode(row)">
              <el-icon><Plus /></el-icon>
              轨迹
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <el-dialog v-model="showNodeDialog" title="添加轨迹节点" width="600px">
      <el-form :model="nodeForm" label-width="100px">
        <el-form-item label="运单号">
          <el-input :model-value="currentRow?.waybillNo" disabled />
        </el-form-item>
        <el-form-item label="节点类型" required>
          <el-select v-model="nodeForm.nodeType" placeholder="请选择类型">
            <el-option label="揽件" :value="1" />
            <el-option label="运输" :value="2" />
            <el-option label="中转" :value="3" />
            <el-option label="派送" :value="4" />
            <el-option label="签收" :value="5" />
            <el-option label="退回" :value="6" />
            <el-option label="异常" :value="7" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前位置" required>
          <el-input v-model="nodeForm.location" placeholder="请输入当前位置" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="nodeForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="nodeForm.operator" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item label="操作人电话">
          <el-input v-model="nodeForm.operatorPhone" placeholder="请输入操作人电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNodeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddNode" :loading="submitting">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryWaybills, deleteWaybill } from '../api/waybill'
import { addTrackingNode } from '../api/tracking'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const filterForm = reactive({
  waybillNo: '',
  status: null
})

const showNodeDialog = ref(false)
const currentRow = ref(null)
const nodeForm = reactive({
  nodeType: null,
  location: '',
  description: '',
  operator: '',
  operatorPhone: ''
})

const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'primary'
    case 2: return 'primary'
    case 3: return 'success'
    case 4: return 'info'
    case 5: return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 0: return '待揽件'
    case 1: return '运输中'
    case 2: return '派送中'
    case 3: return '已签收'
    case 4: return '已退回'
    case 5: return '异常'
    default: return '未知'
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 19)
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await queryWaybills({
      ...filterForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  filterForm.waybillNo = ''
  filterForm.status = null
  handleSearch()
}

const goCreate = () => {
  router.push('/create')
}

const viewDetail = (row) => {
  router.push(`/tracking/${row.waybillNo}`)
}

const showAddNode = (row) => {
  currentRow.value = row
  nodeForm.nodeType = null
  nodeForm.location = ''
  nodeForm.description = ''
  nodeForm.operator = ''
  nodeForm.operatorPhone = ''
  showNodeDialog.value = true
}

const handleAddNode = async () => {
  if (!nodeForm.nodeType) {
    ElMessage.warning('请选择节点类型')
    return
  }
  if (!nodeForm.location) {
    ElMessage.warning('请输入当前位置')
    return
  }

  submitting.value = true
  try {
    const res = await addTrackingNode({
      waybillId: currentRow.value.id,
      waybillNo: currentRow.value.waybillNo,
      ...nodeForm
    })
    if (res.code === 200) {
      ElMessage.success('轨迹节点添加成功')
      showNodeDialog.value = false
      fetchData()
    } else {
      ElMessage.error(res.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该运单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteWaybill(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.message)
    }
  }).catch(() => {})
}

onMounted(fetchData)
</script>

<style scoped>
.admin-container {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  color: #303133;
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
