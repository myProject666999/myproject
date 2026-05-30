<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">分账明细</span>
      <div class="header-actions">
        <el-tag v-if="taskId" type="info">任务ID: {{ taskId }}</el-tag>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { getShareDetails } from '@/api/share'

const route = useRoute()
const loading = ref(false)
const tableData = ref([])
const taskId = ref('')

const loadData = async () => {
  const tid = route.query.task_id
  if (!tid) {
    return
  }
  taskId.value = tid
  loading.value = true
  try {
    const res = await getShareDetails(tid)
    if (res) {
      tableData.value = res || []
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
