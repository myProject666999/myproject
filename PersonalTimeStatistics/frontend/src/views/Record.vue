<template>
  <div class="record-page">
    <el-card class="filter-card">
      <el-date-picker
        v-model="currentDate"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="loadRecords"
      />
      <el-button type="primary" @click="openDialog" style="margin-left: 12px;">
        <el-icon><Plus /></el-icon>
        添加记录
      </el-button>
    </el-card>

    <el-card class="records-card">
      <template #header>
        <div class="card-header">
          <span>今日记录</span>
          <span class="total-time">总时长：{{ formatDuration(totalDuration) }}</span>
        </div>
      </template>
      <el-table :data="records" v-loading="loading">
        <el-table-column prop="startTime" label="开始时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="类别" width="120">
          <template #default="{ row }">
            <el-tag :color="getCategoryColor(row.categoryId)">
              {{ getCategoryName(row.categoryId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时长" width="100">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="editRecord(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="deleteRecord(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑记录' : '添加记录'" width="500px">
      <el-form :model="form" label-width="80px" ref="formRef">
        <el-form-item label="类别" prop="categoryId" required>
          <el-select v-model="form.categoryId" placeholder="请选择类别" style="width: 100%;">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime" required>
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime" required>
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getCategories } from '../api/category'
import { getRecordsByDate, createRecord, updateRecord, deleteRecord } from '../api/record'

const currentDate = ref(dayjs().format('YYYY-MM-DD'))
const records = ref([])
const categories = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = ref({
  id: null,
  categoryId: null,
  startTime: '',
  endTime: '',
  description: ''
})

const totalDuration = computed(() => {
  return records.value.reduce((sum, r) => sum + r.duration, 0)
})

const loadCategories = async () => {
  const data = await getCategories()
  categories.value = data
}

const loadRecords = async () => {
  loading.value = true
  try {
    const data = await getRecordsByDate(currentDate.value)
    records.value = data
  } finally {
    loading.value = false
  }
}

const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : '未知'
}

const getCategoryColor = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.color : '#8c8c8c'
}

const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

const openDialog = () => {
  isEdit.value = false
  form.value = {
    id: null,
    categoryId: null,
    startTime: '',
    endTime: '',
    description: ''
  }
  dialogVisible.value = true
}

const editRecord = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await updateRecord(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createRecord(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadRecords()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const deleteRecord = (id) => {
  ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteRecord(id)
    ElMessage.success('删除成功')
    loadRecords()
  }).catch(() => {})
}

onMounted(() => {
  loadCategories()
  loadRecords()
})
</script>

<style scoped>
.record-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  display: flex;
  align-items: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-time {
  color: #1890ff;
  font-weight: 600;
}
</style>
