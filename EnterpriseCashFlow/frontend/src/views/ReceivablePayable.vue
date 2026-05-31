<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatAmount, formatDate } from '../utils/format'
import { Plus, Edit2, Trash2, X, Search, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'

type TabType = 'receivable' | 'payable'

const activeTab = ref<TabType>('receivable')
const searchKeyword = ref('')
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentItem = ref<any>(null)

const formData = ref({
  id: 0,
  title: '',
  amount: 0,
  dueDate: '',
  status: 'pending',
  remark: ''
})

const receivableList = ref([
  { id: 1, title: 'ABC公司货款', amount: 25000000, dueDate: '2026-06-01', status: 'pending', createTime: '2026-05-01' },
  { id: 2, title: 'DEF项目回款', amount: 42000000, dueDate: '2026-06-03', status: 'pending', createTime: '2026-05-03' },
  { id: 3, title: 'GHI服务费', amount: 18000000, dueDate: '2026-05-28', status: 'completed', createTime: '2026-04-28' },
  { id: 4, title: 'JKL产品销售', amount: 35000000, dueDate: '2026-06-10', status: 'pending', createTime: '2026-05-10' },
  { id: 5, title: 'MNO咨询费', amount: 12000000, dueDate: '2026-05-25', status: 'overdue', createTime: '2026-04-25' }
])

const payableList = ref([
  { id: 1, title: '供应商X采购款', amount: 18500000, dueDate: '2026-06-02', status: 'pending', createTime: '2026-05-02' },
  { id: 2, title: 'Y公司原材料', amount: 28000000, dueDate: '2026-06-05', status: 'pending', createTime: '2026-05-05' },
  { id: 3, title: 'Z服务商费用', amount: 8500000, dueDate: '2026-05-30', status: 'completed', createTime: '2026-04-30' },
  { id: 4, title: '设备采购款', amount: 55000000, dueDate: '2026-06-15', status: 'pending', createTime: '2026-05-15' },
  { id: 5, title: '房租物业费', amount: 3200000, dueDate: '2026-06-01', status: 'pending', createTime: '2026-05-01' }
])

const currentList = computed(() => {
  const list = activeTab.value === 'receivable' ? receivableList.value : payableList.value
  if (!searchKeyword.value) return list
  return list.filter(item => item.title.includes(searchKeyword.value))
})

const totalAmount = computed(() => {
  return currentList.value.reduce((sum, item) => sum + item.amount, 0)
})

const statusMap: Record<string, { label: string; class: string }> = {
  pending: { label: '待处理', class: 'bg-warning-orange/10 text-warning-orange' },
  completed: { label: '已完成', class: 'bg-success-green/10 text-success-green' },
  overdue: { label: '已逾期', class: 'bg-warning-red/10 text-warning-red' }
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  currentItem.value = null
  formData.value = {
    id: 0,
    title: '',
    amount: 0,
    dueDate: '',
    status: 'pending',
    remark: ''
  }
  showDialog.value = true
}

const openEditDialog = (item: any) => {
  dialogMode.value = 'edit'
  currentItem.value = item
  formData.value = { ...item }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
}

const saveItem = () => {
  if (dialogMode.value === 'add') {
    const newItem = {
      ...formData.value,
      id: Date.now(),
      createTime: formatDate(new Date())
    }
    if (activeTab.value === 'receivable') {
      receivableList.value.unshift(newItem)
    } else {
      payableList.value.unshift(newItem)
    }
  } else {
    const list = activeTab.value === 'receivable' ? receivableList.value : payableList.value
    const index = list.findIndex(item => item.id === currentItem.value.id)
    if (index !== -1) {
      list[index] = { ...formData.value }
    }
  }
  closeDialog()
}

const deleteItem = (item: any) => {
  if (confirm('确定要删除这条记录吗？')) {
    const list = activeTab.value === 'receivable' ? receivableList.value : payableList.value
    const index = list.findIndex(i => i.id === item.id)
    if (index !== -1) {
      list.splice(index, 1)
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm">
      <div class="border-b border-gray-200">
        <div class="flex">
          <button
            @click="activeTab = 'receivable'"
            :class="[
              'flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'receivable'
                ? 'border-primary-blue text-primary-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            <ArrowUpRight class="w-4 h-4" />
            应收账款
          </button>
          <button
            @click="activeTab = 'payable'"
            :class="[
              'flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'payable'
                ? 'border-primary-blue text-primary-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            <ArrowDownRight class="w-4 h-4" />
            应付账款
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索名称..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue"
              />
            </div>
            <div class="text-sm text-gray-500">
              共 <span class="font-semibold text-gray-800">{{ currentList.length }}</span> 条记录，
              总计 <span class="font-semibold font-mono-numbers" :class="activeTab === 'receivable' ? 'text-success-green' : 'text-warning-red'">¥{{ formatAmount(totalAmount) }}</span>
            </div>
          </div>
          <button
            @click="openAddDialog"
            class="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            <Plus class="w-4 h-4" />
            新增{{ activeTab === 'receivable' ? '应收' : '应付' }}
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到期日</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in currentList" :key="item.id" class="hover:bg-gray-50">
                <td class="px-4 py-4">
                  <span class="font-medium text-gray-800">{{ item.title }}</span>
                </td>
                <td class="px-4 py-4">
                  <span
                    class="font-semibold font-mono-numbers"
                    :class="activeTab === 'receivable' ? 'text-success-green' : 'text-warning-red'"
                  >
                    ¥{{ formatAmount(item.amount) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-gray-600">{{ item.dueDate }}</td>
                <td class="px-4 py-4">
                  <span :class="['px-2 py-1 text-xs rounded-full', statusMap[item.status].class]">
                    {{ statusMap[item.status].label }}
                  </span>
                </td>
                <td class="px-4 py-4 text-gray-600">{{ item.createTime }}</td>
                <td class="px-4 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openEditDialog(item)"
                      class="p-2 text-gray-400 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-colors"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteItem(item)"
                      class="p-2 text-gray-400 hover:text-warning-red hover:bg-warning-red/10 rounded-lg transition-colors"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div
      v-if="showDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeDialog"
    >
      <div class="bg-white rounded-lg w-full max-w-md mx-4">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ dialogMode === 'add' ? '新增' : '编辑' }}{{ activeTab === 'receivable' ? '应收' : '应付' }}
          </h3>
          <button @click="closeDialog" class="p-1 text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue"
              placeholder="请输入名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">金额(元)</label>
            <input
              v-model.number="formData.amount"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue font-mono-numbers"
              placeholder="请输入金额"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">到期日</label>
            <input
              v-model="formData.dueDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              v-model="formData.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue"
            >
              <option value="pending">待处理</option>
              <option value="completed">已完成</option>
              <option value="overdue">已逾期</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              v-model="formData.remark"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue resize-none"
              placeholder="请输入备注"
            ></textarea>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            @click="closeDialog"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="saveItem"
            class="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
