<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" link @click="goBack">返回</el-button>
        <h2>{{ trip?.name || '预算管理' }}</h2>
      </div>
    </div>

    <div v-loading="loading" class="budget-page">
      <div class="budget-summary">
        <div class="summary-card total">
          <div class="summary-label">总预算</div>
          <div class="summary-value">¥{{ totalBudget.toFixed(2) }}</div>
        </div>
        <div class="summary-card attraction">
          <div class="summary-label">景点费用</div>
          <div class="summary-value">¥{{ attractionTotal.toFixed(2) }}</div>
        </div>
        <div class="summary-card combined">
          <div class="summary-label">合计花费</div>
          <div class="summary-value">¥{{ combinedTotal.toFixed(2) }}</div>
        </div>
      </div>

      <div class="budget-section">
        <div class="section-header">
          <h3 class="section-title">预算分类</h3>
          <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
            添加预算
          </el-button>
        </div>

        <div v-if="budgets.length === 0" class="empty-state">
          <el-icon><Money /></el-icon>
          <p>还没有设置预算，点击上方按钮添加</p>
        </div>

        <div v-else class="budget-list">
          <div v-for="budget in budgets" :key="budget.id" class="budget-item card">
            <div class="budget-info">
              <span class="budget-category">{{ budget.category }}</span>
              <span class="budget-amount">¥{{ budget.amount.toFixed(2) }}</span>
            </div>
            <p v-if="budget.notes" class="budget-notes">{{ budget.notes }}</p>
            <div class="budget-actions">
              <el-button type="primary" link :icon="Edit" @click="editBudget(budget)">编辑</el-button>
              <el-button type="danger" link :icon="Delete" @click="deleteBudget(budget.id)">删除</el-button>
            </div>
          </div>
        </div>

        <div v-if="budgets.length > 0" class="category-chart">
          <h3 class="section-title">分类占比</h3>
          <div class="chart-bars">
            <div
              v-for="(total, category) in categoryTotals"
              :key="category"
              class="chart-item"
            >
              <span class="chart-label">{{ category }}</span>
              <div class="chart-bar-container">
                <div
                  class="chart-bar"
                  :style="{ width: totalBudget > 0 ? (total / totalBudget * 100) + '%' : '0%' }"
                ></div>
              </div>
              <span class="chart-value">¥{{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="attraction-budget-section">
        <h3 class="section-title">景点费用明细</h3>
        <div v-if="attractionExpenses.length === 0" class="empty-state">
          <el-icon><LocationFilled /></el-icon>
          <p>还没有添加费用的景点</p>
        </div>
        <div v-else class="attraction-expenses">
          <div
            v-for="expense in attractionExpenses"
            :key="expense.id"
            class="expense-item"
          >
            <span class="expense-name">{{ expense.name }}</span>
            <span class="expense-category">{{ getTypeText(expense.type) }}</span>
            <span class="expense-date">{{ formatDate(expense.date) }}</span>
            <span class="expense-cost">¥{{ expense.cost.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddDialog" :title="editingBudget ? '编辑预算' : '添加预算'" width="450px">
      <el-form :model="budgetForm" label-width="80px">
        <el-form-item label="分类" required>
          <el-select v-model="budgetForm.category">
            <el-option label="交通" value="交通" />
            <el-option label="住宿" value="住宿" />
            <el-option label="餐饮" value="餐饮" />
            <el-option label="门票" value="门票" />
            <el-option label="购物" value="购物" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" required>
          <el-input-number v-model="budgetForm.amount" :min="0" :step="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="budgetForm.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveBudget">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, ArrowLeft, Money, LocationFilled } from '@element-plus/icons-vue'
import { useTripStore } from '../stores/trip'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()

const loading = ref(false)
const trip = ref(null)
const budgets = ref([])
const showAddDialog = ref(false)
const editingBudget = ref(null)

const budgetForm = ref({
  category: '交通',
  amount: 0,
  notes: ''
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [tripRes, summaryRes] = await Promise.all([
      tripStore.fetchTrip(route.params.id),
      tripStore.fetchBudgetSummary(route.params.id)
    ])
    trip.value = tripRes
    budgets.value = summaryRes.budgets || []
  } finally {
    loading.value = false
  }
}

const totalBudget = computed(() => {
  return budgets.value.reduce((sum, b) => sum + (b.amount || 0), 0)
})

const categoryTotals = computed(() => {
  const totals = {}
  budgets.value.forEach(b => {
    totals[b.category] = (totals[b.category] || 0) + b.amount
  })
  return totals
})

const attractionExpenses = computed(() => {
  const expenses = []
  trip.value?.days?.forEach(day => {
    day.attractions?.forEach(attr => {
      if (attr.cost && attr.cost > 0) {
        expenses.push({
          ...attr,
          date: day.date
        })
      }
    })
  })
  return expenses
})

const attractionTotal = computed(() => {
  return attractionExpenses.value.reduce((sum, e) => sum + e.cost, 0)
})

const combinedTotal = computed(() => {
  return totalBudget.value + attractionTotal.value
})

function editBudget(budget) {
  editingBudget.value = budget
  budgetForm.value = {
    category: budget.category,
    amount: budget.amount,
    notes: budget.notes || ''
  }
  showAddDialog.value = true
}

async function saveBudget() {
  if (!budgetForm.value.category) {
    ElMessage.warning('请选择分类')
    return
  }
  if (!budgetForm.value.amount || budgetForm.value.amount <= 0) {
    ElMessage.warning('请输入金额')
    return
  }

  try {
    if (editingBudget.value) {
      await tripStore.updateBudget(editingBudget.value.id, budgetForm.value)
    } else {
      await tripStore.createBudget(route.params.id, budgetForm.value)
    }
    ElMessage.success('保存成功')
    showAddDialog.value = false
    editingBudget.value = null
    budgetForm.value = { category: '交通', amount: 0, notes: '' }
    await loadData()
  } catch (e) {
    // error handled by interceptor
  }
}

async function deleteBudget(id) {
  try {
    await ElMessageBox.confirm('确定要删除这条预算吗？', '提示', { type: 'warning' })
    await tripStore.deleteBudget(id)
    ElMessage.success('删除成功')
    await loadData()
  } catch {
    // 用户取消
  }
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function getTypeText(type) {
  const map = { attraction: '景点', food: '餐饮', hotel: '住宿', transport: '交通' }
  return map[type] || type
}

function goBack() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.budget-page {
  .budget-summary {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;

    .summary-card {
      flex: 1;
      padding: 24px;
      border-radius: 8px;
      text-align: center;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }

      &.attraction {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: #fff;
      }

      &.combined {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: #fff;
      }

      .summary-label {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 8px;
      }

      .summary-value {
        font-size: 28px;
        font-weight: bold;
      }
    }
  }
}

.budget-section {
  margin-bottom: 30px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}

.budget-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.budget-item {
  padding: 16px;

  .budget-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .budget-category {
      font-size: 15px;
      font-weight: 500;
      color: #303133;
    }

    .budget-amount {
      font-size: 18px;
      font-weight: bold;
      color: #f56c6c;
    }
  }

  .budget-notes {
    font-size: 13px;
    color: #909399;
    margin-bottom: 10px;
  }

  .budget-actions {
    display: flex;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
  }
}

.category-chart {
  .chart-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .chart-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .chart-label {
      width: 80px;
      font-size: 14px;
      color: #606266;
    }

    .chart-bar-container {
      flex: 1;
      height: 24px;
      background: #f0f2f5;
      border-radius: 4px;
      overflow: hidden;
    }

    .chart-bar {
      height: 100%;
      background: linear-gradient(90deg, #409eff, #667eea);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .chart-value {
      width: 100px;
      text-align: right;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
  }
}

.attraction-expenses {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .expense-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 6px;

    .expense-name {
      flex: 1;
      font-size: 14px;
      color: #303133;
    }

    .expense-category {
      font-size: 12px;
      padding: 2px 8px;
      background: #409eff;
      color: #fff;
      border-radius: 4px;
    }

    .expense-date {
      font-size: 13px;
      color: #909399;
    }

    .expense-cost {
      font-size: 15px;
      font-weight: 500;
      color: #f56c6c;
    }
  }
}
</style>
