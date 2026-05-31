<template>
  <div class="container-list">
    <div class="page-title">
      <el-icon :size="24"><Box /></el-icon>
      <span>集装箱列表</span>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="箱号">
              <el-input v-model="searchForm.containerNo" placeholder="请输入箱号" clearable style="width: 180px;" />
            </el-form-item>
            <el-form-item label="箱型">
              <el-select v-model="searchForm.containerType" placeholder="全部" clearable style="width: 120px;">
                <el-option label="20GP" value="20GP" />
                <el-option label="40GP" value="40GP" />
                <el-option label="40HQ" value="40HQ" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px;">
                <el-option label="在场" value="PRESENT" />
                <el-option label="已出场" value="OUTBOUND" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否危险品">
              <el-select v-model="searchForm.isDanger" placeholder="全部" clearable style="width: 100px;">
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>

      <el-table :data="tableData" size="small" v-loading="loading">
        <el-table-column prop="containerNo" label="箱号" width="140" fixed="left" />
        <el-table-column prop="containerType" label="箱型" width="100" />
        <el-table-column prop="size" label="尺寸" width="100" />
        <el-table-column prop="owner" label="箱属" width="120" show-overflow-tooltip />
        <el-table-column prop="weight" label="重量(吨)" width="100" />
        <el-table-column prop="cargoType" label="货物类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getCargoTypeTag(row.cargoType)">
              {{ getCargoTypeText(row.cargoType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isDanger" label="危险品" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.isDanger" type="danger" size="small">是</el-tag>
            <span v-else style="color: #6b7280;">否</span>
          </template>
        </el-table-column>
        <el-table-column prop="isReefer" label="冷藏箱" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.isReefer" type="success" size="small">是</el-tag>
            <span v-else style="color: #6b7280;">否</span>
          </template>
        </el-table-column>
        <el-table-column prop="slotCode" label="位置" width="140" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inboundTime" label="进场时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.inboundTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="outboundTime" label="出场时间" width="180">
          <template #default="{ row }">
            {{ row.outboundTime ? formatDateTime(row.outboundTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Box,
  Search,
  Refresh
} from '@element-plus/icons-vue'
import { getContainerList, deleteContainer } from '@/api/container'
import { formatDateTime } from '@/utils/date'

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  containerNo: '',
  containerType: '',
  status: '',
  isDanger: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getContainerList({
      ...searchForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data.list || res.data || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error('获取集装箱列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.pageNum = 1
  fetchList()
}

function handleReset() {
  Object.assign(searchForm, {
    containerNo: '',
    containerType: '',
    status: '',
    isDanger: ''
  })
  pagination.pageNum = 1
  fetchList()
}

function handleView(row) {
  ElMessage.info('查看详情功能开发中')
}

function handleEdit(row) {
  ElMessage.info('编辑功能开发中')
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除集装箱 ${row.containerNo} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteContainer(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

function getCargoTypeText(type) {
  const map = { GENERAL: '普通货物', DANGER: '危险品', REEFER: '冷藏货物', FRAGILE: '易碎品' }
  return map[type] || type
}

function getCargoTypeTag(type) {
  const map = { GENERAL: 'info', DANGER: 'danger', REEFER: 'success', FRAGILE: 'warning' }
  return map[type] || 'info'
}

function getStatusText(status) {
  const map = { PRESENT: '在场', OUTBOUND: '已出场' }
  return map[status] || status
}

function getStatusTag(status) {
  const map = { PRESENT: 'success', OUTBOUND: 'info' }
  return map[status] || 'info'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.container-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
