<template>
  <div class="day-detail-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span class="header-title">{{ currentDateLabel }}</span>
          <el-button type="success" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加记录
          </el-button>
        </div>
      </template>

      <div class="day-summary" v-if="dayDetail">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="summary-item income">
              <div class="summary-label">当日收入</div>
              <div class="summary-value">¥{{ dayDetail.totalIncome }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="summary-item expense">
              <div class="summary-label">当日支出</div>
              <div class="summary-value">¥{{ dayDetail.totalExpense }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="records-list" v-if="dayDetail && dayDetail.records.length > 0">
        <div class="list-title">收支明细</div>
        <el-table :data="dayDetail.records" style="width: 100%">
          <el-table-column prop="date" label="日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.type === 1 ? 'success' : 'danger'" size="small">
                {{ row.type === 1 ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">
              <span :class="row.type === 1 ? 'income-text' : 'expense-text'">
                {{ row.type === 1 ? '+' : '-' }}¥{{ row.amount }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="editRecord(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteRecord(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-empty v-else description="当日暂无记录" />
    </el-card>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑记录' : '添加记录'" width="500px">
      <el-form :model="recordForm" label-width="80px">
        <el-form-item label="类型">
          <el-radio-group v-model="recordForm.type">
            <el-radio :label="2">支出</el-radio>
            <el-radio :label="1">收入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="recordForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="cat in currentCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="recordForm.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="recordForm.date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recordForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDayDetail,
  getCategories,
  addRecord,
  updateRecord,
  deleteRecord as deleteRecordApi
} from '../api'

const route = useRoute()
const router = useRouter()
const dateStr = route.params.date
const dayDetail = ref(null)
const categories = ref([])
const showAddDialog = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const recordForm = ref({
  type: 2,
  categoryId: null,
  amount: 0,
  date: dateStr,
  remark: ''
})

const currentDateLabel = computed(() => {
  return dayjs(dateStr).format('YYYY年MM月DD日')
})

const currentCategories = computed(() => {
  return categories.value.filter(c => c.type === recordForm.value.type)
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const goBack = () => {
  router.push('/')
}

const loadData = async () => {
  try {
    const [detail, cats] = await Promise.all([
      getDayDetail(dateStr),
      getCategories()
    ])
    dayDetail.value = detail
    categories.value = cats
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

const editRecord = (row) => {
  isEdit.value = true
  editId.value = row.id
  recordForm.value = {
    type: row.type,
    categoryId: row.categoryId,
    amount: row.amount,
    date: dayjs(row.date).format('YYYY-MM-DD'),
    remark: row.remark
  }
  showAddDialog.value = true
}

const deleteRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRecordApi(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}

const submitRecord = async () => {
  if (!recordForm.value.categoryId || !recordForm.value.amount) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    if (isEdit.value) {
      await updateRecord({ ...recordForm.value, id: editId.value })
      ElMessage.success('更新成功')
    } else {
      await addRecord(recordForm.value)
      ElMessage.success('添加成功')
    }
    showAddDialog.value = false
    resetForm()
    loadData()
  } catch (error) {
    console.error('操作失败', error)
  }
}

const resetForm = () => {
  isEdit.value = false
  editId.value = null
  recordForm.value = {
    type: 2,
    categoryId: null,
    amount: 0,
    date: dateStr,
    remark: ''
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.day-detail-page {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
}

.day-summary {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
  padding: 10px;
}

.summary-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 28px;
  font-weight: 600;
}

.summary-item.income .summary-value {
  color: #67c23a;
}

.summary-item.expense .summary-value {
  color: #f56c6c;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.income-text {
  color: #67c23a;
  font-weight: 600;
}

.expense-text {
  color: #f56c6c;
  font-weight: 600;
}
</style>
