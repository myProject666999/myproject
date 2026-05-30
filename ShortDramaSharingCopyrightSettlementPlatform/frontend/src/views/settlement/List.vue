<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">结算单</span>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px; margin-right: 10px" clearable>
          <el-option label="待确认" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="已支付" value="paid" />
        </el-select>
        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="settlement_no" label="结算单号" width="180" />
        <el-table-column prop="stakeholder_id" label="权益方ID" width="120" />
        <el-table-column prop="total_amount" label="总金额" width="120" />
        <el-table-column prop="detail_count" label="明细数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="settlement_period" label="结算周期" width="120" />
        <el-table-column prop="confirmed_at" label="确认时间" width="180" />
        <el-table-column prop="paid_at" label="支付时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="success"
              link
              @click="handleConfirm(row)"
            >
              确认
            </el-button>
            <el-button
              v-if="row.status === 'confirmed'"
              size="small"
              type="warning"
              link
              @click="handlePay(row)"
            >
              支付
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

    <el-dialog v-model="viewDialogVisible" title="结算单详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="结算单号">{{ currentItem?.settlement_no }}</el-descriptions-item>
        <el-descriptions-item label="权益方ID">{{ currentItem?.stakeholder_id }}</el-descriptions-item>
        <el-descriptions-item label="总金额">{{ currentItem?.total_amount }}</el-descriptions-item>
        <el-descriptions-item label="明细数量">{{ currentItem?.detail_count }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentItem?.status)">
            {{ getStatusText(currentItem?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结算周期">{{ currentItem?.settlement_period }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getSettlementList, confirmSettlement, paySettlement } from '@/api/settlement'

const loading = ref(false)
const tableData = ref([])
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const viewDialogVisible = ref(false)
const currentItem = ref(null)

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'primary',
    paid: 'success'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待确认',
    confirmed: '已确认',
    paid: '已支付'
  }
  return map[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getSettlementList({
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

const handleView = (row) => {
  currentItem.value = row
  viewDialogVisible.value = true
}

const handleConfirm = async (row) => {
  try {
    await confirmSettlement(row.id)
    ElMessage.success('确认成功')
    loadData()
  } catch (error) {
    console.error('确认失败', error)
  }
}

const handlePay = async (row) => {
  try {
    await paySettlement(row.id)
    ElMessage.success('支付成功')
    loadData()
  } catch (error) {
    console.error('支付失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
