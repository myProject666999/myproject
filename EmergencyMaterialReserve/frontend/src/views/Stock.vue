<template>
  <div class="stock-page">
    <el-tabs v-model="activeTab" class="stock-tabs">
      <el-tab-pane label="入库登记" name="in">
        <el-form
          ref="inFormRef"
          :model="inForm"
          :rules="inRules"
          label-width="100px"
          class="stock-form"
        >
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="仓库" prop="warehouseId">
                <el-select v-model="inForm.warehouseId" placeholder="请选择仓库" style="width: 100%">
                  <el-option
                    v-for="w in warehouseList"
                    :key="w.id"
                    :label="w.name"
                    :value="w.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="物资" prop="materialId">
                <el-select v-model="inForm.materialId" placeholder="请选择物资" style="width: 100%" filterable>
                  <el-option
                    v-for="m in materialList"
                    :key="m.id"
                    :label="m.name"
                    :value="m.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="批次号" prop="batchNo">
                <el-input v-model="inForm.batchNo" placeholder="请输入批次号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="数量" prop="quantity">
                <el-input-number v-model="inForm.quantity" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单价" prop="unitPrice">
                <el-input-number v-model="inForm.unitPrice" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="业务类型" prop="bizType">
                <el-select v-model="inForm.bizType" placeholder="请选择业务类型" style="width: 100%">
                  <el-option label="采购" value="purchase" />
                  <el-option label="调拨入" value="transfer_in" />
                  <el-option label="归还" value="return" />
                  <el-option label="调整" value="adjustment" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="生产日期" prop="productionDate">
                <el-date-picker
                  v-model="inForm.productionDate"
                  type="date"
                  placeholder="请选择生产日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="有效期至" prop="expiryDate">
                <el-date-picker
                  v-model="inForm.expiryDate"
                  type="date"
                  placeholder="请选择有效期至"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="inForm.remark" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="handleStockIn" :loading="inLoading">提交入库</el-button>
            <el-button @click="resetInForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="出库登记" name="out">
        <el-form
          ref="outFormRef"
          :model="outForm"
          :rules="outRules"
          label-width="100px"
          class="stock-form"
        >
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="仓库" prop="warehouseId">
                <el-select v-model="outForm.warehouseId" placeholder="请选择仓库" style="width: 100%">
                  <el-option
                    v-for="w in warehouseList"
                    :key="w.id"
                    :label="w.name"
                    :value="w.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="物资" prop="materialId">
                <el-select v-model="outForm.materialId" placeholder="请选择物资" style="width: 100%" filterable>
                  <el-option
                    v-for="m in materialList"
                    :key="m.id"
                    :label="m.name"
                    :value="m.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="数量" prop="quantity">
                <el-input-number v-model="outForm.quantity" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="业务类型" prop="bizType">
                <el-select v-model="outForm.bizType" placeholder="请选择业务类型" style="width: 100%">
                  <el-option label="调拨出" value="transfer_out" />
                  <el-option label="调拨" value="allocation" />
                  <el-option label="报废" value="scrap" />
                  <el-option label="调整" value="adjustment" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="outForm.remark" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="handleStockOut" :loading="outLoading">提交出库</el-button>
            <el-button @click="resetOutForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <el-card class="record-card">
      <template #header>
        <span>出入库记录</span>
      </template>
      <el-table :data="records" v-loading="tableLoading" stripe border style="width: 100%">
        <el-table-column prop="docNo" label="单据号" width="180" />
        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'in' ? 'success' : 'danger'" size="small">
              {{ row.type === 'in' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bizType" label="业务类型" width="100">
          <template #default="{ row }">
            {{ bizTypeMap[row.bizType] || row.bizType }}
          </template>
        </el-table-column>
        <el-table-column prop="warehouseName" label="仓库" width="120" />
        <el-table-column prop="materialName" label="物资" min-width="120" />
        <el-table-column prop="batchNo" label="批次号" width="160" />
        <el-table-column prop="quantity" label="数量" width="80" align="right" />
        <el-table-column prop="beforeQuantity" label="操作前数量" width="110" align="right" />
        <el-table-column prop="afterQuantity" label="操作后数量" width="110" align="right" />
        <el-table-column prop="operatorName" label="操作人" width="100" />
        <el-table-column prop="createdAt" label="操作时间" width="180" />
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadRecords"
          @current-change="loadRecords"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { stockApi, warehouseApi, materialApi } from '@/api'

const activeTab = ref('in')
const inFormRef = ref(null)
const outFormRef = ref(null)
const inLoading = ref(false)
const outLoading = ref(false)
const tableLoading = ref(false)

const warehouseList = ref([])
const materialList = ref([])
const records = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const bizTypeMap = {
  purchase: '采购',
  transfer_in: '调拨入',
  return: '归还',
  adjustment: '调整',
  transfer_out: '调拨出',
  allocation: '调拨',
  scrap: '报废'
}

const inForm = reactive({
  warehouseId: null,
  materialId: null,
  batchNo: '',
  quantity: 1,
  unitPrice: 0,
  productionDate: '',
  expiryDate: '',
  bizType: '',
  remark: ''
})

const outForm = reactive({
  warehouseId: null,
  materialId: null,
  quantity: 1,
  bizType: '',
  remark: ''
})

const inRules = {
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  materialId: [{ required: true, message: '请选择物资', trigger: 'change' }],
  batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  bizType: [{ required: true, message: '请选择业务类型', trigger: 'change' }]
}

const outRules = {
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  materialId: [{ required: true, message: '请选择物资', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  bizType: [{ required: true, message: '请选择业务类型', trigger: 'change' }]
}

async function loadWarehouseList() {
  try {
    const res = await warehouseApi.getAll()
    warehouseList.value = res.data || res || []
  } catch {
    warehouseList.value = []
  }
}

async function loadMaterialList() {
  try {
    const res = await materialApi.getList({ pageSize: 1000 })
    materialList.value = res.data?.list || res.data || res.list || []
  } catch {
    materialList.value = []
  }
}

async function loadRecords() {
  tableLoading.value = true
  try {
    const res = await stockApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    const data = res.data || res
    records.value = data.list || data.records || []
    pagination.total = data.total || 0
  } catch {
    records.value = []
  } finally {
    tableLoading.value = false
  }
}

function resetInForm() {
  inFormRef.value?.resetFields()
}

function resetOutForm() {
  outFormRef.value?.resetFields()
}

async function handleStockIn() {
  const valid = await inFormRef.value?.validate().catch(() => false)
  if (!valid) return

  inLoading.value = true
  try {
    await stockApi.stockIn({ ...inForm })
    ElMessage.success('入库成功')
    resetInForm()
    loadRecords()
  } catch {
    // error handled by interceptor
  } finally {
    inLoading.value = false
  }
}

async function handleStockOut() {
  const valid = await outFormRef.value?.validate().catch(() => false)
  if (!valid) return

  outLoading.value = true
  try {
    await stockApi.stockOut({ ...outForm })
    ElMessage.success('出库成功')
    resetOutForm()
    loadRecords()
  } catch {
    // error handled by interceptor
  } finally {
    outLoading.value = false
  }
}

onMounted(() => {
  loadWarehouseList()
  loadMaterialList()
  loadRecords()
})
</script>

<style scoped>
.stock-page {
  padding: 0;
}

.stock-tabs {
  background: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.stock-form {
  margin-top: 16px;
}

.record-card {
  border-radius: 4px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
