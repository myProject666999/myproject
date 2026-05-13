
<template>
  <div class="user-manage">
    <el-card>
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="16">
            <span>用户管理</span>
          </el-col>
        </el-row>
      </div>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择" clearable>
            <el-option label="管理员" value="ADMIN"></el-option>
            <el-option label="员工" value="STAFF"></el-option>
            <el-option label="会员" value="MEMBER"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="realName" label="姓名" width="100"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template slot-scope="scope">
            <el-tag :type="getRoleType(scope.row.role)">{{ getRoleText(scope.row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberLevel" label="会员等级" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.memberLevel" :type="getLevelType(scope.row.memberLevel)">
              {{ getLevelText(scope.row.memberLevel) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="100">
          <template slot-scope="scope">¥{{ scope.row.balance }}</template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" :type="scope.row.status === '1' ? 'warning' : 'success'" @click="handleToggleStatus(scope.row)">
              {{ scope.row.status === '1' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          background
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'UserManage',
  data() {
    return {
      searchForm: {
        username: '',
        phone: '',
        role: ''
      },
      userList: [
        { id: 1, username: 'admin', realName: '系统管理员', phone: '13800000000', role: 'ADMIN', memberLevel: null, balance: 0, points: 0, status: '1' },
        { id: 2, username: 'staff01', realName: '张三', phone: '13800000001', role: 'STAFF', memberLevel: null, balance: 0, points: 0, status: '1' },
        { id: 3, username: 'staff02', realName: '李四', phone: '13800000002', role: 'STAFF', memberLevel: null, balance: 0, points: 0, status: '1' },
        { id: 4, username: 'member01', realName: '王五', phone: '13900000001', role: 'MEMBER', memberLevel: 'GOLD', balance: 500, points: 3500, status: '1' },
        { id: 5, username: 'member02', realName: '赵六', phone: '13900000002', role: 'MEMBER', memberLevel: 'SILVER', balance: 200, points: 1200, status: '1' },
        { id: 6, username: 'member03', realName: '孙七', phone: '13900000003', role: 'MEMBER', memberLevel: 'NORMAL', balance: 100, points: 300, status: '1' }
      ],
      currentPage: 1,
      pageSize: 10,
      total: 256
    }
  },
  methods: {
    getRoleText(role) {
      const textMap = { 'ADMIN': '管理员', 'STAFF': '员工', 'MEMBER': '会员' }
      return textMap[role] || role
    },
    getRoleType(role) {
      const typeMap = { 'ADMIN': 'danger', 'STAFF': 'warning', 'MEMBER': 'primary' }
      return typeMap[role] || 'info'
    },
    getLevelText(level) {
      const textMap = { 'NORMAL': '普通', 'SILVER': '银卡', 'GOLD': '金卡', 'DIAMOND': '钻石' }
      return textMap[level] || level
    },
    getLevelType(level) {
      const typeMap = { 'NORMAL': 'info', 'SILVER': 'primary', 'GOLD': 'warning', 'DIAMOND': 'danger' }
      return typeMap[level] || 'info'
    },
    handleSearch() {
      this.$message.success('搜索成功')
    },
    handleReset() {
      this.searchForm = { username: '', phone: '', role: '' }
    },
    handleEdit(row) {
      this.$message.info(`编辑用户：${row.username}`)
    },
    handleToggleStatus(row) {
      const action = row.status === '1' ? '禁用' : '启用'
      this.$confirm(`确认${action}用户 ${row.username}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success(`${action}成功`)
      }).catch(() => {})
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>

<style scoped>
.user-manage {
  min-height: 100%;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
