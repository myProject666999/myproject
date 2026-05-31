<template>
  <div class="group-list-page">
    <div class="page-header">
      <h2>热门拼团</h2>
      <p>发现好物，和邻居一起拼单省钱</p>
    </div>
    <div class="filter-bar">
      <el-radio-group v-model="statusFilter" @change="fetchGroups">
        <el-radio-button :value="''">全部</el-radio-button>
        <el-radio-button :value="0">进行中</el-radio-button>
        <el-radio-button :value="1">已成团</el-radio-button>
      </el-radio-group>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索团购商品"
        clearable
        style="width: 260px"
        @keyup.enter="fetchGroups"
        @clear="fetchGroups"
      />
    </div>
    <div v-loading="loading" class="group-grid">
      <template v-if="groups.length > 0">
        <GroupCard
          v-for="group in groups"
          :key="group.id"
          :group="group"
        />
      </template>
      <el-empty v-else description="暂无团购活动" />
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[8, 12, 16, 24]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchGroups"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { groupApi } from '@/api'
import GroupCard from '@/components/GroupCard.vue'

const groups = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)
const statusFilter = ref('')
const searchKeyword = ref('')

async function fetchGroups() {
  loading.value = true
  try {
    const params = {}
    if (statusFilter.value !== '') {
      params.status = statusFilter.value
    }
    const res = await groupApi.getList(params)
    groups.value = res.data || []
    total.value = groups.value.length
  } catch (error) {
    ElMessage.error('获取团购列表失败')
  } finally {
    loading.value = false
  }
}

function handleSizeChange() {
  currentPage.value = 1
  fetchGroups()
}

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped>
.group-list-page {
  padding: 10px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  min-height: 400px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
