<template>
  <div>
    <div class="page-header">
      <div class="page-title">闸机记录</div>
    </div>

    <div class="search-form">
      <el-input v-model="searchForm.gateNo" placeholder="闸机编号" style="width: 150px;" clearable></el-input>
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
        <el-table-column prop="gateNo" label="闸机编号" width="120"></el-table-column>
        <el-table-column prop="inTime" label="入场时间" width="180"></el-table-column>
        <el-table-column prop="outTime" label="出场时间" width="180"></el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '在场' : '已离场' }}
            </el-tag>
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
import { getGateRecords } from '@/api/gate'

const loading = ref(false)

const searchForm = reactive({
  gateNo: '',
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
      gateNo: searchForm.gateNo || undefined
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    const res = await getGateRecords(params)
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
