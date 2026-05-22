<template>
  <div class="page-container">
    <div class="card-header">
      <span class="card-title">复诊提醒</span>
      <el-radio-group v-model="filterStatus" size="default" @change="loadData">
        <el-radio-button :value="null">全部</el-radio-button>
        <el-radio-button :value="0">待提醒</el-radio-button>
        <el-radio-button :value="1">已提醒</el-radio-button>
        <el-radio-button :value="2">已完成</el-radio-button>
      </el-radio-group>
    </div>

    <el-card>
      <el-table :data="reminders" stripe>
        <el-table-column prop="remindDate" label="提醒日期" width="140" />
        <el-table-column prop="memberId" label="成员ID" width="100" />
        <el-table-column prop="content" label="提醒内容" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 2 ? 'success' : row.status === 1 ? 'info' : 'warning'" size="small">
              {{ row.status === 0 ? '待提醒' : row.status === 1 ? '已提醒' : '已完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button v-if="row.status !== 1" type="primary" link size="small" @click="markStatus(row.id, 1)">标记已提醒</el-button>
            <el-button v-if="row.status !== 2" type="success" link size="small" @click="markStatus(row.id, 2)">标记已完成</el-button>
            <el-button type="danger" link size="small" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reminderApi } from '../api'

const reminders = ref([])
const filterStatus = ref(null)

const loadData = async () => {
  const res = await reminderApi.list({})
  let list = res.data || []
  if (filterStatus.value !== null) {
    list = list.filter(r => r.status === filterStatus.value)
  }
  reminders.value = list
}

const markStatus = async (id, status) => {
  await reminderApi.updateStatus(id, status)
  ElMessage.success('状态更新成功')
  loadData()
}

const remove = row => {
  ElMessageBox.confirm('确定删除该提醒？', '提示', { type: 'warning' }).then(async () => {
    await reminderApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(loadData)
</script>
