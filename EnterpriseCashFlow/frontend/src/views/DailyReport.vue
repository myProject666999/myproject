<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  FileText,
  Calendar,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-vue-next'
import { reportApi } from '../api'

const today = new Date().toISOString().slice(0, 10)
const selectedDate = ref(today)
const reportData = ref<any>(null)
const reportList = ref<any[]>([])
const isGenerating = ref(false)
const activeTab = ref<'view' | 'list'>('view')

const formatAmount = (fen: number) => {
  if (!fen && fen !== 0) return '-'
  const yuan = fen / 100
  return '¥' + yuan.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatAmountPlain = (fen: number) => {
  if (!fen && fen !== 0) return '0.00'
  const yuan = fen / 100
  return yuan.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadReport = async () => {
  try {
    const res = await reportApi.getDetail(selectedDate.value)
    reportData.value = res.data?.data
  } catch (e) {
    console.error('加载日报失败', e)
    loadMockReport()
  }
}

const loadMockReport = () => {
  reportData.value = {
    reportDate: selectedDate.value,
    openingBalance: 550000000,
    totalIncome: 85000000,
    totalExpense: 62000000,
    closingBalance: 573000000,
    incomeDetails: [
      { description: '华为技术有限公司 - Q2项目尾款', amount: 30000000, currency: 'CNY' },
      { description: '腾讯科技 - 云服务费', amount: 15000000, currency: 'CNY' },
      { description: 'Alibaba Group - 技术服务费', amount: 36250000, currency: 'USD', originalAmount: 5000000 }
    ],
    expenseDetails: [
      { description: '阿里云 - 服务器租赁费', amount: 8000000, currency: 'CNY' },
      { description: '员工薪资 - 6月份', amount: 35000000, currency: 'CNY' },
      { description: '中国移动 - 通信服务费', amount: 2500000, currency: 'CNY' },
      { description: '其他运营支出', amount: 16500000, currency: 'CNY' }
    ],
    warnings: ['预计6月20日资金将低于橙色预警线'],
    forecastNext30Days: {
      minBalance: 8000000,
      minBalanceDate: '2026-06-20',
      hasWarning: true
    }
  }
}

const loadReportList = async () => {
  try {
    const res = await reportApi.getList()
    reportList.value = res.data?.data || []
  } catch (e) {
    console.error('加载日报列表失败', e)
    reportList.value = [
      { reportDate: '2026-05-31', closingBalance: 573000000, totalIncome: 85000000, totalExpense: 62000000, hasWarning: true },
      { reportDate: '2026-05-30', closingBalance: 550000000, totalIncome: 32000000, totalExpense: 28000000, hasWarning: false },
      { reportDate: '2026-05-29', closingBalance: 546000000, totalIncome: 15000000, totalExpense: 12000000, hasWarning: false },
      { reportDate: '2026-05-28', closingBalance: 543000000, totalIncome: 45000000, totalExpense: 52000000, hasWarning: true },
      { reportDate: '2026-05-27', closingBalance: 550000000, totalIncome: 28000000, totalExpense: 18000000, hasWarning: false }
    ]
  }
}

const generateReport = async () => {
  isGenerating.value = true
  try {
    await fetch(`/api/daily-reports/generate?date=${selectedDate.value}`, { method: 'POST' })
    await loadReport()
  } catch (e) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    loadMockReport()
  } finally {
    isGenerating.value = false
  }
}

const exportReport = async () => {
  try {
    await reportApi.export(selectedDate.value)
    alert('日报已导出为PDF')
  } catch (e) {
    alert('导出功能演示：日报已导出为PDF')
  }
}

const changeDate = (days: number) => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + days)
  selectedDate.value = date.toISOString().slice(0, 10)
  loadReport()
}

const netFlow = computed(() => {
  if (!reportData.value) return 0
  return reportData.value.totalIncome - reportData.value.totalExpense
})

