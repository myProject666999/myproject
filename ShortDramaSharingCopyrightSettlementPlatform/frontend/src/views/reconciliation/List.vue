<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">对账管理</span>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px; margin-right: 10px" clearable>
          <el-option label="待对账" :value="1" />
          <el-option label="有差异" :value="2" />
          <el-option label="已调整" :value="3" />
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

    <el-dialog v-model="viewDialogVisible" title="对账详情" width="900px">
      <div v-if="viewData" v-loading="viewLoading">
        <el-descriptions :column="3" border style="margin-bottom: 20px">
          <el-descriptions-item label="对账编号">{{ viewData.reconciliation?.reconciliation_no }}</el-descriptions-item>
          <el-descriptions-item label="剧集ID">{{ viewData.reconciliation?.drama_id }}</el-descriptions-item>
          <el-descriptions-item label="结算周期">{{ viewData.reconciliation?.settlement_period }}</el-descriptions-item>
          <el-descriptions-item label="系统播放量">{{ viewData.reconciliation?.system_play_count }}</el-descriptions-item>
          <el-descriptions-item label="第三方播放量">{{ viewData.reconciliation?.third_party_play_count }}</el-descriptions-item>
          <el-descriptions-item label="播放量差异">
            <span :style="{ color: viewData.reconciliation?.play_count_diff !== 0 ? 'red' : '' }">
              {{ viewData.reconciliation?.play_count_diff }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="系统付费金额">{{ viewData.reconciliation?.system_payment_amount }}</el-descriptions-item>
          <el-descriptions-item label="第三方付费金额">{{ viewData.reconciliation?.third_party_payment_amount }}</el-descriptions-item>
          <el-descriptions-item label="付费差异">
            <span :style="{ color: viewData.reconciliation?.payment_amount_diff !== 0 ? 'red' : '' }">
              {{ viewData.reconciliation?.payment_amount_diff }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(viewData.reconciliation?.status)">
              {{ getStatusText(viewData.reconciliation?.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="调整备注" :span="2">{{ viewData.reconciliation?.adjustment_remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="viewData.details && viewData.details.length > 0" style="margin-top: 20px">
          <h4 style="margin-bottom: 10px">明细记录</h4>
          <el-table :data="viewData.details" style="width: 100%" border size="small">
            <el-table-column prop="data_type" label="数据类型" width="100">
              <template #default="{ row }">
                {{ row.data_type === 1 ? '播放数据' : '付费数据' }}
              </template>
            </el-table-column>
            <el-table-column prop="data_date" label="数据日期" width="120" />
            <el-table-column prop="system_value" label="系统值" width="120" />
            <el-table-column prop="third_party_value" label="第三方值" width="120" />
            <el-table-column prop="diff_value" label="差异值" width="120">
              <template #default="{ row }">
                <span :style="{ color: row.diff_value !== 0 ? 'red' : '' }">{{ row.diff_value }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="diff_ratio" label="差异比例(%)" width="120" />
          </el-table>
        </div>
        <div v-else style="margin-top: 20px; color: #999; text-align: center">
          暂无明细记录
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="resolveDialogVisible" title="处理差异" width="500px">
      <el-form :model="resolveForm" label-width="100px">
        <el-form-item label="调整备注" prop="adjustment_remark">
          <el-input
            v-model="resolveForm.adjustment_remark"
            type="textarea"
            :rows="3"
            placeholder="请输入调整说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resolveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResolveSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getReconciliationList, getReconciliationDetail, createReconciliation, adjustReconciliation } from '@/api/reconciliation'

const loading = ref(false)
const tableData = ref([])
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const createDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const viewLoading = ref(false)
const viewData = ref(null)
const resolveDialogVisible = ref(false)
const resolveId = ref(null)

const resolveForm = reactive({
  adjustment_remark: ''
})

const createForm = reactive({
  drama_id: 1,
  settlement_period: '202605',
  third_party_play_count: 0,
  third_party_payment_amount: 0
})

const getStatusType = (status) => {
  const types = ['warning', 'danger', 'primary']
  return types[status - 1] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待对账', '有差异', '已调整']
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

const handleView = async (row) => {
  viewDialogVisible.value = true
  viewLoading.value = true
  viewData.value = null
  try {
    const res = await getReconciliationDetail(row.id)
    if (res) {
      viewData.value = res
    }
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    viewLoading.value = false
  }
}

const handleResolve = (row) => {
  resolveId.value = row.id
  resolveForm.adjustment_remark = ''
  resolveDialogVisible.value = true
}

const handleResolveSubmit = async () => {
  if (!resolveForm.adjustment_remark) {
    ElMessage.warning('请输入调整备注')
    return
  }
  try {
    await adjustReconciliation(resolveId.value, resolveForm)
    ElMessage.success('差异已处理')
    resolveDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('处理失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
