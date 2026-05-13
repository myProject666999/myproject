
<template>
  <div class="booking-manage">
    <el-card>
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="16">
            <span>预订管理</span>
          </el-col>
        </el-row>
      </div>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="预订编号">
          <el-input v-model="searchForm.bookingNo" placeholder="请输入预订编号"></el-input>
        </el-form-item>
        <el-form-item label="包厢号">
          <el-input v-model="searchForm.roomNo" placeholder="请输入包厢号"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待确认" value="PENDING"></el-option>
            <el-option label="已确认" value="CONFIRMED"></el-option>
            <el-option label="已入住" value="CHECKED_IN"></el-option>
            <el-option label="已完成" value="COMPLETED"></el-option>
            <el-option label="已取消" value="CANCELLED"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="bookingList" style="width: 100%">
        <el-table-column prop="bookingNo" label="预订编号" width="180"></el-table-column>
        <el-table-column prop="roomNo" label="包厢号" width="80"></el-table-column>
        <el-table-column prop="roomType" label="类型" width="80"></el-table-column>
        <el-table-column prop="customer" label="客户" width="100"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="120"></el-table-column>
        <el-table-column prop="bookingDate" label="预订日期" width="120"></el-table-column>
        <el-table-column prop="timeSlot" label="时段" width="80"></el-table-column>
        <el-table-column prop="hours" label="时长" width="60"></el-table-column>
        <el-table-column prop="amount" label="金额" width="100">
          <template slot-scope="scope">¥{{ scope.row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button size="mini" type="success" v-if="scope.row.status === 'PENDING'" @click="handleConfirm(scope.row)">确认</el-button>
            <el-button size="mini" type="warning" v-if="scope.row.status === 'CONFIRMED'" @click="handleCheckIn(scope.row)">入住</el-button>
            <el-button size="mini" type="primary" v-if="scope.row.status === 'CHECKED_IN'" @click="handleCheckout(scope.row)">结账</el-button>
            <el-button size="mini" type="danger" v-if="['PENDING', 'CONFIRMED'].includes(scope.row.status)" @click="handleCancel(scope.row)">取消</el-button>
            <el-button size="mini" @click="handleView(scope.row)">详情</el-button>
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
  name: 'BookingManage',
  data() {
    return {
      searchForm: {
        bookingNo: '',
        roomNo: '',
        status: ''
      },
      bookingList: [
        { id: 1, bookingNo: 'BK20240115001', roomNo: '201', roomType: '中包', customer: '张三', phone: '13800138001', bookingDate: '2024-01-15', timeSlot: '晚场', hours: 3, amount: 360, status: 'CONFIRMED' },
        { id: 2, bookingNo: 'BK20240115002', roomNo: '103', roomType: '小包', customer: '李四', phone: '13800138002', bookingDate: '2024-01-15', timeSlot: '午场', hours: 3, amount: 150, status: 'PENDING' },
        { id: 3, bookingNo: 'BK20240115003', roomNo: '301', roomType: '大包', customer: '王五', phone: '13800138003', bookingDate: '2024-01-15', timeSlot: '晚场', hours: 3, amount: 540, status: 'CHECKED_IN' },
        { id: 4, bookingNo: 'BK20240115004', roomNo: '501', roomType: 'VIP', customer: '赵六', phone: '13800138004', bookingDate: '2024-01-15', timeSlot: '夜场', hours: 4, amount: 880, status: 'COMPLETED' },
        { id: 5, bookingNo: 'BK20240115005', roomNo: '203', roomType: '中包', customer: '孙七', phone: '13800138005', bookingDate: '2024-01-15', timeSlot: '晚场', hours: 3, amount: 360, status: 'CANCELLED' }
      ],
      currentPage: 1,
      pageSize: 10,
      total: 25
    }
  },
  methods: {
    getStatusText(status) {
      const textMap = { 'PENDING': '待确认', 'CONFIRMED': '已确认', 'CHECKED_IN': '已入住', 'COMPLETED': '已完成', 'CANCELLED': '已取消' }
      return textMap[status] || status
    },
    getStatusType(status) {
      const typeMap = { 'PENDING': 'warning', 'CONFIRMED': 'primary', 'CHECKED_IN': 'success', 'COMPLETED': 'info', 'CANCELLED': 'danger' }
      return typeMap[status] || 'info'
    },
    handleSearch() {
      this.$message.success('搜索成功')
    },
    handleReset() {
      this.searchForm = { bookingNo: '', roomNo: '', status: '' }
    },
    handleConfirm(row) {
      this.$confirm(`确认预订 ${row.bookingNo}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('确认成功')
      }).catch(() => {})
    },
    handleCheckIn(row) {
      this.$confirm(`确认 ${row.roomNo} 号包厢入住？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('入住成功')
      }).catch(() => {})
    },
    handleCheckout(row) {
      this.$message.info(`结账：${row.bookingNo}`)
    },
    handleCancel(row) {
      this.$confirm(`确认取消预订 ${row.bookingNo}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('取消成功')
      }).catch(() => {})
    },
    handleView(row) {
      this.$message.info(`查看详情：${row.bookingNo}`)
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
.booking-manage {
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
