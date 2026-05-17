<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2>共享账单</h2>
      <el-button type="primary" @click="showAdd = true">记一笔</el-button>
    </div>

    <el-card>
      <el-form :inline="true" style="margin-bottom: 20px">
        <el-form-item label="家庭">
          <el-select v-model="filter.familyId" placeholder="选择家庭" @change="loadBills">
            <el-option v-for="f in families" :key="f.id" :label="f.name" :value="f.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filter.category" placeholder="全部" clearable @change="loadBills">
            <el-option label="餐饮" value="餐饮"></el-option>
            <el-option label="交通" value="交通"></el-option>
            <el-option label="购物" value="购物"></el-option>
            <el-option label="住房" value="住房"></el-option>
            <el-option label="娱乐" value="娱乐"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker v-model="filter.month" type="month" placeholder="选择月份" @change="loadBills"></el-date-picker>
        </el-form-item>
      </el-form>

      <el-table :data="filteredBills" style="width: 100%">
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="amount" label="金额" width="100">
          <template slot-scope="scope">¥ {{ scope.row.amount }}</template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="80"></el-table-column>
        <el-table-column prop="payerName" label="支付人" width="80"></el-table-column>
        <el-table-column prop="splitType" label="分摊方式" width="100">
          <template slot-scope="scope">
            {{ ['', 'AA制', '比例分摊', '自定义'][scope.row.splitType] }}
          </template>
        </el-table-column>
        <el-table-column prop="billDate" label="日期" width="120"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="editBill(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="deleteBill(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="账单详情" :visible.sync="showDetail" width="500px">
      <el-descriptions v-if="currentBill" :column="1" border>
        <el-descriptions-item label="标题">{{ currentBill.title }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥ {{ currentBill.amount }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentBill.category }}</el-descriptions-item>
        <el-descriptions-item label="支付人">{{ currentBill.payerName }}</el-descriptions-item>
        <el-descriptions-item label="分摊方式">{{ ['', 'AA制', '比例分摊', '自定义'][currentBill.splitType] }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{ currentBill.billDate }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentBill.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="showDetail = false">关闭</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="isEdit ? '编辑账单' : '记一笔'" :visible.sync="showAdd" width="500px">
      <el-form :model="billForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="billForm.title"></el-input>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="billForm.amount" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="billForm.category">
            <el-option label="餐饮" value="餐饮"></el-option>
            <el-option label="交通" value="交通"></el-option>
            <el-option label="购物" value="购物"></el-option>
            <el-option label="住房" value="住房"></el-option>
            <el-option label="娱乐" value="娱乐"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="家庭">
          <el-select v-model="billForm.familyId">
            <el-option v-for="f in families" :key="f.id" :label="f.name" :value="f.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付人">
          <el-select v-model="billForm.payerId">
            <el-option v-for="m in members" :key="m.userId" :label="m.nickname" :value="m.userId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分摊方式">
          <el-radio-group v-model="billForm.splitType">
            <el-radio :label="1">AA制</el-radio>
            <el-radio :label="2">比例分摊</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="billForm.billDate" type="date" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="billForm.remark" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="saveBill">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showAdd: false,
      showDetail: false,
      isEdit: false,
      currentBill: null,
      filter: { familyId: null, category: '', month: '' },
      billForm: {
        id: null,
        title: '',
        amount: 0,
        category: '餐饮',
        familyId: null,
        payerId: null,
        splitType: 1,
        billDate: '',
        remark: ''
      },
      families: [],
      members: [],
      bills: []
    }
  },
  computed: {
    filteredBills() {
      let result = [...this.bills]
      if (this.filter.category) {
        result = result.filter(b => b.category === this.filter.category)
      }
      return result
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
            this.billForm.familyId = this.families[0].id
            this.members = this.families[0].members
            if (this.members.length > 0) {
              this.billForm.payerId = this.members[0].userId
            }
            this.loadBills()
          }
        }
      } catch (e) {
        this.$message.error('加载家庭列表失败')
      }
    },
    async loadBills() {
      if (!this.filter.familyId) return
      try {
        const res = await this.$http.get(`/bills/family/${this.filter.familyId}`)
        if (res.data.code === 200) {
          this.bills = res.data.data.map(bill => {
            const member = this.members.find(m => m.userId === bill.payerId)
            return { ...bill, payerName: member ? member.nickname : '未知' }
          })
        }
      } catch (e) {
        this.$message.error('加载账单失败')
      }
    },
    viewDetail(bill) {
      this.currentBill = bill
      this.showDetail = true
    },
    editBill(bill) {
      this.isEdit = true
      this.billForm = {
        id: bill.id,
        title: bill.title,
        amount: bill.amount,
        category: bill.category,
        familyId: bill.familyId,
        payerId: bill.payerId,
        splitType: bill.splitType,
        billDate: bill.billDate,
        remark: bill.remark
      }
      this.showAdd = true
    },
    async saveBill() {
      if (!this.billForm.title || !this.billForm.amount || !this.billForm.billDate) {
        this.$message.warning('请填写完整信息')
        return
      }
      try {
        let res
        if (this.isEdit) {
          res = await this.$http.put(`/bills/${this.billForm.id}`, this.billForm)
        } else {
          res = await this.$http.post('/bills', this.billForm)
        }
        if (res.data.code === 200) {
          this.$message.success(this.isEdit ? '更新成功' : '添加成功')
          this.showAdd = false
          this.loadBills()
        } else {
          this.$message.error(res.data.message)
        }
      } catch (e) {
        this.$message.error('保存失败')
      }
    },
    deleteBill(bill) {
      this.$confirm(`确定删除账单"${bill.title}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await this.$http.delete(`/bills/${bill.id}`)
          if (res.data.code === 200) {
            this.$message.success('删除成功')
            this.loadBills()
          } else {
            this.$message.error(res.data.message)
          }
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    }
  }
}
</script>
