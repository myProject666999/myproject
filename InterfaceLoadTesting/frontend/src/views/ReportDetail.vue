<template>
  <div class="report-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报告详情 - {{ report?.name || '加载中...' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-row :gutter="20" class="stat-row">
        <el-col :span="4" v-for="(item, index) in stats" :key="index">
          <div class="stat-item">
            <div class="stat-label">{{ item.label }}</div>
            <div class="stat-value">{{ item.value }}</div>
          </div>
        </el-col>
      </el-row>

      <el-descriptions :column="3" border style="margin-top: 20px">
        <el-descriptions-item label="总请求数">{{ report?.total_requests }}</el-descriptions-item>
        <el-descriptions-item label="成功请求">{{ report?.success_requests }}</el-descriptions-item>
        <el-descriptions-item label="失败请求">{{ report?.failed_requests }}</el-descriptions-item>
        <el-descriptions-item label="平均QPS">{{ report?.avg_qps?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="峰值QPS">{{ report?.peak_qps }}</el-descriptions-item>
        <el-descriptions-item label="错误率">{{ report?.error_rate }}%</el-descriptions-item>
        <el-descriptions-item label="平均响应时间">{{ report?.avg_rt }} ms</el-descriptions-item>
        <el-descriptions-item label="最小响应时间">{{ report?.min_rt }} ms</el-descriptions-item>
        <el-descriptions-item label="最大响应时间">{{ report?.max_rt }} ms</el-descriptions-item>
        <el-descriptions-item label="P50响应时间">{{ report?.p50_rt }} ms</el-descriptions-item>
        <el-descriptions-item label="P95响应时间">{{ report?.p95_rt }} ms</el-descriptions-item>
        <el-descriptions-item label="P99响应时间">{{ report?.p99_rt }} ms</el-descriptions-item>
        <el-descriptions-item label="测试时长">{{ report?.total_duration }} s</el-descriptions-item>
        <el-descriptions-item label="总流量">{{ (report?.bytes_total / 1024 / 1024).toFixed(2) }} MB</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ report?.created_at }}</el-descriptions-item>
      </el-descriptions>

      <el-row style="margin-top: 20px">
        <el-col :span="24">
          <el-card>
            <template #header><span>生成基线</span></template>
            <el-form :inline="true" :model="baselineForm" label-width="80px">
              <el-form-item label="基线名称">
                <el-input v-model="baselineForm.name" placeholder="请输入基线名称" style="width: 200px" />
              </el-form-item>
              <el-form-item label="QPS阈值%">
                <el-input-number v-model="baselineForm.threshold_qps" :min="0" :max="100" :precision="2" />
              </el-form-item>
              <el-form-item label="P95阈值ms">
                <el-input-number v-model="baselineForm.threshold_rt_p95" :min="0" />
              </el-form-item>
              <el-form-item label="错误率阈值%">
                <el-input-number v-model="baselineForm.threshold_error_rate" :min="0" :max="100" :precision="2" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="createBaseline">创建基线</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { reportApi, baselineApi } from '@/api'

const route = useRoute()
const router = useRouter()

const reportId = route.params.id
const report = ref(null)
const baselineForm = ref({
  name: '',
  threshold_qps: 10,
  threshold_rt_p95: 500,
  threshold_error_rate: 1
})

const stats = computed(() => [
  { label: '总请求数', value: report.value?.total_requests || 0 },
  { label: '平均QPS', value: report.value?.avg_qps?.toFixed(2) || 0 },
  { label: 'P95响应时间', value: `${report.value?.p95_rt || 0} ms` },
  { label: '错误率', value: `${report.value?.error_rate || 0}%` }
])

const loadReport = async () => {
  try {
    report.value = await reportApi.get(reportId)
    baselineForm.value.name = report.value.name + ' - 基线'
  } catch (e) {
    console.error(e)
  }
}

const createBaseline = async () => {
  if (!baselineForm.value.name) {
    ElMessage.warning('请输入基线名称')
    return
  }
  try {
    await baselineApi.create({
      ...baselineForm.value,
      report_id: reportId,
      is_default: 0
    })
    ElMessage.success('基线创建成功')
  } catch (e) {
    console.error(e)
  }
}

const goBack = () => {
  router.back()
}

onMounted(loadReport)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-item {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-top: 8px;
}
</style>
