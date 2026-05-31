<template>
  <div class="my-groups-page">
    <div class="page-header">
      <h2>我的拼团</h2>
    </div>
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="进行中" name="0" />
      <el-tab-pane label="已成团" name="1" />
      <el-tab-pane label="拼团失败" name="2" />
      <el-tab-pane label="已取消" name="3" />
    </el-tabs>
    <div v-loading="loading" class="group-list">
      <template v-if="groups.length > 0">
        <GroupCard
          v-for="group in groups"
          :key="group.id"
          :group="group"
        />
      </template>
      <el-empty v-else description="暂无拼团记录" />
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[8, 12, 16, 24]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchMyGroups"
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
const activeTab = ref('all')

async function fetchMyGroups() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await groupApi.getMyGroups(params)
    groups.value = res.data || []
    total.value = groups.value.length
  } catch (error) {
    ElMessage.error('获取拼团列表失败')
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  currentPage.value = 1
  fetchMyGroups()
}

function handleSizeChange() {
  currentPage.value = 1
  fetchMyGroups()
}

onMounted(() => {
  fetchMyGroups()
})
</script>

<style scoped>
.my-groups-page {
  padding: 10px 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.group-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  min-height: 300px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
