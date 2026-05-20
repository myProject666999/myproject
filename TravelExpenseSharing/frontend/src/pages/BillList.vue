<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">账单列表</h2>
      <button class="btn-primary flex items-center space-x-2" @click="openAddDialog">
        <Plus class="w-5 h-5" />
        <span>添加账单</span>
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card animate-pulse">
        <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>

    <div v-else-if="bills.length === 0" class="card text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Document class="w-8 h-8 text-gray-400" />
      </div>
      <p class="text-gray-500 mb-4">暂无账单记录</p>
      <button class="btn-primary" @click="openAddDialog">
        添加第一条账单
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="bill in bills" 
        :key="bill.id" 
        class="card group cursor-pointer"
        @click="openEditDialog(bill)"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ bill.title }}</h3>
            <p class="text-sm text-gray-500 flex items-center">
              <Calendar class="w-4 h-4 mr-1" />
              {{ bill.billDate }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-primary">¥{{ bill.amount.toFixed(2) }}</p>
            <p class="text-sm text-gray-500">支付人: {{ bill.payerName }}</p>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <p class="text-sm text-gray-600 mb-2">参与人及分摊:</p>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="split in bill.splits" 
              :key="split.participantId"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
            >
              {{ split.participantName }} ¥{{ split.splitAmount.toFixed(2) }}
            </span>
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            @click.stop="openEditDialog(bill)"
          >
            <Edit class="w-4 h-4" />
          </button>
          <button 
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            @click.stop="handleDelete(bill)"
          >
            <Delete class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑账单' : '添加账单'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
        <el-form-item label="账单标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入账单标题" />
        </el-form-item>
        
        <el-form-item label="金额" prop="amount">
          <el-input-number 
            v-model="form.amount" 
            :min="0.01" 
            :precision="2"
            placeholder="请输入金额"
            style="width: 100%"
            @change="calculateSplitAmounts"
          />
        </el-form-item>
        
        <el-form-item label="支付人" prop="payerId">
          <el-select v-model="form.payerId" placeholder="请选择支付人" style="width: 100%">
            <el-option 
              v-for="user in users" 
              :key="user.id" 
              :label="user.name" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="账单日期" prop="billDate">
          <el-date-picker 
            v-model="form.billDate" 
            type="date" 
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="参与人">
          <el-checkbox-group v-model="selectedParticipants" @change="onParticipantsChange">
            <el-checkbox 
              v-for="user in users" 
              :key="user.id" 
              :label="user.id"
              :border="true"
            >
              {{ user.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item 
          v-for="(split, index) in form.splits" 
          :key="split.participantId"
          :label="getUserName(split.participantId)"
        >
          <div class="flex items-center space-x-4">
            <el-input-number 
              v-model="split.splitRatio" 
              :min="0" 
              :max="100" 
              :precision="2"
              @change="onRatioChange(index)"
            />
            <span class="text-gray-500">%</span>
            <span class="text-gray-500">=</span>
            <span class="text-primary font-semibold">¥{{ split.splitAmount.toFixed(2) }}</span>
          </div>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="2"
            placeholder="可选"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '保存修改' : '添加账单' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document, Calendar, Edit, Delete } from '@element-plus/icons-vue'
import { billApi, userApi } from '../api'

const loading = ref(true)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)
const selectedParticipants = ref([])

const bills = ref([])
const users = ref([])

const form = reactive({
  title: '',
  amount: null,
  payerId: null,
  billDate: '',
  remark: '',
  splits: []
})

const rules = {
  title: [{ required: true, message: '请输入账单标题', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  payerId: [{ required: true, message: '请选择支付人', trigger: 'change' }],
  billDate: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const [billsData, usersData] = await Promise.all([
      billApi.getAll(),
      userApi.getAll()
    ])
    bills.value = billsData
    users.value = usersData
  } catch (error) {
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : ''
}

const calculateSplitAmounts = () => {
  if (!form.amount || form.amount <= 0) return
  form.splits.forEach(split => {
    split.splitAmount = form.amount * (split.splitRatio / 100)
  })
}

const onRatioChange = (index) => {
  calculateSplitAmounts()
}

const onParticipantsChange = () => {
  const existingSplits = form.splits.filter(s => 
    selectedParticipants.value.includes(s.participantId)
  )
  const existingIds = existingSplits.map(s => s.participantId)
  
  selectedParticipants.value.forEach(userId => {
    if (!existingIds.includes(userId)) {
      existingSplits.push({
        participantId: userId,
        splitRatio: 0,
        splitAmount: 0
      })
    }
  })
  
  form.splits = existingSplits
  averageSplit()
}

const averageSplit = () => {
  if (form.splits.length === 0) return
  const ratio = Number((100 / form.splits.length).toFixed(2))
  let remaining = Number((100 - ratio * (form.splits.length - 1)).toFixed(2))
  
  form.splits.forEach((split, index) => {
    split.splitRatio = index === form.splits.length - 1 ? remaining : ratio
  })
  calculateSplitAmounts()
}

const openAddDialog = () => {
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (bill) => {
  isEdit.value = true
  editId.value = bill.id
  form.title = bill.title
  form.amount = bill.amount
  form.payerId = bill.payerId
  form.billDate = bill.billDate
  form.remark = bill.remark || ''
  form.splits = bill.splits.map(s => ({
    participantId: s.participantId,
    splitRatio: s.splitRatio,
    splitAmount: s.splitAmount
  }))
  selectedParticipants.value = bill.splits.map(s => s.participantId)
  dialogVisible.value = true
}

const resetForm = () => {
  form.title = ''
  form.amount = null
  form.payerId = null
  form.billDate = new Date().toISOString().split('T')[0]
  form.remark = ''
  form.splits = []
  selectedParticipants.value = []
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const validateForm = () => {
  if (selectedParticipants.value.length === 0) {
    ElMessage.warning('请至少选择一个参与人')
    return false
  }
  
  const totalRatio = form.splits.reduce((sum, s) => sum + Number(s.splitRatio), 0)
  if (Math.abs(totalRatio - 100) > 0.01) {
    ElMessage.warning(`分摊比例总和必须为100%，当前为${totalRatio.toFixed(2)}%`)
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (!validateForm()) return
    
    submitting.value = true
    
    if (isEdit.value) {
      await billApi.update(editId.value, form)
      ElMessage.success('账单更新成功')
    } else {
      await billApi.create(form)
      ElMessage.success('账单添加成功')
    }
    
    dialogVisible.value = false
    loadData()
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (bill) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除账单"${bill.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await billApi.delete(bill.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>
