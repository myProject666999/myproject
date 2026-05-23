<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">我的问卷</h2>
      <el-button type="primary" @click="goCreate" :icon="Plus">创建问卷</el-button>
    </div>
    
    <el-card class="card-shadow">
      <div class="filter-bar">
        <el-radio-group v-model="statusFilter" @change="fetchSurveys">
          <el-radio-button :value="null">全部</el-radio-button>
          <el-radio-button :value="0">草稿</el-radio-button>
          <el-radio-button :value="1">已发布</el-radio-button>
          <el-radio-button :value="2">已结束</el-radio-button>
        </el-radio-group>
      </div>
      
      <el-table :data="surveys" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="问卷标题" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="goDetail(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="responseCount" label="填写数" width="100">
          <template #default="{ row }">
            <span>{{ row.responseCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="goDesign(row.id)" :icon="Edit">编辑</el-button>
            <el-button size="small" type="primary" @click="goStatistics(row.id)" :icon="DataAnalysis">统计</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="surveys.length === 0 && !loading" description="暂无问卷，点击右上角创建" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, DataAnalysis, Delete } from '@element-plus/icons-vue'
import { getSurveyList, deleteSurvey } from '@/api/survey'

const router = useRouter()
const loading = ref(false)
const surveys = ref([])
const statusFilter = ref(null)

function getStatusType(status) {
  const map = { 0: 'info', 1: 'success', 2: 'warning' }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = { 0: '草稿', 1: '已发布', 2: '已结束' }
  return map[status] || '未知'
}

async function fetchSurveys() {
  loading.value = true
  try {
    const params = { current: 1, size: 100 }
    if (statusFilter.value !== null) {
      params.status = statusFilter.value
    }
    const res = await getSurveyList(params)
    surveys.value = res.data.records || res.data || []
  } catch (e) {
  } finally {
    loading.value = false
  }
}

function goCreate() {
  router.push('/surveys')
}

function goDetail(row) {
  if (row.status === 1) {
    goStatistics(row.id)
  } else {
    goDesign(row.id)
  }
}

function goDesign(id) {
  router.push(`/surveys/design/${id}`)
}

function goStatistics(id) {
  router.push(`/surveys/statistics/${id}`)
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除问卷"${row.title}"吗？`, '提示', {
      type: 'warning'
    })
    await deleteSurvey(row.id)
    ElMessage.success('删除成功')
    fetchSurveys()
  } catch (e) {
    if (e !== 'cancel') {
    }
  }
}

onMounted(fetchSurveys)
</script>

<style scoped lang="scss">
.filter-bar {
  margin-bottom: 20px;
}
</style>
