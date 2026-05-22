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
          <div class="page-title">年度对比</div>
        </div>

        <div class="card-container" style="margin-bottom: 20px;">
          <el-form :inline="true">
            <el-form-item label="对比年份">
              <el-select v-model="currentYear" placeholder="选择年份" style="width: 150px" @change="loadCompare">
                <el-option v-for="year in availableYears" :key="year" :label="year + '年'" :value="year" />
              </el-select>
            </el-form-item>
            <el-form-item label="与">
              <el-select v-model="previousYear" placeholder="选择年份" style="width: 150px" @change="loadCompare">
                <el-option
                  v-for="year in availableYears.filter(y => y !== currentYear)"
                  :key="year"
                  :label="year + '年'"
                  :value="year" />
              </el-select>
            </el-form-item>
            <el-form-item label="年对比">
              <el-button type="primary" @click="loadCompare">查询</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-if="compareData.length > 0" class="card-container">
          <el-table :data="compareData" border stripe>
            <el-table-column prop="indicatorName" label="指标名称" width="150" fixed />
            <el-table-column label="当前年度" align="center">
              <template slot-scope="scope">
                <div>
                  <span :class="getStatusClass(scope.row.currentResultStatus)">
                    {{ scope.row.currentYearValue }}
                  </span>
                  <span v-if="scope.row.valueUnit" style="font-size: 12px; color: #909399;">
                    {{ scope.row.valueUnit }}
                  </span>
                </div>
                <div style="font-size: 12px; color: #909399;">
                  {{ formatDate(scope.row.currentExamDate) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="对比年度" align="center">
              <template slot-scope="scope">
                <div>
                  <span :class="getStatusClass(scope.row.previousResultStatus)">
                    {{ scope.row.previousYearValue }}
                  </span>
                  <span v-if="scope.row.valueUnit" style="font-size: 12px; color: #909399;">
                    {{ scope.row.valueUnit }}
                  </span>
                </div>
                <div style="font-size: 12px; color: #909399;">
                  {{ formatDate(scope.row.previousExamDate) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="变化值" align="center">
              <template slot-scope="scope">
                <span :class="getChangeClass(scope.row.changeValue)">
                  {{ scope.row.changeValue > 0 ? '+' : '' }}{{ scope.row.changeValue }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="变化率" align="center">
              <template slot-scope="scope">
                <span :class="getChangeClass(scope.row.changeValue)">
                  {{ scope.row.changeRate > 0 ? '+' : '' }}{{ scope.row.changeRate }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="referenceRange" label="参考范围" width="150" />
          </el-table>
        </div>

        <el-empty v-if="!loading && compareData.length === 0" description="请选择年份进行对比" />
      </div>
    </div>
  </div>
</template>

<script>
import { getYearCompare } from '../api/indicator'
import { getAvailableYears } from '../api/report'

export default {
  name: 'YearCompare',
  data() {
    return {
      userId: 1,
      availableYears: [],
      currentYear: null,
      previousYear: null,
      compareData: [],
      loading: false
    }
  },
  created() {
    this.loadYears()
  },
  methods: {
    loadYears() {
      getAvailableYears(this.userId).then(res => {
        this.availableYears = res.data || []
        if (this.availableYears.length >= 2) {
          this.currentYear = this.availableYears[0]
          this.previousYear = this.availableYears[1]
          this.loadCompare()
        }
      })
    },
    loadCompare() {
      if (!this.currentYear || !this.previousYear) return
      this.loading = true
      getYearCompare(this.userId, this.currentYear, this.previousYear).then(res => {
        this.compareData = res.data || []
      }).finally(() => {
        this.loading = false
      })
    },
    getStatusClass(status) {
      if (status === 1) return 'status-high'
      if (status === 2) return 'status-low'
      return 'status-normal'
    },
    getChangeClass(value) {
      if (value > 0) return 'status-high'
      if (value < 0) return 'status-low'
      return 'status-normal'
    },
    formatDate(date) {
      if (!date) return ''
      return date.replace(/-/g, '/')
    }
  }
}
</script>
