<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">分账明细</span>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索剧集或权益方"
          style="width: 200px; margin-right: 10px"
          clearable
        />
        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="detail_no" label="明细编号" width="180" />
        <el-table-column prop="task_id" label="任务ID" width="100" />
        <el-table-column prop="drama_id" label="剧集ID" width="100" />
        <el-table-column prop="stakeholder_id" label="权益方ID" width="120" />
        <el-table-column prop="share_amount" label="分账金额" width="120" />
        <el-table-column prop="share_ratio" label="分账比例" width="100" />
        <el-table-column prop="share_base" label="分账基数" width="120" />
        <el-table-column prop="settlement_period" label="结算周期" width="120" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
      </el-table>
    </div>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 20px; justify-content: flex-end"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getShareDetailList } from '@/api/share'

const loading = ref(false)
const tableData = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getShareDetailList({
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value
    })
    if (res) {
      tableData.value = res.list || []
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
