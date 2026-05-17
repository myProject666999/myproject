<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF;">
              <i class="el-icon-user"></i>
            </div>
            <div class="stat-info">
              <div class="stat-title">客户总数</div>
              <div class="stat-value">{{ stats.customerCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67C23A;">
              <i class="el-icon-folder-opened"></i>
            </div>
            <div class="stat-info">
              <div class="stat-title">项目总数</div>
              <div class="stat-value">{{ stats.projectCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C;">
              <i class="el-icon-s-custom"></i>
            </div>
            <div class="stat-info">
              <div class="stat-title">工人总数</div>
              <div class="stat-value">{{ stats.workerCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #F56C6C;">
              <i class="el-icon-goods"></i>
            </div>
            <div class="stat-info">
              <div class="stat-title">材料种类</div>
              <div class="stat-value">{{ stats.materialCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">项目状态分布</div>
          <div ref="projectChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">最近项目</div>
          <el-table :data="recentProjects" border>
            <el-table-column prop="projectName" label="项目名称"></el-table-column>
            <el-table-column prop="projectAddress" label="项目地址"></el-table-column>
            <el-table-column prop="status" label="状态">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { customerApi, projectApi, workerApi, materialApi } from '../api'

export default {
  name: 'Home',
  data() {
    return {
      stats: {
        customerCount: 0,
        projectCount: 0,
        workerCount: 0,
        materialCount: 0
      },
      recentProjects: []
    }
  },
  mounted() {
    this.loadStats()
    this.loadRecentProjects()
  },
  methods: {
    async loadStats() {
      try {
        const [customerRes, projectRes, workerRes, materialRes] = await Promise.all([
          customerApi.list(),
          projectApi.list(),
          workerApi.list(),
          materialApi.list()
        ])
        this.stats.customerCount = customerRes.data?.length || 0
        this.stats.projectCount = projectRes.data?.length || 0
        this.stats.workerCount = workerRes.data?.length || 0
        this.stats.materialCount = materialRes.data?.length || 0
        this.initChart(projectRes.data || [])
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    },
    async loadRecentProjects() {
      try {
        const res = await projectApi.list()
        this.recentProjects = (res.data || []).slice(0, 5)
      } catch (error) {
        console.error('加载最近项目失败', error)
      }
    },
    initChart(projects) {
      const statusMap = {}
      projects.forEach(p => {
        statusMap[p.status] = (statusMap[p.status] || 0) + 1
      })
      const chart = echarts.init(this.$refs.projectChart)
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: Object.keys(statusMap).map(key => ({
            name: key,
            value: statusMap[key]
          }))
        }]
      })
    },
    getStatusType(status) {
      const typeMap = {
        '进行中': 'primary',
        '已完成': 'success',
        '暂停': 'warning',
        '已取消': 'danger'
      }
      return typeMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}
.stat-content {
  display: flex;
  align-items: center;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  margin-right: 20px;
}
.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
</style>
