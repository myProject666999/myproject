<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon blue">
            <i class="el-icon-date"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.reservations }}</h3>
            <p>今日预订</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon green">
            <i class="el-icon-shopping-cart-2"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.orders }}</h3>
            <p>今日订单</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon orange">
            <i class="el-icon-balance-scale"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.catchWeight }}kg</h3>
            <p>今日渔获</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon red">
            <i class="el-icon-user"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.users }}</h3>
            <p>注册用户</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span style="font-weight: bold;">🏆 今日钓友排行</span>
          </div>
          <el-table :data="leaderboard" border>
            <el-table-column prop="ranking" label="排名" width="80"></el-table-column>
            <el-table-column prop="nickname" label="钓友"></el-table-column>
            <el-table-column prop="totalWeight" label="重量(kg)" width="120">
              <template slot-scope="scope">
                <span style="color: #409EFF; font-weight: bold;">{{ scope.row.totalWeight }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalValue" label="价值(元)" width="120">
              <template slot-scope="scope">
                <span style="color: #f56c6c;">¥{{ scope.row.totalValue }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty description="暂无数据" v-if="leaderboard.length === 0"></el-empty>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span style="font-weight: bold;">🎣 实时渔获</span>
          </div>
          <el-table :data="todayCatch" border>
            <el-table-column prop="fishType" label="鱼种" width="120"></el-table-column>
            <el-table-column prop="weight" label="重量(kg)" width="100">
              <template slot-scope="scope">
                <span style="color: #409EFF; font-weight: bold;">{{ scope.row.weight }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="价值(元)" width="100">
              <template slot-scope="scope">
                <span style="color: #f56c6c;">¥{{ scope.row.totalPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="weighTime" label="时间"></el-table-column>
          </el-table>
          <el-empty description="暂无数据" v-if="todayCatch.length === 0"></el-empty>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import request from '../../utils/request'

export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {
        reservations: 0,
        orders: 0,
        catchWeight: 0,
        users: 0
      },
      leaderboard: [],
      todayCatch: [],
      timer: null
    }
  },
  mounted() {
    this.loadData()
    this.timer = setInterval(() => this.loadData(), 10000)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    async loadData() {
      try {
        const [users, lb, tc] = await Promise.all([
          request.get('/user/list'),
          request.get('/leaderboard/today'),
          request.get('/catch/today')
        ])
        this.stats.users = users.data.length
        this.stats.catchWeight = tc.data.reduce((sum, c) => sum + Number(c.weight || 0), 0).toFixed(2)
        this.leaderboard = lb.data.slice(0, 5)
        this.todayCatch = tc.data.slice(0, 8)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 10px;
}
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  margin-right: 20px;
}
.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}
.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.stat-icon.red {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.stat-info h3 {
  margin: 0;
  font-size: 28px;
  color: #303133;
}
.stat-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}
</style>
