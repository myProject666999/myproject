<template>
  <div class="statistics-page">
    <div class="page-header">
      <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
      <h2 class="page-title">数据统计分析</h2>
      <el-button type="primary" @click="handleExport" :icon="Download">导出Excel</el-button>
    </div>
    
    <div v-loading="loading">
      <div class="overview-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalResponses || 0 }}</div>
                <div class="stat-label">总答卷数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div class="stat-value">{{ surveyInfo.viewCount || 0 }}</div>
                <div class="stat-label">浏览量</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div class="stat-value">{{ responseRate }}%</div>
                <div class="stat-label">响应率</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div class="stat-value">{{ avgDuration }}</div>
                <div class="stat-label">平均时长(秒)</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <div class="questions-stats">
        <div v-for="(stat, index) in questionStats" :key="stat.questionId" class="statistics-card">
          <div class="question-header">
            <span class="question-number">Q{{ index + 1 }}</span>
            <span class="question-title">{{ stat.questionTitle }}</span>
            <el-tag type="info" size="small">{{ getQuestionTypeLabel(stat.questionType) }}</el-tag>
          </div>
          
          <div class="chart-container" v-if="['single', 'multi'].includes(stat.questionType)">
            <v-chart class="chart" :option="getChartOption(stat)" autoresize />
          </div>
          
          <div class="stats-table" v-else-if="stat.questionType === 'score'">
            <el-table :data="getScoreTableData(stat)" style="width: 100%">
              <el-table-column prop="item" label="评分项" />
              <el-table-column prop="avg" label="平均分" />
              <el-table-column prop="count" label="评分人数" />
            </el-table>
          </div>
          
          <div class="stats-summary" v-else>
            <p>共收到 <strong>{{ stat.totalCount }}</strong> 条回答</p>
            <div v-if="stat.answerCounts" class="answer-distribution">
              <div v-for="(count, answer) in stat.answerCounts" :key="answer" class="distribution-item">
                <span class="answer-text">{{ answer }}</span>
                <el-progress :percentage="getPercentage(count, stat.totalCount)" :stroke-width="8" />
                <span class="count-text">{{ count }} 条 ({{ getPercentage(count, stat.totalCount) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="responses-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>答卷明细</span>
            </div>
          </template>
          <el-table :data="responses" v-loading="loadingResponses" style="width: 100%">
            <el-table-column prop="submitTime" label="提交时间" width="180" />
            <el-table-column prop="duration" label="时长(秒)" width="100" />
            <el-table-column prop="ipAddress" label="IP地址" width="140" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewResponse(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="responsePage"
              v-model:page-size="pageSize"
              :total="responseTotal"
              layout="total, prev, pager, next"
              @current-change="fetchResponses"
            />
          </div>
        </el-card>
      </div>
    </div>
    
    <el-dialog v-model="responseDialogVisible" title="答卷详情" width="600px">
      <div v-if="currentResponse" class="response-detail">
        <div class="response-info">
          <p><strong>提交时间：</strong>{{ currentResponse.submitTime }}</p>
          <p><strong>填写时长：</strong>{{ currentResponse.duration }} 秒</p>
          <p><strong>IP地址：</strong>{{ currentResponse.ipAddress }}</p>
        </div>
        <el-divider />
        <div v-for="(answer, index) in currentResponseAnswers" :key="index" class="answer-item">
          <p class="answer-question">{{ index + 1 }}. {{ answer.questionTitle }}</p>
          <p class="answer-content">{{ formatAnswer(answer) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { getSurvey } from '@/api/survey'
import { getStatistics, getResponses, exportExcel } from '@/api/answer'

use([CanvasRenderer, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const route = useRoute()
const router = useRouter()
const surveyId = computed(() => route.params.id)

const loading = ref(false)
const loadingResponses = ref(false)
const statistics = ref({})
const surveyInfo = ref({})
const questionStats = ref([])
const responses = ref([])
const responseTotal = ref(0)
const responsePage = ref(1)
const pageSize = ref(10)
const responseDialogVisible = ref(false)
const currentResponse = ref(null)
const currentResponseAnswers = ref([])

const responseRate = computed(() => {
  if (!surveyInfo.value.viewCount) return 0
  return ((statistics.value.totalResponses || 0) / surveyInfo.value.viewCount * 100).toFixed(1)
})

const avgDuration = computed(() => {
  if (!responses.value.length) return 0
  const total = responses.value.reduce((sum, r) => sum + (r.duration || 0), 0)
  return Math.round(total / responses.value.length)
})

function getQuestionTypeLabel(type) {
  const map = { single: '单选题', multi: '多选题', input: '填空题', score: '评分题', rating: '量表题', date: '日期题' }
  return map[type] || type
}

function getChartOption(stat) {
  const data = Object.entries(stat.answerCounts || {}).map(([name, value]) => ({ name, value }))
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{
      type: stat.questionType === 'multi' ? 'bar' : 'pie',
      radius: stat.questionType === 'single' ? '60%' : undefined,
      data: data,
      label: { show: true, formatter: '{b}\n{d}%' },
      barWidth: '50%'
    }]
  }
}

function getScoreTableData(stat) {
  if (!stat.scoreStats) return []
  return Object.entries(stat.scoreStats).map(([item, data]) => ({
    item,
    avg: data.avg?.toFixed(2) || 0,
    count: data.count || 0
  }))
}

function getPercentage(count, total) {
  if (!total) return 0
  return ((count / total) * 100).toFixed(1)
}

function formatAnswer(answer) {
  if (Array.isArray(answer.answerContent)) return answer.answerContent.join(', ')
  if (typeof answer.answerContent === 'object') return JSON.stringify(answer.answerContent)
  return answer.answerContent || '-'
}

async function loadStatistics() {
  loading.value = true
  try {
    const [surveyRes, statsRes] = await Promise.all([
      getSurvey(surveyId.value),
      getStatistics(surveyId.value)
    ])
    surveyInfo.value = surveyRes.data
    statistics.value = statsRes.data
    questionStats.value = statsRes.data.questionStats || []
  } catch (e) {
  } finally {
    loading.value = false
  }
}

async function fetchResponses() {
  loadingResponses.value = true
  try {
    const res = await getResponses(surveyId.value, { current: responsePage.value, size: pageSize.value })
    responses.value = res.data.records || res.data || []
    responseTotal.value = res.data.total || 0
  } catch (e) {
  } finally {
    loadingResponses.value = false
  }
}

function viewResponse(response) {
  currentResponse.value = response
  currentResponseAnswers.value = response.answers || []
  responseDialogVisible.value = true
}

async function handleExport() {
  try {
    const res = await exportExcel(surveyId.value)
    const blob = new Blob([res], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${surveyInfo.value.title || '问卷统计'}_${Date.now()}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
  }
}

function goBack() {
  router.push('/surveys')
}

onMounted(() => {
  loadStatistics()
  fetchResponses()
})
</script>

<style scoped lang="scss">
.statistics-page {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  .page-title {
    flex: 1;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }
}
.overview-section {
  margin-bottom: 24px;
}
.stat-card {
  :deep(.el-card__body) {
    padding: 24px;
  }
  .stat-content {
    text-align: center;
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #409EFF;
      margin-bottom: 8px;
    }
    .stat-label {
      color: #909399;
      font-size: 14px;
    }
  }
}
.questions-stats {
  margin-bottom: 24px;
}
.statistics-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  .question-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
    .question-number {
      font-weight: 600;
      color: #409EFF;
    }
    .question-title {
      flex: 1;
      font-size: 16px;
      color: #303133;
    }
  }
}
.chart-container {
  height: 320px;
  .chart {
    height: 100%;
  }
}
.stats-summary {
  .answer-distribution {
    margin-top: 16px;
  }
  .distribution-item {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    .answer-text {
      width: 150px;
      color: #606266;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .count-text {
      width: 120px;
      color: #909399;
      font-size: 12px;
    }
  }
}
.responses-section {
  .card-header {
    font-weight: 600;
  }
}
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.response-detail {
  .response-info {
    color: #606266;
    p { margin-bottom: 8px; }
  }
  .answer-item {
    margin-bottom: 16px;
    .answer-question {
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }
    .answer-content {
      color: #606266;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }
}
</style>
