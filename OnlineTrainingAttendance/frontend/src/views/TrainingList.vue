<template>
  <div class="training-list">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" @submit.prevent>
        <el-form-item label="培训班名称">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadList">查询</el-button>
          <el-button :icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="card-list">
      <el-col
        v-for="item in list"
        :key="item.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="training-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="title" :title="item.name">{{ item.name }}</span>
              <el-tag :type="statusTagType(item.status)" size="small">
                {{ statusText(item.status) }}
              </el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="info-row">
              <el-icon><User /></el-icon>
              <span>讲师：{{ item.instructor || '—' }}</span>
            </div>
            <div class="info-row">
              <el-icon><Clock /></el-icon>
              <span>{{ item.startDate }} ~ {{ item.endDate }}</span>
            </div>
            <div class="info-row">
              <el-icon><Timer /></el-icon>
              <span>总学时：{{ item.totalHours || 0 }} 小时</span>
            </div>
            <div class="info-row">
              <el-icon><DataLine /></el-icon>
              <span>最低出勤率：{{ item.minAttendanceRate || 0 }}%</span>
            </div>
          </div>
          <template #footer>
            <div class="card-footer">
              <el-button size="small" type="primary" @click="goCheckin(item)">
                签到
              </el-button>
              <el-button size="small" @click="viewDetail(item)">详情</el-button>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-if="!loading && list.length === 0"
      description="暂无培训班"
      :image-size="120"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getTrainingList } from '@/api/training'

const router = useRouter()
const list = ref([])
const loading = ref(false)

const filterForm = reactive({
  name: '',
  status: null
})

const statusText = (s) => {
  if (s === 0) return '未开始'
  if (s === 1) return '进行中'
  if (s === 2) return '已结束'
  return '未知'
}

const statusTagType = (s) => {
  if (s === 0) return 'info'
  if (s === 1) return 'success'
  if (s === 2) return 'warning'
  return ''
}

const loadList = async () => {
  loading.value = true
  try {
    const res = await getTrainingList({
      name: filterForm.name || undefined,
      status: filterForm.status
    })
    list.value = res.data || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.name = ''
  filterForm.status = null
  loadList()
}

const goCheckin = (item) => {
  router.push(`/home/training/${item.id}/checkin`)
}

const viewDetail = (item) => {
  console.log('详情', item)
}

onMounted(loadList)
</script>

<style scoped>
.training-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-card {
  border-radius: 8px;
}
.filter-card :deep(.el-card__body) {
  padding: 16px 20px 0;
}
.card-list {
  row-gap: 16px;
}
.training-card {
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.training-card :deep(.el-card__body) {
  flex: 1;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card-header .title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
