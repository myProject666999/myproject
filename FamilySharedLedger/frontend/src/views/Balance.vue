<template>
  <div>
    <h2>个人欠款</h2>

    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="12">
        <el-card>
          <h3 style="color: #F56C6C">我欠别人</h3>
          <h1 style="color: #F56C6C">¥ {{ totalOwe }}</h1>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <h3 style="color: #67C23A">别人欠我</h3>
          <h1 style="color: #67C23A">¥ {{ totalOwed }}</h1>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-bottom: 20px">
      <h3>待我付款</h3>
      <el-table :data="oweList" style="width: 100%" v-if="oweList.length > 0">
        <el-table-column prop="toUserName" label="收款人" width="120"></el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template slot-scope="scope">¥ {{ scope.row.amount }}</template>
        </el-table-column>
        <el-table-column prop="settleId" label="所属结算" width="100">
          <template slot-scope="scope">#{{ scope.row.settleId }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="markAsPaid(scope.row)">去转账</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无待付款项"></el-empty>
    </el-card>

    <el-card style="margin-bottom: 20px">
      <h3>待我收款</h3>
      <el-table :data="owedList" style="width: 100%" v-if="owedList.length > 0">
        <el-table-column prop="fromUserName" label="付款人" width="120"></el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template slot-scope="scope">¥ {{ scope.row.amount }}</template>
        </el-table-column>
        <el-table-column prop="settleId" label="所属结算" width="100">
          <template slot-scope="scope">#{{ scope.row.settleId }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" type="warning">待确认</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 1" type="success" size="small" @click="confirmReceived(scope.row)">确认收款</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无待收款项"></el-empty>
    </el-card>

    <el-card>
      <h3>转账历史</h3>
      <el-table :data="history" style="width: 100%" v-if="history.length > 0">
        <el-table-column prop="fromUserName" label="付款人" width="100"></el-table-column>
        <el-table-column label="→" width="30" align="center"><template>→</template></el-table-column>
        <el-table-column prop="toUserName" label="收款人" width="100"></el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template slot-scope="scope">¥ {{ scope.row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" type="info">待转账</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="warning">待确认</el-tag>
            <el-tag v-else type="success">已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="transferTime" label="转账时间" width="180"></el-table-column>
      </el-table>
      <el-empty v-else description="暂无转账记录"></el-empty>
    </el-card>

    <el-dialog title="确认转账" :visible.sync="showPay" width="400px">
      <div v-if="currentTransfer">
        <p>您确定已向 <b>{{ currentTransfer.toUserName }}</b> 转账 <b>¥ {{ currentTransfer.amount }}</b> 吗？</p>
        <el-form :model="payForm" label-width="80px" style="margin-top: 20px">
          <el-form-item label="备注">
            <el-input v-model="payForm.remark" type="textarea" placeholder="可选，填写转账方式等信息"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <el-button @click="showPay = false">取消</el-button>
        <el-button type="primary" @click="confirmPaid">确认已转账</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showPay: false,
      currentTransfer: null,
      payForm: { remark: '' },
      totalOwe: '0.00',
      totalOwed: '0.00',
      oweList: [],
      owedList: [],
      history: []
    }
  },
  mounted() {
    this.loadTransfers()
  },
  methods: {
    async loadTransfers() {
      try {
        const res = await this.$http.get('/transfer/my')
        if (res.data.code === 200) {
          const data = res.data.data
          this.totalOwe = data.totalOwe || '0.00'
          this.totalOwed = data.totalOwed || '0.00'
          this.oweList = data.oweList || []
          this.owedList = data.owedList || []
          this.history = data.history || []
        }
      } catch (e) {
        this.$message.error('加载转账记录失败')
      }
    },
    markAsPaid(transfer) {
      this.currentTransfer = transfer
      this.payForm = { remark: '' }
      this.showPay = true
    },
    async confirmPaid() {
      try {
        const res = await this.$http.post(`/transfer/${this.currentTransfer.id}/pay`, this.payForm)
        if (res.data.code === 200) {
          this.$message.success('已标记为转账，等待对方确认')
          this.showPay = false
          this.loadTransfers()
        } else {
          this.$message.error(res.data.message)
        }
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    confirmReceived(transfer) {
      this.$confirm(`确认已收到 ${transfer.fromUserName} 转账 ¥${transfer.amount} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await this.$http.post(`/transfer/${transfer.id}/confirm`)
          if (res.data.code === 200) {
            this.$message.success('已确认收款')
            this.loadTransfers()
          } else {
            this.$message.error(res.data.message)
          }
        } catch (e) {
          this.$message.error('操作失败')
        }
      }).catch(() => {})
    }
  }
}
</script>
