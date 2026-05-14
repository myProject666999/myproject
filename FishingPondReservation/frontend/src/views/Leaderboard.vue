<template>
  <div class="leaderboard-page">
    <el-card>
      <div slot="header">
        <span style="font-size: 18px; font-weight: bold;">🏆 钓友排行榜</span>
      </div>

      <el-tabs v-model="activeTab" @tab-click="loadData">
        <el-tab-pane label="今日排行" name="today"></el-tab-pane>
        <el-tab-pane label="本周排行" name="week"></el-tab-pane>
        <el-tab-pane label="本月排行" name="month"></el-tab-pane>
      </el-tabs>

      <el-table :data="leaderboard" border>
        <el-table-column prop="ranking" label="排名" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.ranking === 1" style="color: #ffd700; font-size: 24px;">🥇</span>
            <span v-else-if="scope.row.ranking === 2" style="color: #c0c0c0; font-size: 24px;">🥈</span>
            <span v-else-if="scope.row.ranking === 3" style="color: #cd7f32; font-size: 24px;">🥉</span>
            <span v-else style="font-size: 18px; font-weight: bold;">{{ scope.row.ranking }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="钓友" width="150"></el-table-column>
        <el-table-column prop="totalWeight" label="总重量(kg)" width="150">
          <template slot-scope="scope">
            <span style="font-weight: bold; color: #409EFF;">{{ scope.row.totalWeight }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalValue" label="总价值(元)" width="150">
          <template slot-scope="scope">
            <span style="color: #f56c6c;">¥{{ scope.row.totalValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fishCount" label="渔获数量" width="120"></el-table-column>
      </el-table>

      <el-empty description="暂无排行数据" v-if="leaderboard.length === 0"></el-empty>
    </el-card>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Leaderboard',
  data() {
    return {
      activeTab: 'today',
      leaderboard: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        let url = '/leaderboard/today'
        if (this.activeTab === 'week') url = '/leaderboard/week'
        if (this.activeTab === 'month') url = '/leaderboard/month'
        const res = await request.get(url)
        this.leaderboard = res.data
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.leaderboard-page {
  padding: 10px;
}
</style>
