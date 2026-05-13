<template>
  <div>
    <div class="page-header">
      <div class="page-title">业绩管理</div>
    </div>

    <div class="search-form">
      <el-select v-model="searchForm.coachId" placeholder="选择教练" style="width: 150px;" clearable filterable>
        <el-option 
          v-for="coach in coaches" 
          :key="coach.id" 
          :label="coach.realName" 
          :value="coach.id"
        ></el-option>
      </el-select>
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px;"
      ></el-date-picker>
      <el-button type="primary" @click="loadData">
        <el-icon><Search /></el-icon>
        查询
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading" show-summary :summary-method="getSummaries">
        <el-table-column label="教练">
          <template #default="{ row }">
            {{ getCoachName(row.coachId) }}
          </template>
        </el-table-column>
        <el-table-column label="日期" prop="performanceDate"></el-table-column>
        <el-table-column label="私教课时" prop="privateClasses"></el-table-column>
        <el-table-column label="团体课节数" prop="groupClasses"></el-table-column>
        <el-table-column label="销售额(元)" prop="salesAmount"></el-table-column>
        <el-table-column label="提成(元)" prop="commission">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">{{ row.commission }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="page-header" style="margin-top: 30px;">
      <div class="page-title">提成规则</div>
    </div>

    <div class="table-container">
      <el-table :data="rules" style="width: 100%">
        <el-table-column label="规则名称" prop="ruleName"></el-table-column>
        <el-table-column label="规则类型">
          <template #default="{ row }">
            <el-tag>{{ getRuleTypeName(row.ruleType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提成比例(%)" prop="commissionRate"></el-table-column>
        <el-table-column label="固定金额(元)" prop="fixedAmount"></el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEditRule(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="ruleDialogVisible" title="编辑提成规则" width="400px">
      <el-form :model="ruleForm" label-width="100px" class="form-dialog">
        <el-form-item label="提成比例(%)">
          <el-input-number v-model="ruleForm.commissionRate" :min="0" :max="100" :precision="2" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="固定金额(元)">
          <el-input-number v-model="ruleForm.fixedAmount" :min="0" :precision="2" style="width: 100%;"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRuleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPerformanceList, getCommissionRules, updateCommissionRule } from '@/api/performance'
import { getCoaches } from '@/api/user'

const loading = ref(false)
const ruleDialogVisible = ref(false)

const searchForm = reactive({
  coachId: null,
  dateRange: []
})

const tableData = ref([])
const rules = ref([])
const coaches = ref([])

const ruleForm = reactive({
  id: null,
  commissionRate: 0,
  fixedAmount: 0
})

const getCoachName = (id) => {
  const coach = coaches.value.find(c => c.id === id)
  return coach ? coach.realName : ''
}

const getRuleTypeName = (type) => {
  const map = {
    'PRIVATE': '私教课程',
    'GROUP': '团体课',
    'SALES': '销售'
  }
  return map[type] || type
}

const getSummaries = ({ columns, data }) => {
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (['privateClasses', 'groupClasses', 'salesAmount', 'commission'].includes(column.property)) {
      const values = data.map(item => Number(item[column.property]) || 0)
      sums[index] = values.reduce((prev, curr) => prev + curr, 0)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      coachId: searchForm.coachId
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    const res = await getPerformanceList(params)
    tableData.value = res.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadRules = async () => {
  try {
    const res = await getCommissionRules()
    rules.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const loadCoaches = async () => {
  try {
    const res = await getCoaches()
    coaches.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const handleEditRule = (row) => {
  Object.assign(ruleForm, {
    id: row.id,
    commissionRate: row.commissionRate,
    fixedAmount: row.fixedAmount
  })
  ruleDialogVisible.value = true
}

const handleRuleSubmit = async () => {
  try {
    await updateCommissionRule(ruleForm.id, ruleForm)
    ElMessage.success('更新成功')
    ruleDialogVisible.value = false
    loadRules()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadData()
  loadRules()
  loadCoaches()
})
</script>
