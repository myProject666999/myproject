<template>
  <div>
    <div class="page-header">
      <div class="page-title">会员卡管理</div>
      <el-button type="primary" @click="handlePurchase">
        <el-icon><Plus /></el-icon>
        购卡
      </el-button>
    </div>

    <div class="search-form">
      <el-input v-model="searchForm.keyword" placeholder="会员姓名/手机号" style="width: 200px;" clearable></el-input>
      <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px;" clearable>
        <el-option label="正常" :value="1"></el-option>
        <el-option label="已过期" :value="2"></el-option>
        <el-option label="已冻结" :value="3"></el-option>
      </el-select>
      <el-button type="primary" @click="loadData">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="cardNo" label="会员卡号" width="180"></el-table-column>
        <el-table-column prop="userName" label="会员"></el-table-column>
        <el-table-column prop="cardTypeName" label="卡类型"></el-table-column>
        <el-table-column label="有效期">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }} ~ {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column label="剩余次数">
          <template #default="{ row }">
            {{ row.remainingTimes !== null ? row.remainingTimes : '无限' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleRenew(row)">续卡</el-button>
            <el-button 
              :type="row.status === 1 ? 'danger' : 'success'" 
              size="small" 
              link 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '冻结' : '解冻' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <el-dialog v-model="purchaseDialogVisible" title="购卡" width="500px">
      <el-form :model="purchaseForm" :rules="purchaseRules" ref="purchaseFormRef" label-width="80px" class="form-dialog">
        <el-form-item label="会员" prop="userId">
          <el-select v-model="purchaseForm.userId" placeholder="请选择会员" style="width: 100%;" filterable>
            <el-option 
              v-for="member in members" 
              :key="member.id" 
              :label="`${member.realName} (${member.phone})`" 
              :value="member.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="卡类型" prop="cardTypeId">
          <el-select v-model="purchaseForm.cardTypeId" placeholder="请选择卡类型" style="width: 100%;" @change="handleCardTypeChange">
            <el-option 
              v-for="type in cardTypes" 
              :key="type.id" 
              :label="`${type.typeName} - ¥${type.price}`" 
              :value="type.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付金额" prop="amount">
          <el-input-number v-model="purchaseForm.amount" :min="0" :precision="2" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="支付方式" prop="payType">
          <el-select v-model="purchaseForm.payType" placeholder="请选择支付方式" style="width: 100%;">
            <el-option label="微信" value="WECHAT"></el-option>
            <el-option label="支付宝" value="ALIPAY"></el-option>
            <el-option label="现金" value="CASH"></el-option>
            <el-option label="银行卡" value="BANK"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="purchaseDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handlePurchaseSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="renewDialogVisible" title="续卡" width="400px">
      <el-form :model="renewForm" :rules="renewRules" ref="renewFormRef" label-width="80px" class="form-dialog">
        <el-form-item label="卡类型" prop="cardTypeId">
          <el-select v-model="renewForm.cardTypeId" placeholder="请选择续卡类型" style="width: 100%;">
            <el-option 
              v-for="type in cardTypes" 
              :key="type.id" 
              :label="`${type.typeName} - ¥${type.price}`" 
              :value="type.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付金额" prop="amount">
          <el-input-number v-model="renewForm.amount" :min="0" :precision="2" style="width: 100%;"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleRenewSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCardTypes, getCardPage, purchaseCard, renewCard, updateCardStatus } from '@/api/membership'
import { getMembers } from '@/api/user'

const loading = ref(false)
const submitLoading = ref(false)
const purchaseDialogVisible = ref(false)
const renewDialogVisible = ref(false)
const purchaseFormRef = ref()
const renewFormRef = ref()

const searchForm = reactive({
  keyword: '',
  status: null
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const cardTypes = ref([])
const members = ref([])

const purchaseForm = reactive({
  userId: null,
  cardTypeId: null,
  amount: 0,
  payType: 'CASH'
})

const renewForm = reactive({
  cardId: null,
  cardTypeId: null,
  amount: 0
})

const purchaseRules = {
  userId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  cardTypeId: [{ required: true, message: '请选择卡类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入支付金额', trigger: 'blur' }]
}

const renewRules = {
  cardTypeId: [{ required: true, message: '请选择续卡类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入支付金额', trigger: 'blur' }]
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const getStatusType = (status) => {
  switch (status) {
    case 1: return 'success'
    case 2: return 'info'
    case 3: return 'danger'
    default: return 'info'
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCardPage({
      pageNum: pagination.current,
      pageSize: pagination.size,
      ...searchForm
    })
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadCardTypes = async () => {
  try {
    const res = await getCardTypes()
    cardTypes.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const loadMembers = async () => {
  try {
    const res = await getMembers()
    members.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = null
  loadData()
}

const handleCardTypeChange = (id) => {
  const type = cardTypes.value.find(t => t.id === id)
  if (type) {
    purchaseForm.amount = type.price
  }
}

const handlePurchase = () => {
  Object.assign(purchaseForm, {
    userId: null,
    cardTypeId: null,
    amount: 0,
    payType: 'CASH'
  })
  purchaseDialogVisible.value = true
}

const handlePurchaseSubmit = async () => {
  try {
    await purchaseFormRef.value.validate()
    submitLoading.value = true
    await purchaseCard(purchaseForm)
    ElMessage.success('购卡成功')
    purchaseDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleRenew = (row) => {
  renewForm.cardId = row.id
  renewForm.cardTypeId = row.cardTypeId
  const type = cardTypes.value.find(t => t.id === row.cardTypeId)
  renewForm.amount = type ? type.price : 0
  renewDialogVisible.value = true
}

const handleRenewSubmit = async () => {
  try {
    await renewFormRef.value.validate()
    submitLoading.value = true
    await renewCard(renewForm.cardId, renewForm)
    ElMessage.success('续卡成功')
    renewDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleToggleStatus = (row) => {
  const newStatus = row.status === 1 ? 3 : 1
  ElMessageBox.confirm(`确定要${row.status === 1 ? '冻结' : '解冻'}该会员卡吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await updateCardStatus(row.id, newStatus)
    ElMessage.success('操作成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadCardTypes()
  loadMembers()
})
</script>
