<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">审计日志</span>
    </div>

    <el-form :inline="true" class="search-bar" size="default">
      <el-form-item label="模块">
        <el-select v-model="queryParams.module" placeholder="请选择模块" clearable style="width: 160px;">
          <el-option label="工单管理" value="order" />
          <el-option label="评审管理" value="review" />
          <el-option label="执行管理" value="execution" />
          <el-option label="系统管理" value="system" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作类型">
        <el-select v-model="queryParams.operation" placeholder="请选择操作类型" clearable style="width: 160px;">
          <el-option label="创建" value="create" />
          <el-option label="更新" value="update" />
          <el-option label="删除" value="delete" />
          <el-option label="评审" value="review" />
          <el-option label="执行" value="execute" />
          <el-option label="回滚" value="rollback" />
          <el-option label="取消" value="cancel" />
          <el-option label="提交" value="submit" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe v-loading="loading">
      <el-table-column prop="logNo" label="日志编号" width="200" />
      <el-table-column prop="userName" label="操作人" width="100" />
      <el-table-column prop="module" label="模块" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ getModuleText(row.module) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operation" label="操作" width="100">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ getOperationText(row.operation) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="targetTitle" label="目标标题" show-overflow-tooltip />
      <el-table-column prop="changeDetail" label="变更详情" show-overflow-tooltip />
      <el-table-column prop="ipAddress" label="IP地址" width="140" />
      <el-table-column prop="operationTime" label="操作时间" width="180" />
    </el-table>

    <el-pagination
      class="pagination"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAuditLogList } from '@/api/audit'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  module: '',
  operation: ''
})

const getModuleText = (m) => {
  const map = {
    order: '工单管理',
    review: '评审管理',
    execution: '执行管理',
    system: '系统管理'
  }
  return map[m] || m
}

const getOperationText = (o) => {
  const map = {
    create: '创建',
    update: '更新',
    delete: '删除',
    review: '评审',
    execute: '执行',
    rollback: '回滚',
    cancel: '取消',
    submit: '提交'
  }
  return map[o] || o
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAuditLogList(queryParams)
    tableData.value = res.data.records || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.pageNum = 1
  queryParams.pageSize = 20
  queryParams.module = ''
  queryParams.operation = ''
  loadData()
}

const handleSizeChange = (size) => {
  queryParams.pageSize = size
  loadData()
}

const handleCurrentChange = (page) => {
  queryParams.pageNum = page
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
