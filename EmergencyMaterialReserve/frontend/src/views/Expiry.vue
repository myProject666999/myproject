<template>
  <div class="expiry-page">
    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="仓库">
          <el-select v-model="queryParams.warehouseId" placeholder="全部仓库" clearable style="width: 180px">
            <el-option
              v-for="item in warehouseList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物资">
          <el-select v-model="queryParams.materialId" placeholder="全部物资" clearable filterable style="width: 180px">
            <el-option
              v-for="item in materialList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预警等级">
          <el-select v-model="queryParams.alertLevel" placeholder="全部等级" clearable style="width: 140px">
            <el-option label="黄色预警" value="yellow" />
            <el-option label="橙色预警" value="orange" />
            <el-option label="红色预警" value="red" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="未处理" :value="0" />
            <el-option label="已处理" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">查询</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="warning" :icon="AlarmClock" :loading="checkLoading" @click="handleCheck">
            手动检查
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table
        v-loading="loading"
        :data="alertList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="warehouseName" label="仓库名称" min-width="140" />
        <el-table-column prop="materialName" label="物资名称" min-width="140" />
        <el-table-column prop="batchNo" label="批次号" min-width="130" />
        <el-table-column prop="expiryDate" label="有效期至" min-width="110" />
        <el-table-column prop="remainingDays" label="剩余天数" min-width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.remainingDays <= 7, 'text-warning': row.remainingDays > 7 && row.remainingDays <= 15 }">
              {{ row.remainingDays }}天
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="alertLevel" label="预警等级" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :color="levelColorMap[row.alertLevel]" style="color: #fff; border: none">
              {{ levelTextMap[row.alertLevel] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" min-width="80" align="center" />
        <el-table-column prop="status" label="状态" min-width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
              {{ row.status === 1 ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="primary"
              link
              size="small"
              @click="openHandleDialog(row)"
            >
              处理
            </el-button>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="handleDialogVisible" title="处理预警" width="500px" destroy-on-close>
      <el-form :model="handleForm" label-width="80px">
        <el-form-item label="预警信息">
          <div class="handle-info">
            <p>物资：{{ currentAlert.materialName }}</p>
            <p>批次号：{{ currentAlert.batchNo }}</p>
            <p>剩余天数：{{ currentAlert.remainingDays }}天</p>
          </div>
        </el-form-item>
        <el-form-item label="处理备注" required>
          <el-input
            v-model="handleForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理备注"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="handleLoading" @click="submitHandle">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, AlarmClock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { expiryApi, warehouseApi, materialApi } from '@/api'

const levelColorMap = {
  yellow: '#E6A23C',
  orange: '#F89898',
  red: '#F56C6C'
}

const levelTextMap = {
  yellow: '黄色预警',
  orange: '橙色预警',
  red: '红色预警'
}

const loading = ref(false)
const checkLoading = ref(false)
const handleLoading = ref(false)
const alertList = ref([])
const total = ref(0)
const warehouseList = ref([])
const materialList = ref([])
const handleDialogVisible = ref(false)
const currentAlert = ref({})
const handleForm = reactive({ remark: '' })

const queryParams = reactive({
  warehouseId: undefined,
  materialId: undefined,
  alertLevel: undefined,
  status: undefined,
  page: 1,
  pageSize: 10
})

async function loadWarehouses() {
  try {
    const res = await warehouseApi.getAll()
    warehouseList.value = res.data || []
  } catch {
    warehouseList.value = []
  }
}

async function loadMaterials() {
  try {
    const res = await materialApi.getList({ pageSize: 9999, status: 1 })
    materialList.value = res.data?.records || res.data?.list || res.data || []
  } catch {
    materialList.value = []
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await expiryApi.getList(queryParams)
    alertList.value = res.data?.records || res.data?.list || []
    total.value = res.data?.total || 0
  } catch {
    alertList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  queryParams.warehouseId = undefined
  queryParams.materialId = undefined
  queryParams.alertLevel = undefined
  queryParams.status = undefined
  queryParams.page = 1
  loadData()
}

async function handleCheck() {
  try {
    await ElMessageBox.confirm('确定要手动检查效期预警吗？系统将重新计算所有库存的效期状态。', '手动检查', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    checkLoading.value = true
    await expiryApi.refreshWarnings()
    ElMessage.success('效期检查完成')
    loadData()
  } catch {
    // cancelled
  } finally {
    checkLoading.value = false
  }
}

function openHandleDialog(row) {
  currentAlert.value = row
  handleForm.remark = ''
  handleDialogVisible.value = true
}

async function submitHandle() {
  if (!handleForm.remark.trim()) {
    ElMessage.warning('请输入处理备注')
    return
  }
  handleLoading.value = true
  try {
    await expiryApi.handle(currentAlert.value.id, { remark: handleForm.remark })
    ElMessage.success('处理成功')
    handleDialogVisible.value = false
    loadData()
  } catch {
    // error handled by interceptor
  } finally {
    handleLoading.value = false
  }
}

onMounted(() => {
  loadWarehouses()
  loadMaterials()
  loadData()
})
</script>

<style scoped>
.expiry-page {
  height: 100%;
}

.filter-card :deep(.el-card__body) {
  padding-bottom: 0;
}

.text-danger {
  color: #F56C6C;
  font-weight: 600;
}

.text-warning {
  color: #E6A23C;
  font-weight: 600;
}

.text-muted {
  color: #c0c4cc;
}

.handle-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