onMounted(() => {
  loadReport()
  loadReportList()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">资金日报</h1>
        <p class="text-gray-500 mt-1">每日资金收支汇总与预警提示</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="generateReport"
          :disabled="isGenerating"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" />
          生成日报
        </button>
        <button
          @click="exportReport"
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          <Download class="w-4 h-4" />
          导出PDF
        </button>
      </div>
    </div>

    <div class="flex gap-4 border-b border-gray-200">
      <button
        v-for="tab in [{ key: 'view', label: '查看日报' }, { key: 'list', label: '历史日报' }]"
        :key="tab.key"
        @click="activeTab = tab.key as any"
        :class="[
          'px-4 py-3 border-b-2 font-medium transition',
          activeTab === tab.key
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'view'">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <button
              @click="changeDate(-1)"
              class="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft class="w-5 h-5 text-gray-600" />
            </button>
            <div class="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <Calendar class="w-5 h-5 text-gray-500" />
              <input
                v-model="selectedDate"
                type="date"
                class="bg-transparent border-none focus:ring-0 text-gray-800 font-medium"
                @change="loadReport"
              />
            </div>
            <button
              @click="changeDate(1)"
              class="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight class="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <span class="text-sm text-gray-500">
            生成时间: {{ new Date().toLocaleString('zh-CN') }}
          </span>
        </div>

        <div v-if="reportData" class="space-y-6">
          <div class="text-center py-4 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-800">
              {{ reportData.reportDate }} 资金日报
            </h2>
          </div>

          <div class="grid grid-cols-4 gap-6">
            <div class="text-center p-4 bg-gray-50 rounded-xl">
              <p class="text-sm text-gray-500 mb-1">期初余额</p>
              <p class="text-2xl font-bold text-gray-800 font-mono">
                {{ formatAmount(reportData.openingBalance) }}
              </p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-xl">
              <p class="text-sm text-gray-500 mb-1">今日收入</p>
              <p class="text-2xl font-bold text-green-600 font-mono">
                {{ formatAmount(reportData.totalIncome) }}
              </p>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-xl">
              <p class="text-sm text-gray-500 mb-1">今日支出</p>
              <p class="text-2xl font-bold text-red-600 font-mono">
                {{ formatAmount(reportData.totalExpense) }}
              </p>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-xl">
              <p class="text-sm text-gray-500 mb-1">期末余额</p>
              <p class="text-2xl font-bold text-blue-600 font-mono">
                {{ formatAmount(reportData.closingBalance) }}
              </p>
            </div>
          </div>

          <div class="text-center py-2">
            <span
              :class="[
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                netFlow >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              ]"
            >
              <component :is="netFlow >= 0 ? TrendingUp : TrendingDown" class="w-5 h-5" />
              今日净流入: {{ netFlow >= 0 ? '+' : '' }}{{ formatAmount(netFlow) }}
            </span>
          </div>

          <div v-if="reportData.warnings?.length > 0" class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div class="flex items-start gap-3">
              <AlertTriangle class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-medium text-amber-800 mb-1">预警提示</p>
                <ul class="text-sm text-amber-700 space-y-1">
                  <li v-for="(w, i) in reportData.warnings" :key="i">{{ w }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp class="w-5 h-5 text-green-500" />
                收入明细
              </h3>
              <div class="border border-gray-200 rounded-xl overflow-hidden">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-gray-600 font-medium">项目</th>
                      <th class="px-4 py-2 text-right text-gray-600 font-medium">金额</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="(item, i) in reportData.incomeDetails" :key="i">
                      <td class="px-4 py-3 text-gray-700">{{ item.description }}</td>
                      <td class="px-4 py-3 text-right text-green-600 font-medium font-mono">
                        +{{ formatAmountPlain(item.amount) }}
                      </td>
                    </tr>
                    <tr class="bg-gray-50 font-semibold">
                      <td class="px-4 py-3">合计</td>
                      <td class="px-4 py-3 text-right text-green-600 font-mono">
                        +{{ formatAmountPlain(reportData.totalIncome) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingDown class="w-5 h-5 text-red-500" />
                支出明细
              </h3>
              <div class="border border-gray-200 rounded-xl overflow-hidden">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-gray-600 font-medium">项目</th>
                      <th class="px-4 py-2 text-right text-gray-600 font-medium">金额</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="(item, i) in reportData.expenseDetails" :key="i">
                      <td class="px-4 py-3 text-gray-700">{{ item.description }}</td>
                      <td class="px-4 py-3 text-right text-red-600 font-medium font-mono">
                        -{{ formatAmountPlain(item.amount) }}
                      </td>
                    </tr>
                    <tr class="bg-gray-50 font-semibold">
                      <td class="px-4 py-3">合计</td>
                      <td class="px-4 py-3 text-right text-red-600 font-mono">
                        -{{ formatAmountPlain(reportData.totalExpense) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div v-if="reportData.forecastNext30Days" class="p-4 bg-blue-50 rounded-xl">
            <h4 class="font-medium text-blue-800 mb-2">未来30天预测</h4>
            <p class="text-sm text-blue-700">
              预计最低余额 <span class="font-semibold">{{ formatAmount(reportData.forecastNext30Days.minBalance) }}</span>
              （{{ reportData.forecastNext30Days.minBalanceDate }}）
              <span v-if="reportData.forecastNext30Days.hasWarning" class="text-amber-600 ml-2">⚠ 存在资金缺口风险</span>
            </p>
          </div>

          <div class="flex justify-end gap-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
            <span>制单人: 系统自动生成</span>
            <span>审核人: ____________</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'list'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">期初余额</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">收入</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">支出</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">期末余额</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in reportList" :key="r.reportDate" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-800">{{ r.reportDate }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 font-mono">{{ formatAmount(r.openingBalance || r.closingBalance - r.totalIncome + r.totalExpense) }}</td>
            <td class="px-6 py-4 text-sm text-green-600 font-mono">+{{ formatAmountPlain(r.totalIncome) }}</td>
            <td class="px-6 py-4 text-sm text-red-600 font-mono">-{{ formatAmountPlain(r.totalExpense) }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-800 font-mono">{{ formatAmount(r.closingBalance) }}</td>
            <td class="px-6 py-4">
              <span
                v-if="r.hasWarning"
                class="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded"
              >
                有预警
              </span>
              <span v-else class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                正常
              </span>
            </td>
            <td class="px-6 py-4">
              <button
                @click="selectedDate = r.reportDate; activeTab = 'view'; loadReport()"
                class="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <FileText class="w-4 h-4" />
                查看
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
