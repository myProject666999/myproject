<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><List /></el-icon>
        物品列表
      </h2>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card-title">物品总数</div>
        <div class="stat-card-value">{{ stats.total_items || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">可用物品</div>
        <div class="stat-card-value" style="color: #67c23a;">{{ stats.available_items || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">借出中</div>
        <div class="stat-card-value" style="color: #e6a23c;">{{ stats.borrowed_items || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">损坏物品</div>
        <div class="stat-card-value" style="color: #f56c6c;">{{ stats.damaged_items || 0 }}</div>
      </div>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索物品名称或描述"
        clearable
        style="width: 300px;"
        :prefix-icon="Search"
        @keyup.enter="loadItems"
      />
      <el-select v-model="searchCategory" placeholder="选择分类" clearable style="width: 150px;">
        <el-option label="工具" value="工具" />
        <el-option label="电子设备" value="电子设备" />
        <el-option label="图书" value="图书" />
        <el-option label="生活用品" value="生活用品" />
        <el-option label="其他" value="其他" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadItems">搜索</el-button>
      <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
    </div>

    <div v-loading="loading" class="item-grid">
      <div v-for="item in items" :key="item.id" class="item-card">
        <div class="item-card-image">
          <el-icon><Goods /></el-icon>
        </div>
        <div class="item-card-content">
          <h3 class="item-card-name">{{ item.name }}</h3>
          <p class="item-card-desc">{{ item.description || '暂无描述' }}</p>
          <div class="item-card-info">
            <span>库存: {{ item.quantity }}/{{ item.total_quantity }}</span>
            <span>
              <el-tag :type="getStatusType(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </el-tag>
            </span>
          </div>
        </div>
        <div class="item-card-actions">
          <el-button type="primary" size="small" :icon="Connection" @click="handleBorrow(item)" :disabled="item.quantity <= 0">
            借出
          </el-button>
          <el-button size="small" :icon="Clock" @click="handleReserve(item)">
            预约
          </el-button>
        </div>
      </div>
    </div>

    <el-empty v-if="!loading && items.length === 0" description="暂无物品" />

    <el-dialog
      v-model="borrowDialogVisible"
      title="借出物品"
      width="500px"
    >
      <el-form :model="borrowForm" label-width="100px">
        <el-form-item label="物品名称">
          <el-input v-model="borrowForm.itemName" disabled />
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
          <el-date-picker v-model="borrowForm.borrowDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="预计归还" required>
          <el-date-picker v-model="borrowForm.expectedReturnDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="borrowForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmBorrow">确认借出</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="reserveDialogVisible"
      title="预约物品"
      width="500px"
    >
      <el-form :model="reserveForm" label-width="100px">
        <el-form-item label="物品名称">
          <el-input v-model="reserveForm.itemName" disabled />
        </el-form-item>
        <el-form-item label="预约人" required>
          <el-input v-model="reserveForm.reserverName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="学号/工号" required>
          <el-input v-model="reserveForm.reserverId" placeholder="请输入学号或工号" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="reserveForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reserveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmReserve">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Goods, Connection, Clock } from '@element-plus/icons-vue'
import { itemApi, borrowApi, reservationApi } from '@/api'

const items = ref([])
const stats = ref({})
const loading = ref(false)
const searchKeyword = ref('')
const searchCategory = ref('')

const borrowDialogVisible = ref(false)
const reserveDialogVisible = ref(false)
const submitting = ref(false)

const borrowForm = ref({
  itemId: null,
  itemName: '',
  borrowerName: '',
  borrowerId: '',
  phone: '',
  borrowDate: '',
  expectedReturnDate: '',
  remark: ''
})

const reserveForm = ref({
  itemId: null,
  itemName: '',
  reserverName: '',
  reserverId: '',
  phone: ''
})

const getStatusType = (status) => {
  const map = {
    available: 'success',
    borrowed: 'warning',
    reserved: 'info',
    damaged: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    available: '可借',
    borrowed: '已借出',
    reserved: '已预约',
    damaged: '已损坏'
  }
  return map[status] || status
}

const loadStats = async () => {
  try {
    const res = await itemApi.getStats()
    stats.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadItems = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (searchCategory.value) params.category = searchCategory.value
    const res = await itemApi.getItems(params)
    items.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchKeyword.value = ''
  searchCategory.value = ''
  loadItems()
}

const handleBorrow = (item) => {
  borrowForm.value = {
    itemId: item.id,
    itemName: item.name,
    borrowerName: '',
    borrowerId: '',
    phone: '',
    borrowDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remark: ''
  }
  borrowDialogVisible.value = true
}

const confirmBorrow = async () => {
  if (!borrowForm.value.borrowerName || !borrowForm.value.borrowerId) {
    ElMessage.warning('请填写完整信息')
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
    borrowDialogVisible.value = false
    loadItems()
    loadStats()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const handleReserve = (item) => {
  reserveForm.value = {
    itemId: item.id,
    itemName: item.name,
    reserverName: '',
    reserverId: '',
    phone: ''
  }
  reserveDialogVisible.value = true
}

const confirmReserve = async () => {
  if (!reserveForm.value.reserverName || !reserveForm.value.reserverId) {
    ElMessage.warning('请填写完整信息')
    return
  }

  submitting.value = true
  try {
    const data = {
      item_id: reserveForm.value.itemId,
      reserver_name: reserveForm.value.reserverName,
      reserver_id: reserveForm.value.reserverId,
      phone: reserveForm.value.phone,
      reserve_date: new Date().toISOString()
    }
    const res = await reservationApi.createReservation(data)
    ElMessage.success(`预约成功，排队位置: ${res.data.queue_position}`)
    reserveDialogVisible.value = false
    loadItems()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadStats()
  loadItems()
})
</script>
