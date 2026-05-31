<template>
  <div class="baselines-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>基线管理</span>
        </div>
      </template>
      <el-table :data="baselines" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="基线名称" min-width="150" show-overflow-tooltip />
        <el-table-column label="默认" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.is_default" type="success" size="small">是</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="150" show-overflow-tooltip />
        <el-table-column prop="method" label="方法" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="QPS阈值" width="100">
          <template #default="{ row }">{{ row.threshold_qps ?? '-' }}%</template>
        </el-table-column>
        <el-table-column label="P95阈值" width="100">
          <template #default="{ row }">{{ row.threshold_rt_p95 ?? '-' }}ms</template>
        </el-table-column>
        <el-table-column label="错误率阈值" width="120">
          <template #default="{ row }">{{ row.threshold_error_rate ?? '-' }}%</template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="compare(row)">对比</el-button>
            <el-button size="small" type="danger" @click="deleteBaseline(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        style="margin-top: 20px; justify-content: flex-end; display: flex"
        @size-change="loadBaselines"
        @current-change="loadBaselines"
      />
    </el-card>

    <el-dialog v-model="showCompareDialog" title="基线对比" width="600px">
      <el-form :model="compareForm" label-width="100px">
        <el-form-item label="选择报告">
          <el-select v-model="compareForm.report_id" style="width: 100%">
            <el-option v-for="r in reports" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCompareDialog = false">取消</el-button>
        <el-button type="primary" @click="doCompare">开始对比</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { baselineApi, reportApi } from '@/api'

const loading = ref(false)
const baselines = ref([])
const reports = ref([])
const pagination = ref({ page: 1, size: 10, total: 0 })
const showCompareDialog = ref(false)
const compareForm = ref({ report_id: null })
const currentBaseline = ref(null)

const loadBaselines = async () => {
  loading.value = true
  try {
    const res = await baselineApi.list({ page: pagination.value.page, page_size: pagination.value.size })
    baselines.value = res.list || []
    pagination.value.total = res.total || 0
  } finally {
    loading.value = false
  }
}

const loadReports = async () => {
  try {
    const res = await reportApi.list({ page: 1, page_size: 100 })
    reports.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

const compare = (row) => {
  currentBaseline.value = row
  compareForm.value.report_id = null
  loadReports()
  showCompareDialog.value = true
}

const doCompare = async () => {
  if (!compareForm.value.report_id) {
    ElMessage.warning('请选择报告')
    return
  }
  try {
    await baselineApi.compare({
      baseline_id: currentBaseline.value.id,
      report_id: compareForm.value.report_id
    })
    ElMessage.success('对比完成')
    showCompareDialog.value = false
  } catch (e) {
    console.error(e)
  }
}

const deleteBaseline = async (row) => {
  await ElMessageBox.confirm('确定删除该基线吗？', '提示', { type: 'warning' })
  await baselineApi.remove(row.id)
  ElMessage.success('删除成功')
  loadBaselines()
}

onMounted(loadBaselines)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
