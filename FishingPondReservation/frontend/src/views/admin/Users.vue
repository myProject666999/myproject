<template>
  <div class="users-admin">
    <el-card>
      <div slot="header">
        <span style="font-weight: bold;">用户管理</span>
      </div>

      <el-table :data="users" border>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="150"></el-table-column>
        <el-table-column prop="nickname" label="昵称" width="150"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.role === 'ADMIN' ? 'danger' : 'primary'" size="small">
              {{ scope.row.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="120">
          <template slot-scope="scope">
            <span style="color: #67c23a; font-weight: bold;">¥{{ scope.row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="recharge(scope.row)">充值</el-button>
            <el-button 
              :type="scope.row.status === 1 ? 'warning' : 'success'" 
              size="small" 
              @click="toggleStatus(scope.row)">
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="账户充值" :visible.sync="rechargeVisible" width="400px">
      <el-form :model="rechargeForm" label-width="80px">
        <el-form-item label="用户">
          <span>{{ rechargeUser.nickname }}</span>
        </el-form-item>
        <el-form-item label="当前余额">
          <span style="color: #67c23a; font-weight: bold;">¥{{ rechargeUser.balance }}</span>
        </el-form-item>
        <el-form-item label="充值金额">
          <el-input-number v-model="rechargeForm.amount" :min="1" :precision="2"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="rechargeVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRecharge" :loading="recharging">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../utils/request'

export default {
  name: 'UsersAdmin',
  data() {
    return {
      users: [],
      rechargeVisible: false,
      rechargeUser: {},
      rechargeForm: {
        amount: 100
      },
      recharging: false
    }
  },
  mounted() {
    this.loadUsers()
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
    recharge(user) {
      this.rechargeUser = { ...user }
      this.rechargeForm.amount = 100
      this.rechargeVisible = true
    },
    async confirmRecharge() {
      this.recharging = true
      try {
        await request.put('/user/' + this.rechargeUser.id + '/balance', null, {
          params: { amount: this.rechargeForm.amount }
        })
        this.$message.success('充值成功')
        this.rechargeVisible = false
        this.loadUsers()
      } catch (error) {
        console.error(error)
      } finally {
        this.recharging = false
      }
    },
    async toggleStatus(user) {
      try {
        user.status = user.status === 1 ? 0 : 1
        await request.put('/user/' + user.id, { status: user.status })
        this.$message.success('状态更新成功')
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.users-admin {
  padding: 10px;
}
</style>
