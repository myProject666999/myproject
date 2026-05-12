<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>代煎工单管理</span>
          <div>
            <el-radio-group v-model="filterStatus" @change="loadData">
              <el-radio-button :value="null">全部</el-radio-button>
              <el-radio-button :value="1">待煎</el-radio-button>
              <el-radio-button :value="2">煎药中</el-radio-button>
              <el-radio-button :value="3">已完成</el-radio-button>
              <el-radio-button :value="4">已取药</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="orderNo" label="工单编号" width="180" />
        <el-table-column prop="prescriptionId" label="处方ID" width="100" />
        <el-table-column prop="decoctionType" label="煎药方式" width="120" />
        <el-table-column prop="packageCount" label="包装数" width="100" />
        <el-table-column prop="operator" label="操作人员" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="completeTime" label="完成时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button v-if="row.status === 1" type="primary" link @click="handleStart(row)">开始煎药</el-button>
            <el-button v-if="row.status === 2" type="success" link @click="handleComplete(row)">完成</el-button>
            <el-button v-if="row.status === 3" type="warning" link @click="handlePickup(row)">确认取药</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { decoctionApi } from '../api'

const filterStatus = ref(null)
const tableData = ref([])

const getStatusText = (status) => {
  const map = { 1: '待煎', 2: '煎药中', 3: '已完成', 4: '已取药' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 1: 'info', 2: 'warning', 3: 'success', 4: '' }
  return map[status] || ''
}

const loadData = async () => {
  tableData.value = await decoctionApi.list(filterStatus.value) || []
}

const handleStart = (row) => {
  ElMessageBox.confirm('确认开始煎药？', '提示', { type: 'info' }).then(async () => {
    await decoctionApi.start(row.id)
    ElMessage.success('已开始煎药')
    loadData()
  }).catch(() => {})
}

const handleComplete = (row) => {
  ElMessageBox.confirm('确认煎药完成？', '提示', { type: 'success' }).then(async () => {
    await decoctionApi.complete(row.id)
    ElMessage.success('煎药已完成')
    loadData()
  }).catch(() => {})
}

const handlePickup = (row) => {
  ElMessageBox.confirm('确认患者已取药？', '提示', { type: 'warning' }).then(async () => {
    await decoctionApi.pickup(row.id)
    ElMessage.success('已确认取药')
    loadData()
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该工单吗？', '提示', { type: 'warning' }).then(async () => {
    await decoctionApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container { padding-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
