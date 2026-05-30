<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">对账管理</span>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px; margin-right: 10px" clearable>
          <el-option label="待对账" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="有差异" :value="3" />
        </el-select>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建对账
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="reconciliation_no" label="对账编号" width="180" />
        <el-table-column prop="drama_id" label="剧集ID" width="100" />
        <el-table-column prop="settlement_period" label="结算周期" width="120" />
        <el-table-column prop="system_play_count" label="系统播放量" width="120" />
        <el-table-column prop="third_party_play_count" label="第三方播放量" width="120" />
        <el-table-column prop="play_count_diff" label="播放量差异" width="120" />
        <el-table-column prop="system_payment_amount" label="系统付费" width="110" />
        <el-table-column prop="payment_amount_diff" label="付费差异" width="110" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="success"
              link
              @click="handleProcess(row)"
            >
              开始对账
            </el-button>
            <el-button
              v-if="row.status === 2"
              size="small"
              type="warning"
              link
              @click="handleResolve(row)"
            >
              处理差异
            </el-button>
          </template>
        </el-table-column>
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

    <el-dialog v-model="createDialogVisible" title="创建对账" width="500px">
      <el-form :model="createForm" label-width="120px">
        <el-form-item label="剧集ID" prop="drama_id">
          <el-input-number v-model="createForm.drama_id" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结算周期" prop="settlement_period">
          <el-input v-model="createForm.settlement_period" placeholder="如：202605" />
        </el-form-item>
        <el-form-item label="第三方播放量">
          <el-input-number v-model="createForm.third_party_play_count" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="第三方付费金额">
          <el-input-number v-model="createForm.third_party_payment_amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getReconciliationList, createReconciliation, processReconciliation, resolveDiscrepancy } from '@/api/reconciliation'

const loading = ref(false)
const tableData = ref([])
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const createDialogVisible = ref(false)

const createForm = reactive({
  drama_id: 1,
  settlement_period: '202605',
  third_party_play_count: 0,
  third_party_payment_amount: 0
})

const getStatusType = (status) => {
  const types = ['warning', 'success', 'danger', 'primary']
  return types[status - 1] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待对账', '已完成', '有差异', '已调整']
  return texts[status - 1] || status
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getReconciliationList({
      page: currentPage.value,
      page_size: pageSize.value,
      status: statusFilter.value
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

const handleCreate = () => {
  createDialogVisible.value = true
}

const handleCreateSubmit = async () => {
  try {
    await createReconciliation(createForm)
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('创建失败', error)
  }
}

const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

const handleProcess = async (row) => {
  try {
    await processReconciliation(row.id)
    ElMessage.success('开始对账')
    loadData()
  } catch (error) {
    console.error('处理失败', error)
  }
}

const handleResolve = async (row) => {
  try {
    await resolveDiscrepancy(row.id, { resolution: 'manual' })
    ElMessage.success('差异已处理')
    loadData()
  } catch (error) {
    console.error('处理失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
