<template>
  <div class="inventory-page">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="批次库存" name="batch">
        <div class="filter-bar">
          <el-select v-model="batchQuery.warehouseId" placeholder="选择仓库" clearable style="width: 180px">
            <el-option v-for="w in warehouseList" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
          <el-select v-model="batchQuery.materialId" placeholder="选择物资" clearable filterable style="width: 200px">
            <el-option v-for="m in materialList" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
          <el-input v-model="batchQuery.batchNo" placeholder="批次号" clearable style="width: 180px" />
          <el-button type="primary" @click="loadBatchList">查询</el-button>
          <el-button @click="resetBatchQuery">重置</el-button>
        </div>
        <el-table :data="batchList" border stripe v-loading="batchLoading" style="width: 100%">
          <el-table-column prop="warehouseName" label="仓库名称" min-width="120" />
          <el-table-column prop="materialName" label="物资名称" min-width="120" />
          <el-table-column prop="batchNo" label="批次号" min-width="130" />
          <el-table-column prop="quantity" label="库存数量" width="100" align="right" />
          <el-table-column prop="lockedQuantity" label="锁定数量" width="100" align="right" />
          <el-table-column prop="availableQuantity" label="可用数量" width="100" align="right" />
          <el-table-column prop="unitPrice" label="单价（元）" width="110" align="right">
            <template #default="{ row }">
              {{ row.unitPrice != null ? Number(row.unitPrice).toFixed(2) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="productionDate" label="生产日期" width="110" />
          <el-table-column prop="expiryDate" label="有效期至" width="110" />
          <el-table-column prop="expiryWarningLevel" label="效期预警" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.expiryWarningLevel === 'red'" type="danger" size="small">红色</el-tag>
              <el-tag v-else-if="row.expiryWarningLevel === 'orange'" color="#E6A23C" style="color:#fff;border:none" size="small">橙色</el-tag>
              <el-tag v-else-if="row.expiryWarningLevel === 'yellow'" type="warning" size="small">黄色</el-tag>
              <el-tag v-else type="info" size="small">正常</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                {{ row.status === 1 ? '正常' : '冻结' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="batchQuery.page"
          v-model:page-size="batchQuery.pageSize"
          :total="batchTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          class="pagination"
          @change="loadBatchList"
        />
      </el-tab-pane>

      <el-tab-pane label="库存汇总" name="summary">
        <div class="filter-bar">
          <el-select v-model="summaryQuery.warehouseId" placeholder="选择仓库" clearable style="width: 180px">
            <el-option v-for="w in warehouseList" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
          <el-select v-model="summaryQuery.materialId" placeholder="选择物资" clearable filterable style="width: 200px">
            <el-option v-for="m in materialList" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
          <el-select v-model="summaryQuery.isBelowWarning" placeholder="是否低于预警线" clearable style="width: 160px">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
          <el-button type="primary" @click="loadSummaryList">查询</el-button>
          <el-button @click="resetSummaryQuery">重置</el-button>
        </div>
        <el-table :data="summaryList" border stripe v-loading="summaryLoading" style="width: 100%">
          <el-table-column prop="warehouseName" label="仓库名称" min-width="120" />
          <el-table-column prop="materialName" label="物资名称" min-width="120" />
          <el-table-column prop="totalQuantity" label="总库存" width="100" align="right" />
          <el-table-column prop="lockedQuantity" label="锁定数量" width="100" align="right" />
          <el-table-column prop="availableQuantity" label="可用数量" width="100" align="right" />
          <el-table-column prop="warningStock" label="预警库存" width="100" align="right" />
          <el-table-column prop="isBelowWarning" label="低于预警线" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isBelowWarning === 1 ? 'danger' : 'success'" size="small">
                {{ row.isBelowWarning === 1 ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="summaryQuery.page"
          v-model:page-size="summaryQuery.pageSize"
          :total="summaryTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          class="pagination"
          @change="loadSummaryList"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { inventoryApi, warehouseApi, materialApi } from '@/api'

const activeTab = ref('batch')
const warehouseList = ref([])
const materialList = ref([])

const batchLoading = ref(false)
const batchList = ref([])
const batchTotal = ref(0)
const batchQuery = reactive({
  warehouseId: '',
  materialId: '',
  batchNo: '',
  page: 1,
  pageSize: 10
})

const summaryLoading = ref(false)
const summaryList = ref([])
const summaryTotal = ref(0)
const summaryQuery = reactive({
  warehouseId: '',
  materialId: '',
  isBelowWarning: '',
  page: 1,
  pageSize: 10
})

async function loadOptions() {
  try {
    const [warehouseRes, materialRes] = await Promise.all([
      warehouseApi.getAll(),
      materialApi.getList({ pageSize: 9999 })
    ])
    warehouseList.value = warehouseRes.data?.list || warehouseRes.data || warehouseRes.list || warehouseRes || []
    const mData = materialRes.data?.list || materialRes.data || materialRes.list || materialRes || []
    materialList.value = Array.isArray(mData) ? mData : []
  } catch (e) {
    console.error('加载选项失败', e)
  }
}

async function loadBatchList() {
  batchLoading.value = true
  try {
    const params = { ...batchQuery }
    if (!params.warehouseId) delete params.warehouseId
    if (!params.materialId) delete params.materialId
    if (!params.batchNo) delete params.batchNo
    const res = await inventoryApi.getList(params)
    const data = res.data || res
    batchList.value = data.list || data.records || []
    batchTotal.value = data.total || 0
  } catch (e) {
    console.error('加载批次库存失败', e)
  } finally {
    batchLoading.value = false
  }
}

function resetBatchQuery() {
  batchQuery.warehouseId = ''
  batchQuery.materialId = ''
  batchQuery.batchNo = ''
  batchQuery.page = 1
  loadBatchList()
}

async function loadSummaryList() {
  summaryLoading.value = true
  try {
    const params = { ...summaryQuery }
    if (!params.warehouseId) delete params.warehouseId
    if (!params.materialId) delete params.materialId
    if (params.isBelowWarning === '' || params.isBelowWarning === null || params.isBelowWarning === undefined) {
      delete params.isBelowWarning
    }
    const res = await inventoryApi.getSummary(params)
    const data = res.data || res
    summaryList.value = data.list || data.records || []
    summaryTotal.value = data.total || 0
  } catch (e) {
    console.error('加载库存汇总失败', e)
  } finally {
    summaryLoading.value = false
  }
}

function resetSummaryQuery() {
  summaryQuery.warehouseId = ''
  summaryQuery.materialId = ''
  summaryQuery.isBelowWarning = ''
  summaryQuery.page = 1
  loadSummaryList()
}

onMounted(() => {
  loadOptions()
  loadBatchList()
  loadSummaryList()
})
</script>

<style scoped>
.inventory-page {
  background: #fff;
  border-radius: 4px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
