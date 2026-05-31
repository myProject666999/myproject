<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Connection /></el-icon>
        借还操作
      </h2>
    </div>

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="借出物品" name="borrow">
        <el-card>
          <el-form :model="borrowForm" label-width="120px" style="max-width: 600px;">
            <el-form-item label="选择物品" required>
              <el-select v-model="borrowForm.itemId" placeholder="请选择物品" filterable style="width: 100%;" @change="handleItemChange">
                <el-option
                  v-for="item in availableItems"
                  :key="item.id"
                  :label="`${item.name} (库存: ${item.quantity}/${item.total_quantity})`"
                  :value="item.id"
                  :disabled="item.quantity <= 0"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="借用人" required>
              <el-input v-model="borrowForm.borrowerName" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="学号/工号" required>
              <el-input v-model="borrowForm.borrowerId" placeholder="请输入学号或工号" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="borrowForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="借出日期">
              <el-date-picker v-model="borrowForm.borrowDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="预计归还" required>
              <el-date-picker v-model="borrowForm.expectedReturnDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="borrowForm.remark" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="submitBorrow">
                确认借出
              </el-button>
              <el-button @click="resetBorrowForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="归还物品" name="return">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索借用人或物品"
            clearable
            style="width: 300px;"
            :prefix-icon="Search"
          />
        </div>

        <el-table :data="activeBorrows" v-loading="loading" style="width: 100%;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="item.name" label="物品名称" />
          <el-table-column prop="borrower_name" label="借用人" />
          <el-table-column prop="borrower_id" label="学号/工号" />
          <el-table-column prop="borrow_date" label="借出日期" width="180">
            <template #default="{ row }">
              {{ formatDate(row.borrow_date) }}
            </template>
          </el-table-column>
          <el-table-column prop="expected_return_date" label="预计归还" width="180">
            <template #default="{ row }">
              {{ formatDate(row.expected_return_date) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="isOverdue(row) ? 'danger' : 'warning'" size="small">
                {{ isOverdue(row) ? '已超期' : '借出中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="success" size="small" :icon="Check" @click="handleReturn(row)">
                归还
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && activeBorrows.length === 0" description="暂无借出记录" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="returnDialogVisible"
      title="归还物品"
      width="400px"
    >
      <p>确认归还物品: <strong>{{ currentReturn?.item?.name }}</strong></p>
      <el-form :model="returnForm" label-width="80px">
        <el-form-item label="备注">
          <el-input v-model="returnForm.remark" type="textarea" :rows="3" placeholder="可填写物品状态等信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmReturn">确认归还</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Check, Connection } from '@element-plus/icons-vue'
import { itemApi, borrowApi } from '@/api'

const activeTab = ref('borrow')
const loading = ref(false)
const submitting = ref(false)
const items = ref([])
const activeBorrows = ref([])
const searchKeyword = ref('')

const returnDialogVisible = ref(false)
const currentReturn = ref(null)
const returnForm = ref({ remark: '' })

const availableItems = computed(() => {
  return items.value.filter(item => item.quantity > 0)
})

const filteredActiveBorrows = computed(() => {
  if (!searchKeyword.value) return activeBorrows.value
  const keyword = searchKeyword.value.toLowerCase()
  return activeBorrows.value.filter(b =>
    b.borrower_name?.toLowerCase().includes(keyword) ||
    b.item?.name?.toLowerCase().includes(keyword)
  )
})

const borrowForm = ref({
  itemId: null,
  borrowerName: '',
  borrowerId: '',
  phone: '',
  borrowDate: new Date().toISOString().split('T')[0],
  expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  remark: ''
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const isOverdue = (borrow) => {
  if (!borrow.expected_return_date) return false
  return new Date(borrow.expected_return_date) < new Date()
}

const loadItems = async () => {
  try {
    const res = await itemApi.getItems()
    items.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadActiveBorrows = async () => {
  loading.value = true
  try {
    const res = await borrowApi.getBorrows({ status: 'borrowed' })
    activeBorrows.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleItemChange = () => {
}

const resetBorrowForm = () => {
  borrowForm.value = {
    itemId: null,
    borrowerName: '',
    borrowerId: '',
    phone: '',
    borrowDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remark: ''
  }
}

const submitBorrow = async () => {
  if (!borrowForm.value.itemId || !borrowForm.value.borrowerName || !borrowForm.value.borrowerId) {
    ElMessage.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    const data = {
      item_id: borrowForm.value.itemId,
      borrower_name: borrowForm.value.borrowerName,
      borrower_id: borrowForm.value.borrowerId,
      phone: borrowForm.value.phone,
      borrow_date: borrowForm.value.borrowDate ? new Date(borrowForm.value.borrowDate).toISOString() : new Date().toISOString(),
      expected_return_date: borrowForm.value.expectedReturnDate ? new Date(borrowForm.value.expectedReturnDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      remark: borrowForm.value.remark
    }
    await borrowApi.createBorrow(data)
    ElMessage.success('借出成功')
    resetBorrowForm()
    loadItems()
    loadActiveBorrows()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const handleReturn = (row) => {
  currentReturn.value = row
  returnForm.value = { remark: '' }
  returnDialogVisible.value = true
}

const confirmReturn = async () => {
  submitting.value = true
  try {
    await borrowApi.returnItem(currentReturn.value.id, { remark: returnForm.value.remark })
    ElMessage.success('归还成功')
    returnDialogVisible.value = false
    loadItems()
    loadActiveBorrows()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadItems()
  loadActiveBorrows()
})
</script>
