<template>
  <div class="budget-page">
    <div class="page-header">
      <h2>预算管理</h2>
      <div class="header-actions">
        <el-select v-model="selectedTripId" placeholder="选择行程" style="width: 200px" @change="loadBudgets">
          <el-option v-for="trip in trips" :key="trip.id" :label="trip.name" :value="trip.id" />
        </el-select>
        <el-button type="primary" @click="openBudgetDialog(null)">
          <el-icon><Plus /></el-icon>
          添加预算项
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card primary">
          <div class="stat-icon"><el-icon><Wallet /></el-icon></div>
          <div class="stat-content">
            <p class="stat-label">总预算</p>
            <p class="stat-value">¥{{ totalEstimated.toFixed(2) }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card success">
          <div class="stat-icon"><el-icon><Coin /></el-icon></div>
          <div class="stat-content">
            <p class="stat-label">已花费</p>
            <p class="stat-value">¥{{ totalActual.toFixed(2) }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card warning">
          <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
          <div class="stat-content">
            <p class="stat-label">剩余预算</p>
            <p class="stat-value">¥{{ (totalEstimated - totalActual).toFixed(2) }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <template #header>
        <span>预算明细</span>
      </template>
      <el-table :data="budgets" style="width: 100%">
        <el-table-column prop="category" label="类别" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryType(scope.row.category)">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="itemName" label="项目名称" />
        <el-table-column prop="estimatedAmount" label="预算金额" width="120">
          <template #default="scope">
            <span style="color: #409eff">¥{{ scope.row.estimatedAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实际金额" width="120">
          <template #default="scope">
            <span style="color: #f56c6c">¥{{ scope.row.actualAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="差额" width="120">
          <template #default="scope">
            <span :style="{ color: scope.row.estimatedAmount >= scope.row.actualAmount ? '#67c23a' : '#f56c6c' }">
              {{ scope.row.estimatedAmount >= scope.row.actualAmount ? '+' : '' }}¥{{ (scope.row.estimatedAmount - scope.row.actualAmount).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="openBudgetDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteBudget(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="budgetDialogVisible" :title="isEdit ? '编辑预算' : '添加预算'" width="500px">
      <el-form :model="budgetForm" label-width="80px">
        <el-form-item label="类别">
          <el-select v-model="budgetForm.category" style="width: 100%">
            <el-option label="交通" value="交通" />
            <el-option label="住宿" value="住宿" />
            <el-option label="餐饮" value="餐饮" />
            <el-option label="门票" value="门票" />
            <el-option label="购物" value="购物" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="budgetForm.itemName" />
        </el-form-item>
        <el-form-item label="预算金额">
          <el-input-number v-model="budgetForm.estimatedAmount" :min="0" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="实际金额">
          <el-input-number v-model="budgetForm.actualAmount" :min="0" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="budgetForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="budgetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBudget">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tripApi, budgetApi } from '@/api'

const trips = ref([])
const budgets = ref([])
const selectedTripId = ref(null)

const budgetDialogVisible = ref(false)
const isEdit = ref(false)
const currentBudgetId = ref(null)
const budgetForm = ref({
  category: '其他',
  itemName: '',
  estimatedAmount: 0,
  actualAmount: 0,
  remark: ''
})

const totalEstimated = computed(() => {
  return budgets.value.reduce((sum, item) => sum + Number(item.estimatedAmount || 0), 0)
})

const totalActual = computed(() => {
  return budgets.value.reduce((sum, item) => sum + Number(item.actualAmount || 0), 0)
})

const categoryTypes = {
  '交通': 'primary',
  '住宿': 'success',
  '餐饮': 'warning',
  '门票': 'danger',
  '购物': 'info',
  '其他': ''
}

const getCategoryType = (category) => {
  return categoryTypes[category] || ''
}

const loadTrips = async () => {
  try {
    const data = await tripApi.list()
    trips.value = data
    if (data.length > 0) {
      selectedTripId.value = data[0].id
      loadBudgets()
    }
  } catch (error) {
    ElMessage.error('加载行程列表失败')
  }
}

const loadBudgets = async () => {
  if (!selectedTripId.value) return
  try {
    const data = await budgetApi.list(selectedTripId.value)
    budgets.value = data
  } catch (error) {
    ElMessage.error('加载预算失败')
  }
}

const openBudgetDialog = (budget) => {
  isEdit.value = !!budget
  currentBudgetId.value = budget?.id || null
  budgetForm.value = budget ? { ...budget } : {
    category: '其他',
    itemName: '',
    estimatedAmount: 0,
    actualAmount: 0,
    remark: ''
  }
  budgetDialogVisible.value = true
}

const saveBudget = async () => {
  try {
    const data = { ...budgetForm.value, tripId: selectedTripId.value }
    if (isEdit.value) {
      await budgetApi.update(currentBudgetId.value, data)
      ElMessage.success('更新成功')
    } else {
      await budgetApi.create(data)
      ElMessage.success('创建成功')
    }
    budgetDialogVisible.value = false
    loadBudgets()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteBudget = async (budget) => {
  try {
    await ElMessageBox.confirm('确定要删除这个预算项吗？', '提示', { type: 'warning' })
    await budgetApi.delete(budget.id)
    ElMessage.success('删除成功')
    loadBudgets()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadTrips()
})
</script>

<style scoped>
.budget-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  margin-bottom: 30px;
  border: none;
  color: white;
}

.stat-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.success {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.warning {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon {
  font-size: 48px;
  opacity: 0.8;
}

.stat-content .stat-label {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.stat-content .stat-value {
  margin: 5px 0 0 0;
  font-size: 28px;
  font-weight: bold;
}

.chart-card {
  margin-bottom: 30px;
}

.el-card :deep(.el-card__body) {
  padding: 0;
}

.el-table {
  border-radius: 8px;
}
</style>
