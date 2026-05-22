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
          <div class="page-title">报告列表</div>
          <el-button type="primary" icon="el-icon-plus" @click="goToAdd">新增报告</el-button>
        </div>
        <div class="card-container">
          <el-table
            :data="reportList"
            style="width: 100%"
            v-loading="loading"
            @row-click="goToDetail">
            <el-table-column prop="examDate" label="体检日期" width="120">
              <template slot-scope="scope">
                {{ formatDate(scope.row.examDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="hospital" label="体检医院" />
            <el-table-column prop="reportNo" label="报告编号" width="150" />
            <el-table-column prop="fileName" label="报告文件" show-overflow-tooltip />
            <el-table-column prop="indicatorCount" label="指标数" width="100" align="center" />
            <el-table-column prop="abnormalCount" label="异常数" width="100" align="center">
              <template slot-scope="scope">
                <span :class="scope.row.abnormalCount > 0 ? 'status-high' : 'status-normal'">
                  {{ scope.row.abnormalCount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="overallResult" label="总体结论" show-overflow-tooltip />
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click.stop="goToDetail(scope.row)">查看</el-button>
                <el-button size="mini" type="danger" @click.stop="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && reportList.length === 0" description="暂无报告数据" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getReportList, deleteReport } from '../api/report'

export default {
  name: 'ReportList',
  data() {
    return {
      userId: 1,
      reportList: [],
      loading: false
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.loading = true
      getReportList(this.userId).then(res => {
        this.reportList = res.data || []
      }).finally(() => {
        this.loading = false
      })
    },
    goToAdd() {
      this.$router.push('/report/add')
    },
    goToDetail(row) {
      this.$router.push(`/report/detail/${row.id}`)
    },
    handleDelete(row) {
      this.$confirm('确定要删除该报告及其所有指标数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteReport(row.id).then(res => {
          if (res.data) {
            this.$message.success('删除成功')
            this.loadData()
          }
        })
      }).catch(() => {})
    },
    formatDate(date) {
      if (!date) return ''
      return date.replace(/-/g, '/')
    }
  }
}
</script>
