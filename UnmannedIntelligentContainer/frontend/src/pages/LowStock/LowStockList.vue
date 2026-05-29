<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshCw, FileText, AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-vue-next'
import { getLowStockItems } from '@/api/inventory'
import { getAllContainers } from '@/api/container'
import { getProductCategories } from '@/api/product'
import { generateTasks } from '@/api/replenishment'
import type { LowStockItem, Container, ReplenishmentTask } from '@/types'

const loading = ref(false)
const lowStockItems = ref<LowStockItem[]>([])
const containers = ref<Container[]>([])
const categories = ref<string[]>([])
const selectedItems = ref<number[]>([])
const dialogVisible = ref(false)
const generatingTasks = ref(false)

const filterArea = ref('')
const filterContainer = ref<number | ''>('')
const filterCategory = ref('')
const searchKeyword = ref('')

const areaOptions = computed(() => {
  const areas = [...new Set(lowStockItems.value.map(item => item.area))]
  return areas.map(area => ({ label: area, value: area }))
})

const containerOptions = computed(() => {
  return containers.value.map(c => ({
    label: `${c.container_no} - ${c.name}`,
    value: c.id
  }))
})

const categoryOptions = computed(() => {
  return categories.value.map(cat => ({ label: cat, value: cat }))
})

const filteredItems = computed(() => {
  return lowStockItems.value.filter(item => {
    const matchKeyword = !searchKeyword.value ||
      item.container_name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.product_code.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchArea = !filterArea.value || item.area === filterArea.value
    const matchContainer = filterContainer.value === '' || item.container_id === filterContainer.value
    const matchCategory = !filterCategory.value || item.category === filterCategory.value
    return matchKeyword && matchArea && matchContainer && matchCategory
  })
})

const selectedItemDetails = computed(() => {
  return lowStockItems.value.filter(item => selectedItems.value.includes(item.id))
})

const totalNeedQuantity = computed(() => {
  return selectedItemDetails.value.reduce((sum, item) => sum + item.need_quantity, 0)
})

function getUrgencyLevel(item: LowStockItem) {
  const ratio = item.quantity / item.threshold
  if (ratio <= 0.2) return { level: 'critical', label: '紧急', color: 'red', icon: AlertOctagon }
  if (ratio <= 0.5) return { level: 'high', label: '高', color: 'orange', icon: AlertCircle }
  return { level: 'medium', label: '中', color: 'yellow', icon: AlertTriangle }
}

function getUrgencyTagType(level: string) {
  switch (level) {
    case 'critical': return 'danger'
    case 'high': return 'warning'
    case 'medium': return 'success'
    default: return 'info'
  }
}

function getStockPercentage(item: LowStockItem) {
  const percentage = (item.quantity / item.max_quantity) * 100
  return Math.max(0, Math.min(100, percentage))
}

function getProgressColor(item: LowStockItem) {
  const urgency = getUrgencyLevel(item)
  switch (urgency.level) {
    case 'critical': return '#ef4444'
    case 'high': return '#f97316'
    case 'medium': return '#eab308'
    default: return '#22c55e'
  }
}

function handleSelectionChange(selection: LowStockItem[]) {
  selectedItems.value = selection.map(item => item.id)
}

