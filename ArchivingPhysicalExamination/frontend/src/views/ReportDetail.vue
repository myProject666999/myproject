<template>
  <div class="layout-container">
    <div class="sidebar">
      <div class="sidebar-header">体检报告归档</div>
      <ul class="sidebar-menu">
        <li :class="{ active: $route.path === '/report' }">
          <router-link to="/report">报告列表</router-link>
        </li>
        <li :class="{ active: $route.path === '/trend' }">
          <router-link to="/trend">指标趋势</router-link>
        </li>
        <li :class="{ active: $route.path === '/compare' }">
          <router-link to="/compare">年度对比</router-link>
        </li>
        <li :class="{ active: $route.path === '/rule' }">
          <router-link to="/rule">异常规则</router-link>
        </li>
      </ul>
    </div>
    <div class="main-content">
      <div class="page-container">
        <div class="page-header">
          <div class="page-title">报告详情</div>
          <el-button @click="goBack">返回</el-button>
        </div>

        <div v-if="reportDetail" v-loading="loading">
          <el-row :gutter="20">
            <el-col :span="16">
              <div class="card-container" style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px;">基本信息</h3>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="体检日期">{{ formatDate(reportDetail.examDate) }}</el-descriptions-item>
                  <el-descriptions-item label="体检医院">{{ reportDetail.hospital || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="报告编号">{{ reportDetail.reportNo || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="体检医生">{{ reportDetail.doctor || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="报告文件">
                    <span v-if="reportDetail.fileName">{{ reportDetail.fileName }}</span>
                    <span v-else>-</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="备注">{{ reportDetail.remark || '-' }}</el-descriptions-item>
                </el-descriptions>
                <div v-if="reportDetail.overallResult" style="margin-top: 15px;">
                  <div style="color: #909399; margin-bottom: 5px;">总体结论</div>
                  <div>{{ reportDetail.overallResult }}</div>
                </div>
              </div>

              <div class="card-container">
                <h3 style="margin-bottom: 15px;">体检指标</h3>
                <el-tabs v-model="activeTab">
                  <el-tab-pane label="全部指标" name="all">
                    <el-table :data="reportDetail.indicators" border size="small">
                      <el-table-column prop="indicatorName" label="指标名称" width="150" />
                      <el-table-column label="检测结果" width="150">
                        <template slot-scope="scope">
                          <span :class="getStatusClass(scope.row.resultStatus)">
                            {{ scope.row.indicatorValue }}
                            <span v-if="scope.row.valueUnit" style="font-size: 12px;">{{ scope.row.valueUnit }}</span>
                          </span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="referenceRange" label="参考范围" width="150" />
                      <el-table-column label="状态" width="100">
                        <template slot-scope="scope">
                          <span v-if="scope.row.isAbnormal === 1" :class="getStatusClass(scope.row.resultStatus)">
                            {{ scope.row.resultStatus === 1 ? '偏高' : '偏低' }}
                          </span>
                          <span v-else class="status-normal">正常</span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                  <el-tab-pane
                    v-for="(indicators, category) in reportDetail.indicatorsByCategory"
                    :key="category"
                    :label="category"
                    :name="category">
                    <el-table :data="indicators" border size="small">
                      <el-table-column prop="indicatorName" label="指标名称" width="150" />
                      <el-table-column label="检测结果" width="150">
                        <template slot-scope="scope">
                          <span :class="getStatusClass(scope.row.resultStatus)">
                            {{ scope.row.indicatorValue }}
                            <span v-if="scope.row.valueUnit" style="font-size: 12px;">{{ scope.row.valueUnit }}</span>
                          </span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="referenceRange" label="参考范围" width="150" />
                      <el-table-column label="状态" width="100">
                        <template slot-scope="scope">
                          <span v-if="scope.row.isAbnormal === 1" :class="getStatusClass(scope.row.resultStatus)">
                            {{ scope.row.resultStatus === 1 ? '偏高' : '偏低' }}
                          </span>
                          <span v-else class="status-normal">正常</span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-col>

            <el-col :span="8">
              <div class="card-container" v-if="reportDetail.abnormalIndicators && reportDetail.abnormalIndicators.length > 0">
                <h3 style="margin-bottom: 15px; color: #f56c6c;">
                  <i class="el-icon-warning-outline"></i> 异常提醒
                  <el-badge :value="reportDetail.abnormalIndicators.length" class="badge-item" />
                </h3>
                <div
                  v-for="item in reportDetail.abnormalIndicators"
                  :key="item.indicatorId"
                  class="abnormal-item">
                  <div class="abnormal-header">
                    <span class="abnormal-name">{{ item.indicatorName }}</span>
                    <span :class="`warning-level-${item.warningLevel || 1}`">
                      {{ item.resultStatus === 1 ? '偏高' : '偏低' }}
                    </span>
                  </div>
                  <div class="abnormal-value">
                    <span :class="getStatusClass(item.resultStatus)">
                      {{ item.indicatorValue }}
                      <span v-if="item.valueUnit" style="font-size: 12px;">{{ item.valueUnit }}</span>
                    </span>
                    <span style="color: #909399; margin-left: 10px;">参考: {{ item.referenceRange }}</span>
                  </div>
                  <div v-if="item.description" class="abnormal-desc">
                    <i class="el-icon-info"></i> {{ item.description }}
                  </div>
                  <div v-if="item.suggestion" class="abnormal-suggestion">
                    <i class="el-icon-s-check"></i> 建议: {{ item.suggestion }}
                  </div>
                </div>
              </div>
              <div v-else class="card-container">
                <h3 style="margin-bottom: 15px;">
                  <i class="el-icon-success" style="color: #67c23a;"></i> 健康状况良好
                </h3>
                <p style="color: #909399;">本次体检未发现异常指标，请继续保持健康的生活方式。</p>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-empty v-if="!loading && !reportDetail" description="报告不存在" />
      </div>
    </div>
  </div>
</template>

<script>
import { getReportDetail } from '../api/report'

export default {
  name: 'ReportDetail',
  data() {
    return {
      reportId: null,
      reportDetail: null,
      loading: false,
      activeTab: 'all'
    }
  },
  created() {
    this.reportId = this.$route.params.id
    this.loadData()
  },
  methods: {
    loadData() {
      this.loading = true
      getReportDetail(this.reportId).then(res => {
        this.reportDetail = res.data
      }).finally(() => {
        this.loading = false
      })
    },
    getStatusClass(status) {
      if (status === 1) return 'status-high'
      if (status === 2) return 'status-low'
      return 'status-normal'
    },
    formatDate(date) {
      if (!date) return ''
      return date.replace(/-/g, '/')
    },
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.abnormal-item {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.abnormal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.abnormal-name {
  font-weight: 600;
  font-size: 16px;
}

.abnormal-value {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
}

.abnormal-desc {
  color: #606266;
  margin-bottom: 5px;
  font-size: 13px;
}

.abnormal-suggestion {
  color: #67c23a;
  font-size: 13px;
}

.badge-item {
  margin-left: 10px;
}
</style>
