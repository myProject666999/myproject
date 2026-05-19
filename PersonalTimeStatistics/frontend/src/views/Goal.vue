<template>
  <div class="goal-page">
    <el-card class="action-card">
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon>
        添加目标
      </el-button>
    </el-card>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="日目标" name="daily">
        <el-card>
          <el-table :data="dailyGoals" v-loading="loading">
            <el-table-column label="类别" width="150">
              <template v-slot:default="{ row }">
                <el-tag v-if="row.categoryId" :color="getCategoryColor(row.categoryId)">
                  {{ getCategoryName(row.categoryId) }}
                </el-tag>
                <el-tag v-else color="#1890ff">总计</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="目标时长" width="150">
              <template v-slot:default="{ row }">
                {{ formatDuration(row.targetMinutes) }}
              </template>
            </el-table-column>
            <el-table-column prop="period" label="周期" width="150">
              <template v-slot:default="{ row }">
                {{ row.period || '每天' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template v-slot:default="{ row }">
                <el-tag :type="row.isActive === 1 ? 'success' : 'info'">
                  {{ row.isActive === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template v-slot:default="{ row }">
                <el-button size="small" type="primary" link @click="editGoal(row)">编辑</el-button>
                <el-button size="small" type="danger" link @click="handleDeleteGoal(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="周目标" name="weekly">
        <el-card>
          <el-table :data="weeklyGoals" v-loading="loading">
            <el-table-column label="类别" width="150">
              <template v-slot:default="{ row }">
                <el-tag v-if="row.categoryId" :color="getCategoryColor(row.categoryId)">
                  {{ getCategoryName(row.categoryId) }}
                </el-tag>
                <el-tag v-else color="#1890ff">总计</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="目标时长" width="150">
              <template v-slot:default="{ row }">
                {{ formatDuration(row.targetMinutes) }}
              </template>
            </el-table-column>
            <el-table-column prop="period" label="周期" width="150">
              <template v-slot:default="{ row }">
                {{ row.period || '每周' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template v-slot:default="{ row }">
                <el-tag :type="row.isActive === 1 ? 'success' : 'info'">
                  {{ row.isActive === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template v-slot:default="{ row }">
                <el-button size="small" type="primary" link @click="editGoal(row)">编辑</el-button>
                <el-button size="small" type="danger" link @click="handleDeleteGoal(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="月目标" name="monthly">
        <el-card>
          <el-table :data="monthlyGoals" v-loading="loading">
            <el-table-column label="类别" width="150">
              <template v-slot:default="{ row }">
                <el-tag v-if="row.categoryId" :color="getCategoryColor(row.categoryId)">
                  {{ getCategoryName(row.categoryId) }}
                </el-tag>
                <el-tag v-else color="#1890ff">总计</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="目标时长" width="150">
              <template v-slot:default="{ row }">
                {{ formatDuration(row.targetMinutes) }}
              </template>
            </el-table-column>
            <el-table-column prop="period" label="周期" width="150">
              <template v-slot:default="{ row }">
                {{ row.period || '每月' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template v-slot:default="{ row }">
                <el-tag :type="row.isActive === 1 ? 'success' : 'info'">
                  {{ row.isActive === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template v-slot:default="{ row }">
                <el-button size="small" type="primary" link @click="editGoal(row)">编辑</el-button>
                <el-button size="small" type="danger" link @click="handleDeleteGoal(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑目标' : '添加目标'" width="500px">
      <el-form :model="form" label-width="80px" ref="formRef">
        <el-form-item label="目标类型" prop="goalType" required>
          <el-select v-model="form.goalType" placeholder="请选择目标类型" style="width: 100%;">
            <el-option label="日目标" value="daily" />
            <el-option label="周目标" value="weekly" />
            <el-option label="月目标" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="form.categoryId" placeholder="不选则为总目标" clearable style="width: 100%;">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标时长" prop="targetMinutes" required>
          <el-input-number v-model="form.targetMinutes" :min="1" :max="1440" style="width: 100%;" />
          <span style="color: #999; font-size: 12px;">单位：分钟</span>
        </el-form-item>
        <el-form-item label="周期">
          <el-input v-model="form.period" placeholder="如：2024-01、2024-W01，留空则为重复目标" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.isActive" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories } from '../api/category'
import { getGoals, createGoal, updateGoal, deleteGoal as deleteGoalApi } from '../api/goal'

const activeTab = ref('daily')
const loading = ref(false)
const goals = ref([])
const categories = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = ref({
  id: null,
  categoryId: null,
  goalType: 'daily',
  targetMinutes: null,
  period: '',
  isActive: 1
})

const dailyGoals = computed(() => goals.value.filter(g => g.goalType === 'daily'))
const weeklyGoals = computed(() => goals.value.filter(g => g.goalType === 'weekly'))
const monthlyGoals = computed(() => goals.value.filter(g => g.goalType === 'monthly'))

const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : '未知'
}

const getCategoryColor = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.color : '#8c8c8c'
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

const loadCategories = async () => {
  categories.value = await getCategories()
}

const loadGoals = async () => {
  loading.value = true
  try {
    goals.value = await getGoals()
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  isEdit.value = false
  form.value = {
    id: null,
    categoryId: null,
    goalType: 'daily',
    targetMinutes: null,
    period: '',
    isActive: 1
  }
  dialogVisible.value = true
}

const editGoal = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await updateGoal(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createGoal(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadGoals()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleDeleteGoal = (id) => {
  ElMessageBox.confirm('确定要删除这个目标吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteGoalApi(id)
    ElMessage.success('删除成功')
    loadGoals()
  }).catch(() => {})
}

onMounted(() => {
  loadCategories()
  loadGoals()
})
</script>

<style scoped>
.goal-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card {
  display: flex;
  justify-content: flex-end;
}
</style>
