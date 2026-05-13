<template>
  <div>
    <div class="page-header">
      <div class="page-title">续卡提醒</div>
      <el-button type="primary" @click="handleGenerate">
        <el-icon><Refresh /></el-icon>
        生成提醒
      </el-button>
    </div>

    <div class="search-form">
      <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px;" clearable>
        <el-option label="未发送" :value="0"></el-option>
        <el-option label="已发送" :value="1"></el-option>
      </el-select>
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px;"
      ></el-date-picker>
      <el-button type="primary" @click="loadData">
        <el-icon><Search /></el-icon>
        查询
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column label="用户ID" prop="userId" width="100"></el-table-column>
        <el-table-column label="会员卡ID" prop="cardId" width="120"></el-table-column>
        <el-table-column prop="reminderType" label="提醒类型">
          <template #default="{ row }">
            <el-tag :type="row.reminderType === '即将过期' ? 'warning' : 'danger'">
              {{ row.reminderType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reminderDate" label="提醒日期" width="150"></el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : 'success'">
              {{ row.status === 0 ? '未发送' : '已发送' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleMarkAsSent(row)" v-if="row.status === 0">
              标记已发送
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReminders, markAsSent, generateReminders } from '@/api/reminder'

const loading = ref(false)

const searchForm = reactive({
  status: null,
  dateRange: []
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      status: searchForm.status
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    const res = await getReminders(params)
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleGenerate = () => {
  ElMessageBox.confirm('确定要生成续卡提醒吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await generateReminders()
    ElMessage.success('生成成功')
    loadData()
  }).catch(() => {})
}

const handleMarkAsSent = (row) => {
  ElMessageBox.confirm('确定要标记为已发送吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await markAsSent(row.id)
    ElMessage.success('操作成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
