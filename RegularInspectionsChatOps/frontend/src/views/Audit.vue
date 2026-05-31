<template>
  <div>
    <div class="page-header">
      <span class="page-title">指令审计</span>
    </div>
    
    <div class="card-wrapper">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
            <el-option label="执行中" :value="2" />
            <el-option label="拒绝" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="command" label="指令" min-width="150" />
        <el-table-column prop="username" label="执行用户" width="120" />
        <el-table-column prop="channel" label="来源渠道" width="100" />
        <el-table-column prop="plan_name" label="关联预案" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时(ms)" width="100" />
        <el-table-column prop="ip_address" label="IP地址" width="130" />
        <el-table-column prop="created_at" label="执行时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.page_size"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="执行详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="指令">{{ detail.command }}</el-descriptions-item>
        <el-descriptions-item label="执行用户">{{ detail.username }}</el-descriptions-item>
        <el-descriptions-item label="来源渠道">{{ detail.channel }}</el-descriptions-item>
        <el-descriptions-item label="关联预案">{{ detail.plan_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detail.status)" size="small">
            {{ getStatusText(detail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ detail.duration }}ms</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detail.ip_address }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ detail.started_at }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ detail.ended_at || '-' }}</el-descriptions-item>
        <el-descriptions-item label="错误信息" v-if="detail.error_message">{{ detail.error_message }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="detail.params" style="margin-top: 20px;">
        <div style="font-weight: 600; margin-bottom: 10px;">指令参数:</div>
        <pre style="background: #f5f7fa; padding: 15px; border-radius: 4px; max-height: 150px; overflow: auto;">{{ JSON.stringify(detail.params, null, 2) }}</pre>
      </div>
      <div v-if="detail.result_data" style="margin-top: 20px;">
        <div style="font-weight: 600; margin-bottom: 10px;">执行结果:</div>
        <pre style="background: #f5f7fa; padding: 15px; border-radius: 4px; max-height: 200px; overflow: auto;">{{ JSON.stringify(detail.result_data, null, 2) }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAudit } from '@/api'

const searchForm = reactive({
  page: 1,
  page_size: 10,
  status: ''
})

const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const detail = ref({})

const getStatusType = (status) => {
  const types = { 0: 'danger', 1: 'success', 2: 'warning', 3: 'info' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '失败', 1: '成功', 2: '执行中', 3: '拒绝' }
  return texts[status] || '未知'
}

const loadData = async () => {
  try {
    const params = { ...searchForm }
    if (params.status) params.status = Number(params.status)
    const res = await getAudit(params)
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error(error)
  }
}

const viewDetail = (row) => {
  detail.value = row
  detailVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>
