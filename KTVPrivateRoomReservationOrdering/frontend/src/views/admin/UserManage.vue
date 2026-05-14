
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
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable></el-input>
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
      
      <el-table :data="pageData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="realName" label="姓名" width="100"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
        <el-table-column prop="role" label="角色" width="80">
          <template slot-scope="scope">
            <el-tag :type="getRoleType(scope.row.role)">{{ getRoleText(scope.row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberLevel" label="会员等级" width="90">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.memberLevel" :type="getLevelType(scope.row.memberLevel)">
              {{ getLevelText(scope.row.memberLevel) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="90">
          <template slot-scope="scope">¥{{ scope.row.balance }}</template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="70"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
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
          :current-page.sync="currentPage"
          :page-sizes="[5, 10, 20, 30]"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>
    
    <el-dialog
      title="编辑用户"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="管理员" value="ADMIN"></el-option>
            <el-option label="员工" value="STAFF"></el-option>
            <el-option label="会员" value="MEMBER"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="会员等级" prop="memberLevel" v-if="formData.role === 'MEMBER'">
          <el-select v-model="formData.memberLevel" placeholder="请选择会员等级" style="width: 100%;" clearable>
            <el-option label="普通会员" value="NORMAL"></el-option>
            <el-option label="银卡会员" value="SILVER"></el-option>
            <el-option label="金卡会员" value="GOLD"></el-option>
            <el-option label="钻石会员" value="DIAMOND"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账户余额 (¥)">
          <el-input-number v-model="formData.balance" :min="0" :precision="2" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="积分">
          <el-input-number v-model="formData.points" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">正常</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
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
      allUsers: [
        { id: 1, username: 'admin', realName: '系统管理员', phone: '13800000000', role: 'ADMIN', memberLevel: null, balance: 0, points: 0, status: '1' },
        { id: 2, username: 'staff01', realName: '张三', phone: '13800000001', role: 'STAFF', memberLevel: null, balance: 0, points: 0, status: '1' },
        { id: 3, username: 'staff02', realName: '李四', phone: '13800000002', role: 'STAFF', memberLevel: null, balance: 0, points: 0, status: '1' },
        { id: 4, username: 'member01', realName: '王五', phone: '13900000001', role: 'MEMBER', memberLevel: 'GOLD', balance: 500, points: 3500, status: '1' },
        { id: 5, username: 'member02', realName: '赵六', phone: '13900000002', role: 'MEMBER', memberLevel: 'SILVER', balance: 200, points: 1200, status: '1' },
        { id: 6, username: 'member03', realName: '孙七', phone: '13900000003', role: 'MEMBER', memberLevel: 'NORMAL', balance: 100, points: 300, status: '1' },
        { id: 7, username: 'member04', realName: '周八', phone: '13900000004', role: 'MEMBER', memberLevel: 'DIAMOND', balance: 2000, points: 15000, status: '1' },
        { id: 8, username: 'member05', realName: '吴九', phone: '13900000005', role: 'MEMBER', memberLevel: 'SILVER', balance: 300, points: 1800, status: '1' },
        { id: 9, username: 'member06', realName: '郑十', phone: '13900000006', role: 'MEMBER', memberLevel: 'NORMAL', balance: 50, points: 100, status: '1' },
        { id: 10, username: 'member07', realName: '钱十一', phone: '13900000007', role: 'MEMBER', memberLevel: 'GOLD', balance: 800, points: 4200, status: '0' },
        { id: 11, username: 'member08', realName: '李十二', phone: '13900000008', role: 'MEMBER', memberLevel: 'NORMAL', balance: 150, points: 450, status: '1' },
        { id: 12, username: 'member09', realName: '王十三', phone: '13900000009', role: 'MEMBER', memberLevel: 'SILVER', balance: 350, points: 1600, status: '1' },
        { id: 13, username: 'member10', realName: '张十四', phone: '13900000010', role: 'MEMBER', memberLevel: 'GOLD', balance: 1200, points: 5800, status: '1' },
        { id: 14, username: 'staff03', realName: '刘十五', phone: '13800000003', role: 'STAFF', memberLevel: null, balance: 0, points: 0, status: '1' },
        { id: 15, username: 'staff04', realName: '陈十六', phone: '13800000004', role: 'STAFF', memberLevel: null, balance: 0, points: 0, status: '0' },
        { id: 16, username: 'member11', realName: '杨十七', phone: '13900000011', role: 'MEMBER', memberLevel: 'NORMAL', balance: 80, points: 250, status: '1' }
      ],
      currentPage: 1,
      pageSize: 5,
      dialogVisible: false,
      formData: {
        id: null,
        username: '',
        realName: '',
        phone: '',
        role: '',
        memberLevel: '',
        balance: 0,
        points: 0,
        status: '1'
      },
      formRules: {
        realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }]
      }
    }
  },
  computed: {
    filteredUsers() {
      return this.allUsers.filter(user => {
        const usernameMatch = !this.searchForm.username || user.username.includes(this.searchForm.username)
        const phoneMatch = !this.searchForm.phone || user.phone.includes(this.searchForm.phone)
        const roleMatch = !this.searchForm.role || user.role === this.searchForm.role
        return usernameMatch && phoneMatch && roleMatch
      })
    },
    total() {
      return this.filteredUsers.length
    },
    pageData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredUsers.slice(start, end)
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
      this.currentPage = 1
      this.$message.success(`搜索成功，共找到 ${this.total} 条记录`)
    },
    handleReset() {
      this.searchForm = { username: '', phone: '', role: '' }
      this.currentPage = 1
    },
    handleEdit(row) {
      this.formData = { ...row }
      this.dialogVisible = true
    },
    handleToggleStatus(row) {
      const action = row.status === '1' ? '禁用' : '启用'
      this.$confirm(`确认${action}用户 "${row.username}"？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.allUsers.findIndex(item => item.id === row.id)
        if (index > -1) {
          this.allUsers[index].status = row.status === '1' ? '0' : '1'
        }
        this.$message.success(`${action}成功`)
      }).catch(() => {})
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          const index = this.allUsers.findIndex(item => item.id === this.formData.id)
          if (index > -1) {
            this.allUsers[index] = { ...this.formData }
          }
          this.$message.success('修改成功')
          this.dialogVisible = false
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
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
