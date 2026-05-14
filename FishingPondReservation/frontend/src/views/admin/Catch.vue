<template>
  <div class="catch-admin">
    <el-row :gutter="20">
      <el-col :span="10">
        <el-card>
          <div slot="header">
            <span style="font-weight: bold;">⚖️ 渔获称重</span>
          </div>
          <el-form :model="form" label-width="100px">
            <el-form-item label="用户">
              <el-select v-model="form.userId" placeholder="选择用户" filterable style="width: 100%;">
                <el-option 
                  v-for="user in users" 
                  :key="user.id" 
                  :label="user.nickname + ' (' + user.username + ')'" 
                  :value="user.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="鱼种">
              <el-select v-model="form.fishType" style="width: 100%;">
                <el-option label="鲫鱼" value="鲫鱼"></el-option>
                <el-option label="鲤鱼" value="鲤鱼"></el-option>
                <el-option label="草鱼" value="草鱼"></el-option>
                <el-option label="青鱼" value="青鱼"></el-option>
                <el-option label="鲢鱼" value="鲢鱼"></el-option>
                <el-option label="鳙鱼" value="鳙鱼"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="重量(kg)">
              <el-input-number v-model="form.weight" :min="0" :precision="2" :step="0.1" style="width: 100%;"></el-input-number>
            </el-form-item>
            <el-form-item label="单价(元/kg)">
              <el-input-number v-model="form.pricePerKg" :min="0" :precision="2" style="width: 100%;"></el-input-number>
            </el-form-item>
            <el-form-item label="总价值">
              <span style="color: #f56c6c; font-size: 24px; font-weight: bold;">¥{{ totalPrice }}</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width: 100%;" @click="submitWeigh" :loading="submitting">
                确认称重
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card>
          <div slot="header">
            <span style="font-weight: bold;">今日称重记录</span>
          </div>
          <el-table :data="catchList" border>
            <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
            <el-table-column prop="fishType" label="鱼种" width="100"></el-table-column>
            <el-table-column prop="weight" label="重量(kg)" width="100">
              <template slot-scope="scope">
                <span style="color: #409EFF; font-weight: bold;">{{ scope.row.weight }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="pricePerKg" label="单价" width="100"></el-table-column>
            <el-table-column prop="totalPrice" label="价值" width="100">
              <template slot-scope="scope">
                <span style="color: #f56c6c;">¥{{ scope.row.totalPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="weighTime" label="称重时间"></el-table-column>
          </el-table>
          <el-empty description="暂无记录" v-if="catchList.length === 0"></el-empty>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import request from '../../utils/request'

export default {
  name: 'CatchAdmin',
  data() {
    return {
      users: [],
      catchList: [],
      submitting: false,
      form: {
        userId: null,
        fishType: '鲫鱼',
        weight: 0,
        pricePerKg: 15
      }
    }
  },
  computed: {
    totalPrice() {
      return (this.form.weight * this.form.pricePerKg).toFixed(2)
    }
  },
  mounted() {
    this.loadUsers()
    this.loadCatchList()
  },
  methods: {
    async loadUsers() {
      try {
        const res = await request.get('/user/list')
        this.users = res.data
      } catch (error) {
        console.error(error)
      }
    },
    async loadCatchList() {
      try {
        const res = await request.get('/catch/today')
        this.catchList = res.data
      } catch (error) {
        console.error(error)
      }
    },
    async submitWeigh() {
      if (!this.form.userId) {
        this.$message.warning('请选择用户')
        return
      }
      if (!this.form.weight || this.form.weight <= 0) {
        this.$message.warning('请输入重量')
        return
      }
      this.submitting = true
      try {
        await request.post('/catch/weigh', this.form)
        this.$message.success('称重成功')
        this.form.weight = 0
        this.loadCatchList()
      } catch (error) {
        console.error(error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.catch-admin {
  padding: 10px;
}
</style>
