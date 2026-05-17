<template>
  <div>
    <h2>首页概览</h2>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">本月支出</div>
          <div class="stat-value">¥ 3,864.50</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">我的欠款</div>
          <div class="stat-value" style="color: #f56c6c">¥ 1,037.75</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">应收金额</div>
          <div class="stat-value" style="color: #67c23a">¥ 0.00</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">待结算账单</div>
          <div class="stat-value">5 笔</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <div slot="header">最近账单</div>
          <el-table :data="recentBills" style="width: 100%">
            <el-table-column prop="title" label="账单标题"></el-table-column>
            <el-table-column prop="amount" label="金额">
              <template slot-scope="scope">¥ {{ scope.row.amount }}</template>
            </el-table-column>
            <el-table-column prop="category" label="分类"></el-table-column>
            <el-table-column prop="billDate" label="日期"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">家庭成员</div>
          <el-table :data="members" style="width: 100%">
            <el-table-column prop="nickname" label="成员"></el-table-column>
            <el-table-column prop="role" label="角色">
              <template slot-scope="scope">{{ scope.row.role === 1 ? '管理员' : '成员' }}</template>
            </el-table-column>
            <el-table-column prop="balance" label="余额">
              <template slot-scope="scope">
                <span :style="{ color: scope.row.balance >= 0 ? '#67c23a' : '#f56c6c' }">
                  {{ scope.row.balance >= 0 ? '+' : '' }}¥ {{ scope.row.balance }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recentBills: [
        { title: '超市购物', amount: '256.50', category: '购物', billDate: '2024-01-15' },
        { title: '房租', amount: '3,000.00', category: '住房', billDate: '2024-01-01' },
        { title: '外卖晚餐', amount: '68.00', category: '餐饮', billDate: '2024-01-16' },
        { title: '水电费', amount: '420.00', category: '住房', billDate: '2024-01-10' },
        { title: '网络费', amount: '120.00', category: '住房', billDate: '2024-01-05' }
      ],
      members: [
        { nickname: '张三', role: 1, balance: -1037.75 },
        { nickname: '李四', role: 2, balance: 1037.75 }
      ]
    }
  }
}
</script>

<style scoped>
.stat-card {
  text-align: center;
}
.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
</style>