async function fetchData() {
  loading.value = true
  try {
    const [lowStockRes, containerRes, categoryRes] = await Promise.all([
      getLowStockItems(),
      getAllContainers(),
      getProductCategories()
    ])
    lowStockItems.value = (lowStockRes || []).map((item, index) => ({
      ...item,
      id: item.id || index + 1
    }))
    containers.value = containerRes || []
    categories.value = categoryRes || []
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleRefresh() {
  fetchData()
  selectedItems.value = []
  ElMessage.success('数据已刷新')
}

function handleGenerateTasks() {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要生成补货任务的商品')
    return
  }
  dialogVisible.value = true
}

async function confirmGenerateTasks() {
  generatingTasks.value = true
  try {
    const selectedAreas = [...new Set(selectedItemDetails.value.map(item => item.area))]
    const results: ReplenishmentTask[] = []

    for (const area of selectedAreas) {
      const res = await generateTasks({ area })
      if (res) {
        results.push(...res)
      }
    }

    ElMessage.success(`成功生成 ${results.length} 个补货任务`)
    dialogVisible.value = false
    selectedItems.value = []
    fetchData()
  } catch (error) {
    ElMessage.error('生成补货任务失败')
    console.error(error)
  } finally {
    generatingTasks.value = false
  }
}

function handleBatchSelectAll() {
  if (selectedItems.value.length === filteredItems.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = filteredItems.value.map(item => item.id)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">低库存预警</h1>
      <el-button type="primary" :icon="RefreshCw" @click="handleRefresh" :loading="loading">
        刷新数据
      </el-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">预警商品总数</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ lowStockItems.length }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <AlertCircle class="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">涉及集装箱数</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ new Set(lowStockItems.map(i => i.container_id)).size }}
            </p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertOctagon class="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">已选择补货</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedItems.length }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <el-card shadow="hover">
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span class="font-semibold text-gray-900 dark:text-white">低库存商品列表</span>
          <div class="flex flex-wrap items-center gap-3">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索集装箱/商品"
              :prefix-icon="Search"
              clearable
              class="w-56"
            />
            <el-select
              v-model="filterArea"
              placeholder="选择区域"
              clearable
              class="w-32"
            >
              <el-option
                v-for="option in areaOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-select
              v-model="filterContainer"
              placeholder="选择集装箱"
              clearable
              class="w-52"
            >
              <el-option
                v-for="option in containerOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-select
              v-model="filterCategory"
              placeholder="选择分类"
              clearable
              class="w-32"
            >
              <el-option
                v-for="option in categoryOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
        </div>
      </template>

      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <el-button
            :type="selectedItems.length === filteredItems.length && filteredItems.length > 0 ? 'primary' : 'default'"
            size="small"
            @click="handleBatchSelectAll"
          >
            {{ selectedItems.length === filteredItems.length && filteredItems.length > 0 ? '取消全选' : '全选当前页' }}
          </el-button>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            已选择 {{ selectedItems.length }} 项
          </span>
        </div>
        <el-button
          type="primary"
          :icon="FileText"
          :disabled="selectedItems.length === 0"
          @click="handleGenerateTasks"
        >
          生成补货任务
        </el-button>
      </div>

      <el-table
        :data="filteredItems"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" align="center" />

        <el-table-column label="紧急程度" width="100" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <component
                :is="getUrgencyLevel(row).icon"
                class="w-4 h-4"
                :style="{ color: getUrgencyLevel(row).color }"
              />
              <el-tag
                size="small"
                :type="getUrgencyTagType(getUrgencyLevel(row).level)"
                effect="light"
              >
                {{ getUrgencyLevel(row).label }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="container_no" label="集装箱编号" min-width="120" />
        <el-table-column prop="container_name" label="集装箱名称" min-width="150" />
        <el-table-column prop="area" label="区域" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.area }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="product_code" label="商品编码" min-width="120" />
        <el-table-column prop="product_name" label="商品名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.category }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="库存情况" min-width="200">
          <template #default="{ row }">
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500 dark:text-gray-400">当前库存</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ row.quantity }} / {{ row.max_quantity }}
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :style="{
                    width: `${getStockPercentage(row)}%`,
                    backgroundColor: getProgressColor(row)
                  }"
                ></div>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500 dark:text-gray-400">阈值: {{ row.threshold }}</span>
                <span class="text-red-500 font-medium">需补货: {{ row.need_quantity }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="当前库存" width="100" align="center">
          <template #default="{ row }">
            <span
              class="font-semibold"
              :class="{
                'text-red-600 dark:text-red-400': getUrgencyLevel(row).level === 'critical',
                'text-orange-600 dark:text-orange-400': getUrgencyLevel(row).level === 'high',
                'text-yellow-600 dark:text-yellow-400': getUrgencyLevel(row).level === 'medium'
              }"
            >
              {{ row.quantity }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="预警阈值" width="100" align="center">
          <template #default="{ row }">
            <span class="text-gray-600 dark:text-gray-300">{{ row.threshold }}</span>
          </template>
        </el-table-column>

        <el-table-column label="需补货量" width="100" align="center">
          <template #default="{ row }">
            <span class="font-semibold text-red-600 dark:text-red-400">{{ row.need_quantity }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="生成补货任务确认"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            您即将为以下选中的商品生成补货任务：
          </p>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">选中商品数</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ selectedItems.length }} 件</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">涉及集装箱</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ new Set(selectedItemDetails.map(i => i.container_id)).size }} 个
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">涉及区域</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ new Set(selectedItemDetails.map(i => i.area)).size }} 个
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">总补货数量</span>
            <span class="font-bold text-red-600 dark:text-red-400 text-lg">{{ totalNeedQuantity }}</span>
          </div>
        </div>

        <el-divider class="my-2" />

        <div class="max-h-60 overflow-auto">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选中商品明细：</h4>
          <div class="space-y-1">
            <div
              v-for="item in selectedItemDetails"
              :key="item.id"
              class="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span class="text-gray-600 dark:text-gray-300">
                {{ item.container_name }} - {{ item.product_name }}
              </span>
              <span class="font-medium text-red-500">+{{ item.need_quantity }}</span>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
          <p class="text-xs text-yellow-800 dark:text-yellow-300">
            ⚠️ 系统将按照区域自动分组生成补货任务，每个区域生成一个任务单。
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="generatingTasks"
            @click="confirmGenerateTasks"
          >
            确认生成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
