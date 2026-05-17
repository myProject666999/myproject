<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2>结算中心</h2>
      <el-button type="primary" @click="showCreate = true">创建结算</el-button>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card>
          <h3>总支出</h3>
          <h1>¥ {{ preview.totalAmount || '0.00' }}</h1>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3>账单数</h3>
          <h1>{{ billsCount }}</h1>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3>成员数</h3>
          <h1>{{ members.length }}</h1>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3>最少转账次数</h3>
          <h1>{{ preview.transferCount || 0 }}</h1>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-bottom: 20px">
      <el-form :inline="true">
        <el-form-item label="家庭">
          <el-select v-model="filter.familyId" placeholder="选择家庭" @change="loadSettlements">
            <el-option v-for="f in families" :key="f.id" :label="f.name" :value="f.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <h3>历史结算</h3>
      <el-table :data="settlements" style="width: 100%; margin-top: 10px">
        <el-table-column prop="title" label="名称"></el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template slot-scope="scope">¥ {{ scope.row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120"></el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" type="info">待确认</el-tag>
            <el-tag v-else type="success">已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewSettlement(scope.row)">查看</el-button>
            <el-button v-if="scope.row.status === 0" type="text" size="small" @click="confirmSettlement(scope.row)">确认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="创建结算" :visible.sync="showCreate" width="500px">
      <el-form :model="settleForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="settleForm.title"></el-input>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="settleForm.startDate" type="date" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="settleForm.endDate" type="date" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="previewSettlement">预览</el-button>
        </el-form-item>
      </el-form>

      <div v-if="showPreview" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px">
        <h4>余额明细：</h4>
        <el-table :data="preview.balanceDetails || []" size="small" style="margin-bottom: 20px">
          <el-table-column prop="nickname" label="成员" width="100"></el-table-column>
          <el-table-column prop="balance" label="余额">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.balance >= 0 ? '#67C23A' : '#F56C6C' }">
                {{ scope.row.balance >= 0 ? '+' : '' }}{{ scope.row.balance }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <h4>转账方案（最少转账次数）：</h4>
        <el-table :data="preview.transfers || []" size="small">
          <el-table-column prop="fromUserName" label="付款人" width="100"></el-table-column>
          <el-table-column label="→" width="30" align="center"><template>→</template></el-table-column>
          <el-table-column prop="toUserName" label="收款人" width="100"></el-table-column>
          <el-table-column prop="amount" label="金额" width="120">
            <template slot-scope="scope">¥ {{ scope.row.amount }}</template>
          </el-table-column>
        </el-table>
      </div>

      <span slot="footer">
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="createSettlement">创建结算</el-button>
      </span>
    </el-dialog>

    <el-dialog title="结算详情" :visible.sync="showDetail" width="600px">
      <div v-if="currentSettlement">
        <h3>{{ currentSettlement.settlement.title }}</h3>
        <p>总金额：¥ {{ currentSettlement.settlement.totalAmount }}</p>
        <p>日期：{{ currentSettlement.settlement.startDate }} 至 {{ currentSettlement.settlement.endDate }}</p>
        <p>状态：<el-tag v-if="currentSettlement.settlement.status === 0" type="info">待确认</el-tag><el-tag v-else type="success">已完成</el-tag></p>

        <h4 style="margin-top: 20px">转账记录：</h4>
        <el-table :data="currentSettlement.transfers || []" size="small">
          <el-table-column prop="fromUserName" label="付款人" width="100"></el-table-column>
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
        </el-table>
      </div>
      <span slot="footer">
        <el-button @click="showDetail = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showCreate: false,
      showDetail: false,
      showPreview: false,
      filter: { familyId: null },
      settleForm: {
        familyId: null,
        title: '',
        startDate: '',
        endDate: ''
      },
      families: [],
      members: [],
      settlements: [],
      billsCount: 0,
      preview: {},
      currentSettlement: null
    }
  },
  mounted() {
    this.loadFamilies()
  },
  methods: {
    async loadFamilies() {
      try {
        const res = await this.$http.get('/family/my')
        if (res.data.code === 200) {
          this.families = res.data.data
          if (this.families.length > 0) {
            this.filter.familyId = this.families[0].id
            this.settleForm.familyId = this.families[0].id
            this.members = this.families[0].members
            this.loadSettlements()
          }
        }
      } catch (e) {
        this.$message.error('加载家庭列表失败')
      }
    },
    async loadSettlements() {
      if (!this.filter.familyId) return
      try {
        const res = await this.$http.get(`/settlement/family/${this.filter.familyId}`)
        if (res.data.code === 200) {
          this.settlements = res.data.data
          this.billsCount = this.settlements.length
        }
      } catch (e) {
        this.$message.error('加载结算记录失败')
      }
    },
    async previewSettlement() {
      if (!this.settleForm.startDate || !this.settleForm.endDate) {
        this.$message.warning('请选择日期范围')
        return
      }
      try {
        const res = await this.$http.post('/settlement/preview', {
          familyId: this.filter.familyId,
          startDate: this.settleForm.startDate,
          endDate: this.settleForm.endDate
        })
        if (res.data.code === 200) {
          this.preview = res.data.data
          this.preview.transfers = this.preview.transfers.map(t => {
            const fromUser = this.members.find(m => m.userId === t.fromUserId)
            const toUser = this.members.find(m => m.userId === t.toUserId)
            return {
              ...t,
              fromUserName: fromUser ? fromUser.nickname : '未知',
              toUserName: toUser ? toUser.nickname : '未知'
            }
          })
          this.showPreview = true
        }
      } catch (e) {
        this.$message.error('预览失败')
      }
    },
    async createSettlement() {
      if (!this.settleForm.title) {
        this.$message.warning('请输入结算名称')
        return
      }
      try {
        const res = await this.$http.post('/settlement', this.settleForm)
        if (res.data.code === 200) {
          this.$message.success('结算创建成功')
          this.showCreate = false
          this.showPreview = false
          this.settleForm = { familyId: this.filter.familyId, title: '', startDate: '', endDate: '' }
          this.loadSettlements()
        } else {
          this.$message.error(res.data.message)
        }
      } catch (e) {
        this.$message.error('创建结算失败')
      }
    },
    async viewSettlement(settlement) {
      try {
        const res = await this.$http.get(`/settlement/${settlement.id}`)
        if (res.data.code === 200) {
          this.currentSettlement = res.data.data
          this.showDetail = true
        }
      } catch (e) {
        this.$message.error('加载详情失败')
      }
    },
    confirmSettlement(settlement) {
      this.$confirm(`确认结算"${settlement.title}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await this.$http.post(`/settlement/${settlement.id}/confirm`)
          if (res.data.code === 200) {
            this.$message.success('确认成功')
            this.loadSettlements()
          } else {
            this.$message.error(res.data.message)
          }
        } catch (e) {
          this.$message.error('确认失败')
        }
      }).catch(() => {})
    }
  }
}
</script>
