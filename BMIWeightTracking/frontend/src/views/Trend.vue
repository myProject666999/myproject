<template>
  <div class="trend-page">
    <el-card>
      <div slot="header" class="card-header">
        <span>📈 体重趋势曲线</span>
        <span class="filter">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="yyyy-MM-dd" @change="loadTrend"></el-date-picker>
          <el-select v-model="maDays" style="width:130px;margin-left:10px" @change="loadTrend">
            <el-option label="7日均线" :value="7"></el-option>
            <el-option label="14日均线" :value="14"></el-option>
            <el-option label="30日均线" :value="30"></el-option>
          </el-select>
        </span>
      </div>
      <div class="stats" v-if="trend.latestWeight">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">最新体重</div>
              <div class="stat-value">{{ trend.latestWeight }} kg</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">最新 BMI</div>
              <div class="stat-value" :class="bmiClass">{{ trend.latestBmi }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">BMI状态</div>
              <div class="stat-value" :class="bmiClass">{{ bmiText }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">数据天数</div>
              <div class="stat-value">{{ trend.dates ? trend.dates.length : 0 }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div ref="chart" class="chart"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getTrend } from '../api'

export default {
  data() {
    return {
      dateRange: [],
      maDays: 7,
      trend: {},
      chart: null
    }
  },
  computed: {
    bmiText() {
      const v = parseFloat(this.trend.latestBmi)
      if (!v) return '-'
      if (v < 18.5) return '偏瘦'
      if (v < 24) return '正常'
      if (v < 28) return '偏胖'
      return '肥胖'
    },
    bmiClass() {
      const v = parseFloat(this.trend.latestBmi)
      if (!v) return ''
      if (v < 18.5) return 'text-info'
      if (v < 24) return 'text-success'
      if (v < 28) return 'text-warning'
      return 'text-error'
    }
  },
  async created() {
    const end = new Date()
    const start = new Date(); start.setDate(end.getDate() - 30)
    this.dateRange = [this.fmt(start), this.fmt(end)]
    await this.loadTrend()
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart)
    window.addEventListener('resize', this.resize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    if (this.chart) this.chart.dispose()
  },
  methods: {
    fmt(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    },
    resize() { if (this.chart) this.chart.resize() },
    async loadTrend() {
      let start = null, end = null
      if (this.dateRange && this.dateRange.length === 2) {
        start = this.dateRange[0]; end = this.dateRange[1]
      }
      const res = await getTrend(start, end, this.maDays)
      this.trend = res.data || {}
      this.$nextTick(this.renderChart)
    },
    renderChart() {
      if (!this.chart) return
      const maKey = 'ma' + this.maDays
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['体重', 'BMI', this.maDays + '日均线'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: this.trend.dates || [] },
        yAxis: [
          { type: 'value', name: '体重(kg)', position: 'left' },
          { type: 'value', name: 'BMI', position: 'right', min: 15, max: 40 }
        ],
        series: [
          { name: '体重', type: 'line', smooth: true, data: this.trend.weights || [], yAxisIndex: 0, itemStyle: { color: '#409EFF' }, areaStyle: { opacity: 0.15 } },
          { name: this.maDays + '日均线', type: 'line', smooth: true, data: this.trend[maKey] || [], yAxisIndex: 0, itemStyle: { color: '#E6A23C' } },
          { name: 'BMI', type: 'line', smooth: true, data: this.trend.bmis || [], yAxisIndex: 1, itemStyle: { color: '#67C23A' } }
        ]
      }
      this.chart.setOption(option)
    }
  }
}
</script>

<style scoped>
.trend-page { max-width: 1100px; margin: 0 auto; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.filter { display: flex; align-items: center; }
.stats { margin-bottom: 20px; }
.stat-card { background: #f5f7fa; padding: 15px; border-radius: 6px; text-align: center; }
.stat-label { color: #909399; font-size: 13px; margin-bottom: 6px; }
.stat-value { font-size: 22px; font-weight: bold; color: #303133; }
.text-success { color: #67C23A; }
.text-warning { color: #E6A23C; }
.text-error { color: #F56C6C; }
.text-info { color: #909399; }
.chart { width: 100%; height: 420px; }
</style>
