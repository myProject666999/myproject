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
          <div class="page-title">指标趋势</div>
        </div>

        <div class="card-container" style="margin-bottom: 20px;">
          <el-form :inline="true">
            <el-form-item label="选择指标">
              <el-select
                v-model="selectedIndicator"
                placeholder="请选择指标"
                filterable
                style="width: 300px"
                @change="loadTrend">
                <el-option
                  v-for="name in indicatorNames"
                  :key="name"
                  :label="name"
                  :value="name" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <div v-if="trendData" class="card-container">
          <h3 style="margin-bottom: 20px;">
            {{ trendData.indicatorName }}
            <span v-if="trendData.valueUnit" style="color: #909399; font-size: 14px;">({{ trendData.valueUnit }})</span>
          </h3>
          <div ref="chartRef" class="trend-chart"></div>
          <el-table
            v-if="trendData.trendPoints && trendData.trendPoints.length > 0"
            :data="trendData.trendPoints"
            border
            size="small"
            style="margin-top: 20px;">
            <el-table-column label="体检日期" prop="examDate" width="150">
              <template slot-scope="scope">
                {{ formatDate(scope.row.examDate) }}
              </template>
            </el-table-column>
            <el-table-column label="检测结果" width="150">
              <template slot-scope="scope">
                <span :class="getStatusClass(scope.row.resultStatus)">
                  {{ scope.row.indicatorValue }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="参考范围" prop="referenceRange" width="150" />
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <span v-if="scope.row.resultStatus === 1" class="status-high">偏高</span>
                <span v-else-if="scope.row.resultStatus === 2" class="status-low">偏低</span>
                <span v-else class="status-normal">正常</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-empty v-if="!loading && !trendData" description="请选择指标查看趋势" />
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getIndicatorTrend, getDistinctIndicatorNames } from '../api/indicator'

export default {
  name: 'IndicatorTrend',
  data() {
    return {
      userId: 1,
      indicatorNames: [],
      selectedIndicator: '',
      trendData: null,
      chart: null,
      loading: false
    }
  },
  created() {
    this.loadIndicatorNames()
  },
  methods: {
    loadIndicatorNames() {
      getDistinctIndicatorNames(this.userId).then(res => {
        this.indicatorNames = res.data || []
      })
    },
    loadTrend() {
      if (!this.selectedIndicator) return
      this.loading = true
      getIndicatorTrend(this.userId, this.selectedIndicator).then(res => {
        this.trendData = res.data
        this.$nextTick(() => {
          this.initChart()
        })
      }).finally(() => {
        this.loading = false
      })
    },
    initChart() {
      if (!this.trendData || !this.trendData.trendPoints) return

      if (this.chart) {
        this.chart.dispose()
      }

      this.chart = echarts.init(this.$refs.chartRef)

      const dates = this.trendData.trendPoints.map(p => formatDate(p.examDate))
      const values = this.trendData.trendPoints.map(p => p.indicatorValue)
      const minNormal = this.trendData.minNormal
      const maxNormal = this.trendData.maxNormal

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['检测值']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates
        },
        yAxis: {
          type: 'value',
          name: this.trendData.valueUnit || ''
        },
        series: [
          {
            name: '检测值',
            type: 'line',
            smooth: true,
            data: values,
            itemStyle: {
              color: '#409eff'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            },
            markLine: {
              silent: true,
              lineStyle: {
                type: 'dashed'
              },
              data: []
            }
          }
        ]
      }

      if (maxNormal != null) {
        option.series[0].markLine.data.push({
          yAxis: maxNormal,
          name: '正常上限',
          lineStyle: { color: '#f56c6c' },
          label: { formatter: '上限 ' + maxNormal }
        })
      }

      if (minNormal != null) {
        option.series[0].markLine.data.push({
          yAxis: minNormal,
          name: '正常下限',
          lineStyle: { color: '#67c23a' },
          label: { formatter: '下限 ' + minNormal }
        })
      }

      this.chart.setOption(option)

      window.addEventListener('resize', () => {
        if (this.chart) {
          this.chart.resize()
        }
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
    }
  }
}

function formatDate(date) {
  if (!date) return ''
  return date.replace(/-/g, '/')
}
</script>
