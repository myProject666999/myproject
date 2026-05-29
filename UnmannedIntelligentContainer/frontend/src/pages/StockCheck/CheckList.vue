<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">库存盘点</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">管理和处理库存盘点任务</p>
      </div>
      <el-button type="primary" @click="handleCreate" :icon="PlusCircle">
        新建盘点
      </el-button>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
      <el-form :inline="true" :model="filters" class="flex flex-wrap gap-4">
        <el-form-item label="货柜">
          <el-select
            v-model="filters.container_id"
            placeholder="请选择货柜"
            clearable
            class="w-48"
          >
            <el-option
              v-for="container in containerOptions"
              :key="container.id"
              :label="`${container.container_no} - ${container.name}`"
              :value="container.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="w-64"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filters.status"
            placeholder="请选择状态"
            clearable
            class="w-36"
          >
            <el-option label="待处理" :value="0" />
            <el-option label="已处理" :value="1" />
            <el-option label="已取消" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">
            查询
          </el-button>
          <el-button @click="handleReset" :icon="RotateCcw">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="check_no" label="盘点单号" min-width="140" />
        <el-table-column label="货柜" min-width="160">
          <template #default="{ row }">
            <div class="font-medium text-gray-900 dark:text-white">
              {{ row.container?.container_no }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ row.container?.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="补货员" min-width="120">
          <template #default="{ row }">
            {{ row.replenisher?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="check_time" label="盘点时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.check_time) }}
          </template>
        </el-table-column>
        <el-table-column label="数量统计" min-width="240">
          <template #default="{ row }">
            <div class="space-y-1">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">账面数量：</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ row.total_expected }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">实际数量：</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ row.total_actual }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">差异数量：</span>
                <span
                  :class="[
                    'font-medium',
                    row.total_difference > 0 ? 'text-green-600' :
                    row.total_difference < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                  ]"
                >
                  {{ row.total_difference > 0 ? '+' : '' }}{{ row.total_difference }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <StatusTag
              :status="getStatusConfig(row.status).type"
              :label="getStatusConfig(row.status).label"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              @click="handleProcess(row)"
            >
              处理差异
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          共 {{ total }} 条记录
        </span>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="createDialogVisible"
      title="新建盘点"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
        class="mt-4"
      >
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="货柜" prop="container_id">
            <el-select
              v-model="createForm.container_id"
              placeholder="请选择货柜"
              class="w-full"
              @change="handleContainerChange"
            >
              <el-option
                v-for="container in containerOptions"
                :key="container.id"
                :label="`${container.container_no} - ${container.name}`"
                :value="container.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="补货员" prop="replenisher_id">
            <el-select
              v-model="createForm.replenisher_id"
              placeholder="请选择补货员"
              class="w-full"
            >
              <el-option
                v-for="replenisher in replenisherOptions"
                :key="replenisher.id"
                :label="replenisher.name"
                :value="replenisher.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="盘点时间" prop="check_time">
          <el-date-picker
            v-model="createForm.check_time"
            type="datetime"
            placeholder="请选择盘点时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="盘点商品">
          <div class="w-full">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                共 {{ createForm.items.length }} 件商品
              </span>
              <el-button size="small" @click="handleAddProduct" :icon="Plus">
                添加商品
              </el-button>
            </div>
            <el-table :data="createForm.items" border size="small">
              <el-table-column label="商品" min-width="200">
                <template #default="{ row, $index }">
                  <el-select
                    v-model="row.product_id"
                    placeholder="请选择商品"
                    class="w-full"
                    @change="(val: number) => handleProductChange(val, $index)"
                  >
                    <el-option
                      v-for="product in productOptions"
                      :key="product.id"
                      :label="`${product.product_code} - ${product.name}`"
                      :value="product.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="账面数量" width="140">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.expected_quantity"
                    :min="0"
                    class="w-full"
                    controls-position="right"
                  />
                </template>
              </el-table-column>
              <el-table-column label="实际数量" width="140">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.actual_quantity"
                    :min="0"
                    class="w-full"
                    controls-position="right"
                  />
                </template>
              </el-table-column>
              <el-table-column label="差异" width="80">
                <template #default="{ row }">
                  <span
                    :class="[
                      'font-medium',
                      getDifference(row) > 0 ? 'text-green-600' :
                      getDifference(row) < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                    ]"
                  >
                    {{ getDifference(row) > 0 ? '+' : '' }}{{ getDifference(row) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="报损数量" width="120">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.damage_quantity"
                    :min="0"
                    class="w-full"
                    controls-position="right"
                  />
                </template>
              </el-table-column>
              <el-table-column label="报损原因" min-width="150">
                <template #default="{ row }">
                  <el-input
                    v-model="row.damage_reason"
                    placeholder="请输入原因"
                    maxlength="100"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    size="small"
                    @click="handleRemoveProduct($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate" :loading="submitting">
          提交
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="processDialogVisible"
      title="处理差异"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentCheck" class="space-y-4">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="盘点单号">
            {{ currentCheck.check_no }}
          </el-descriptions-item>
          <el-descriptions-item label="货柜">
            {{ currentCheck.container?.container_no }} - {{ currentCheck.container?.name }}
          </el-descriptions-item>
          <el-descriptions-item label="账面数量">
            {{ currentCheck.total_expected }}
          </el-descriptions-item>
          <el-descriptions-item label="实际数量">
            {{ currentCheck.total_actual }}
          </el-descriptions-item>
          <el-descriptions-item label="差异数量" :span="2">
            <span
              :class="[
                'font-medium',
                currentCheck.total_difference > 0 ? 'text-green-600' :
                currentCheck.total_difference < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
              ]"
            >
              {{ currentCheck.total_difference > 0 ? '+' : '' }}{{ currentCheck.total_difference }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="报损金额" :span="2">
            <span class="text-red-600 font-medium">
              {{ formatCurrency(currentCheck.damage_amount) }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
        <el-form label-width="100px">
          <el-form-item label="处理备注">
            <el-input
              v-model="processRemark"
              type="textarea"
              :rows="3"
              placeholder="请输入处理备注"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProcess" :loading="processing">
          确认处理
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      title="盘点详情"
      width="900px"
    >
      <div v-if="currentCheck" class="space-y-4">
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="盘点单号">
            {{ currentCheck.check_no }}
          </el-descriptions-item>
          <el-descriptions-item label="货柜">
            {{ currentCheck.container?.container_no }}
          </el-descriptions-item>
          <el-descriptions-item label="补货员">
            {{ currentCheck.replenisher?.name }}
          </el-descriptions-item>
          <el-descriptions-item label="盘点时间" :span="3">
            {{ formatDateTime(currentCheck.check_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="账面数量">
            {{ currentCheck.total_expected }}
          </el-descriptions-item>
          <el-descriptions-item label="实际数量">
            {{ currentCheck.total_actual }}
          </el-descriptions-item>
          <el-descriptions-item label="差异数量">
            <span
              :class="[
                'font-medium',
                currentCheck.total_difference > 0 ? 'text-green-600' :
                currentCheck.total_difference < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
              ]"
            >
              {{ currentCheck.total_difference > 0 ? '+' : '' }}{{ currentCheck.total_difference }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="报损金额">
            <span class="text-red-600 font-medium">
              {{ formatCurrency(currentCheck.damage_amount) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <StatusTag
              :status="getStatusConfig(currentCheck.status).type"
              :label="getStatusConfig(currentCheck.status).label"
            />
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="3">
            {{ currentCheck.remark || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">盘点明细</h4>
          <el-table :data="currentCheck.items || []" border size="small">
            <el-table-column label="商品" min-width="180">
              <template #default="{ row }">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ row.product?.product_code }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ row.product?.name }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="expected_quantity" label="账面数量" align="center" />
            <el-table-column prop="actual_quantity" label="实际数量" align="center" />
            <el-table-column label="差异" align="center">
              <template #default="{ row }">
                <span
                  :class="[
                    'font-medium',
                    row.difference > 0 ? 'text-green-600' :
                    row.difference < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                  ]"
                >
                  {{ row.difference > 0 ? '+' : '' }}{{ row.difference }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="damage_quantity" label="报损数量" align="center" />
            <el-table-column prop="damage_reason" label="报损原因" min-width="120" />
            <el-table-column label="差异金额" align="center">
              <template #default="{ row }">
                <span
                  :class="[
                    'font-medium',
                    row.difference_amount > 0 ? 'text-green-600' :
                    row.difference_amount < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                  ]"
                >
                  {{ formatCurrency(row.difference_amount) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { PlusCircle, Search, RotateCcw, Plus } from 'lucide-vue-next'
import StatusTag from '@/components/StatusTag.vue'
import { getStockCheckList, createStockCheck, processStockCheck } from '@/api/stockCheck'
import { getAllContainers } from '@/api/container'
import { getAllReplenishers } from '@/api/replenisher'
import { getInventoryList } from '@/api/inventory'
import { getProductList } from '@/api/product'
import { formatDateTime, formatCurrency } from '@/utils/format'
import type { StockCheck, StockCheckItemDTO, Container, Replenisher, Product, Inventory } from '@/types'

const loading = ref(false)
const submitting = ref(false)
const processing = ref(false)

const tableData = ref<StockCheck[]>([])
const total = ref(0)

const filters = reactive({
  container_id: undefined as number | undefined,
  start_date: undefined as string | undefined,
  end_date: undefined as string | undefined,
  status: undefined as number | undefined
})

const dateRange = ref<[string, string] | null>(null)

const pagination = reactive({
  page: 1,
  page_size: 10
})

const containerOptions = ref<Container[]>([])
const replenisherOptions = ref<Replenisher[]>([])
const productOptions = ref<Product[]>([])
const inventoryList = ref<Inventory[]>([])

const createDialogVisible = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  container_id: undefined as number | undefined,
  replenisher_id: undefined as number | undefined,
  check_time: '',
  remark: '',
  items: [] as StockCheckItemDTO[]
})

const createRules: FormRules = {
  container_id: [{ required: true, message: '请选择货柜', trigger: 'change' }],
  replenisher_id: [{ required: true, message: '请选择补货员', trigger: 'change' }],
  check_time: [{ required: true, message: '请选择盘点时间', trigger: 'change' }]
}

const processDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentCheck = ref<StockCheck | null>(null)
const processRemark = ref('')

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'default'

const statusMap: Record<number, { label: string; type: StatusType }> = {
  0: { label: '待处理', type: 'pending' },
  1: { label: '已处理', type: 'success' },
  2: { label: '已取消', type: 'cancelled' }
}

const getStatusConfig = (status: number) => {
  return statusMap[status] || { label: '未知', type: 'default' as StatusType }
}

const getDifference = (item: StockCheckItemDTO) => {
  const expected = item.expected_quantity || 0
  const actual = item.actual_quantity || 0
  return actual - expected
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      ...filters
    }
    const res = await getStockCheckList(params)
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取盘点列表失败')
  } finally {
    loading.value = false
  }
}

const fetchOptions = async () => {
  try {
    const [containers, replenishers, products] = await Promise.all([
      getAllContainers(),
      getAllReplenishers(),
      getProductList({ page_size: 1000 })
    ])
    containerOptions.value = containers
    replenisherOptions.value = replenishers
    productOptions.value = products.list
  } catch (error) {
    ElMessage.error('获取选项数据失败')
  }
}

const handleSearch = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    filters.start_date = dateRange.value[0]
    filters.end_date = dateRange.value[1]
  } else {
    filters.start_date = undefined
    filters.end_date = undefined
  }
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  filters.container_id = undefined
  filters.start_date = undefined
  filters.end_date = undefined
  filters.status = undefined
  dateRange.value = null
  pagination.page = 1
  fetchData()
}

const handleSizeChange = (size: number) => {
  pagination.page_size = size
  pagination.page = 1
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchData()
}

const handleCreate = () => {
  createForm.container_id = undefined
  createForm.replenisher_id = undefined
  createForm.check_time = ''
  createForm.remark = ''
  createForm.items = []
  inventoryList.value = []
  createDialogVisible.value = true
}

const handleContainerChange = async (containerId: number) => {
  createForm.items = []
  try {
    const res = await getInventoryList({ container_id: containerId, page_size: 1000 })
    inventoryList.value = res.list
    createForm.items = inventoryList.value.map(inv => ({
      product_id: inv.product_id,
      expected_quantity: inv.quantity,
      actual_quantity: inv.quantity,
      damage_quantity: 0,
      damage_reason: ''
    }))
  } catch (error) {
    ElMessage.error('获取货柜库存失败')
  }
}

const handleProductChange = (productId: number, index: number) => {
  const inventory = inventoryList.value.find(inv => inv.product_id === productId)
  if (inventory) {
    createForm.items[index].expected_quantity = inventory.quantity
    if (!createForm.items[index].actual_quantity) {
      createForm.items[index].actual_quantity = inventory.quantity
    }
  }
}

const handleAddProduct = () => {
  createForm.items.push({
    product_id: undefined as unknown as number,
    expected_quantity: 0,
    actual_quantity: 0,
    damage_quantity: 0,
    damage_reason: ''
  })
}

const handleRemoveProduct = (index: number) => {
  createForm.items.splice(index, 1)
}

const handleSubmitCreate = async () => {
  if (!createFormRef.value) return
  
  const valid = await createFormRef.value.validate().catch(() => false)
  if (!valid) return

  if (createForm.items.length === 0) {
    ElMessage.warning('请至少添加一件商品')
    return
  }

  const invalidItems = createForm.items.filter(item => !item.product_id)
  if (invalidItems.length > 0) {
    ElMessage.warning('请完善所有商品信息')
    return
  }

  submitting.value = true
  try {
    await createStockCheck({
      container_id: createForm.container_id!,
      replenisher_id: createForm.replenisher_id!,
      check_time: createForm.check_time,
      items: createForm.items,
      remark: createForm.remark
    })
    ElMessage.success('创建盘点成功')
    createDialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('创建盘点失败')
  } finally {
    submitting.value = false
  }
}

const handleView = (row: StockCheck) => {
  currentCheck.value = row
  detailDialogVisible.value = true
}

const handleProcess = (row: StockCheck) => {
  currentCheck.value = row
  processRemark.value = ''
  processDialogVisible.value = true
}

const handleSubmitProcess = async () => {
  if (!currentCheck.value) return

  processing.value = true
  try {
    await processStockCheck({
      check_id: currentCheck.value.id,
      remark: processRemark.value
    })
    ElMessage.success('处理成功')
    processDialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('处理失败')
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchOptions()
})
</script>
