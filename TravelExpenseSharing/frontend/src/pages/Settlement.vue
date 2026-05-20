<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">一键结算</h2>
      <button class="btn-primary flex items-center space-x-2" @click="loadData">
        <Refresh class="w-5 h-5" :class="{ 'animate-spin': loading }" />
        <span>刷新数据</span>
      </button>
    </div>

    <div v-if="loading" class="space-y-6">
      <div class="card animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div class="space-y-4">
          <div v-for="i in 4" :key="i" class="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div class="card animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div class="space-y-4">
          <div v-for="i in 3" :key="i" class="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="card">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Grid class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800">欠款矩阵</h3>
            <p class="text-sm text-gray-500">表格中数值表示行用户欠列用户的金额</p>
          </div>
        </div>

        <div v-if="debtMatrix.users.length === 0" class="text-center py-8">
          <p class="text-gray-500">暂无数据</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="p-3 border-b-2 border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600 sticky left-0 z-10">
                  债务人 \ 债权人
                </th>
                <th 
                  v-for="user in debtMatrix.users" 
                  :key="'header-' + user.id"
                  class="p-3 border-b-2 border-gray-200 bg-gray-50 text-center text-sm font-semibold text-gray-600 min-w-[120px]"
                >
                  {{ user.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in debtMatrix.matrix" :key="'row-' + rowIndex">
                <td class="p-3 border-b border-gray-100 bg-gray-50 font-medium text-gray-700 sticky left-0 z-10">
                  {{ debtMatrix.users[rowIndex]?.name }}
                </td>
                <td 
                  v-for="(cell, colIndex) in row" 
                  :key="'cell-' + rowIndex + '-' + colIndex"
                  :class="[
                    'p-3 border-b border-gray-100 text-center transition-all duration-200',
                    rowIndex === colIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                  ]"
                >
                  <template v-if="rowIndex === colIndex">
                    <span class="text-gray-400">—</span>
                  </template>
                  <template v-else-if="cell > 0">
                    <span class="amount-negative">¥{{ cell.toFixed(2) }}</span>
                  </template>
                  <template v-else>
                    <span class="text-gray-300">¥0.00</span>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span class="text-sm text-gray-600">对角线（本人）</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-semibold text-danger">¥100.00</span>
              <span class="text-sm text-gray-600">= 欠款金额</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Money class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">最小转账方案</h3>
              <p class="text-sm text-gray-500">
                通过贪心算法计算，共需 
                <span class="font-bold text-primary">{{ transferPlan.totalTransfers }}</span> 
                笔转账
              </p>
            </div>
          </div>
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-100">
            <p class="text-sm text-green-700">
              <SortDown class="w-4 h-4 inline mr-1" />
              最优方案，已最小化转账次数
            </p>
          </div>
        </div>

        <div v-if="transferPlan.transfers.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CircleCheck class="w-8 h-8 text-green-600" />
          </div>
          <p class="text-gray-600 font-medium">所有账目已结清，无需转账！</p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="(transfer, index) in transferPlan.transfers" 
            :key="index"
            class="transfer-card"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {{ transfer.fromUserName.charAt(0) }}
                  </div>
                  <span class="text-sm font-medium text-gray-700 mt-1">{{ transfer.fromUserName }}</span>
                  <span class="text-xs text-danger">付款人</span>
                </div>
                
                <div class="flex flex-col items-center">
                  <div class="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    <ArrowRight class="w-6 h-6 text-primary animate-pulse" />
                    <span class="text-xl font-bold text-primary">¥{{ transfer.amount.toFixed(2) }}</span>
                    <ArrowRight class="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <span class="text-xs text-gray-400 mt-2">第 {{ index + 1 }} 笔转账</span>
                </div>
                
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {{ transfer.toUserName.charAt(0) }}
                  </div>
                  <span class="text-sm font-medium text-gray-700 mt-1">{{ transfer.toUserName }}</span>
                  <span class="text-xs text-success">收款人</span>
                </div>
              </div>
              
              <div class="text-right">
                <p class="text-lg font-bold text-gray-800">¥{{ transfer.amount.toFixed(2) }}</p>
                <p class="text-sm text-gray-500">
                  {{ transfer.fromUserName }} → {{ transfer.toUserName }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div class="flex items-start space-x-3">
            <InfoFilled class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 class="font-semibold text-blue-900 mb-1">算法说明</h4>
              <p class="text-sm text-blue-700">
                本系统使用贪心算法计算最小转账方案：首先计算每个人的净余额（应收-应付），
                然后每次将最大的债务人与最大的债权人进行匹配，直到所有余额为0。
                这种方法能够保证转账次数最少，时间复杂度为 O(n log n)。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <p class="text-blue-100 text-sm mb-2">账单总数</p>
          <p class="text-3xl font-bold">{{ totalBills }}</p>
        </div>
        <div class="card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <p class="text-green-100 text-sm mb-2">总金额</p>
          <p class="text-3xl font-bold">¥{{ totalAmount.toFixed(2) }}</p>
        </div>
        <div class="card bg-gradient-to-br from-orange-500 to-amber-600 text-white">
          <p class="text-orange-100 text-sm mb-2">参与人数</p>
          <p class="text-3xl font-bold">{{ debtMatrix.users.length }}</p>
        </div>
        <div class="card bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <p class="text-purple-100 text-sm mb-2">转账笔数</p>
          <p class="text-3xl font-bold">{{ transferPlan.totalTransfers }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  Grid, 
  Money, 
  ArrowRight, 
  CircleCheck, 
  InfoFilled,
  SortDown
} from '@element-plus/icons-vue'
import { settlementApi, billApi } from '../api'

const loading = ref(true)

const debtMatrix = reactive({
  users: [],
  matrix: []
})

const transferPlan = reactive({
  totalTransfers: 0,
  transfers: []
})

const totalBills = ref(0)
const totalAmount = ref(0)

const loadData = async () => {
  loading.value = true
  try {
    const [matrixData, planData, billsData] = await Promise.all([
      settlementApi.getDebtMatrix(),
      settlementApi.getTransferPlan(),
      billApi.getAll()
    ])
    
    debtMatrix.users = matrixData.users || []
    debtMatrix.matrix = matrixData.matrix || []
    
    transferPlan.totalTransfers = planData.totalTransfers || 0
    transferPlan.transfers = planData.transfers || []
    
    totalBills.value = billsData.length
    totalAmount.value = billsData.reduce((sum, bill) => sum + bill.amount, 0)
  } catch (error) {
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
