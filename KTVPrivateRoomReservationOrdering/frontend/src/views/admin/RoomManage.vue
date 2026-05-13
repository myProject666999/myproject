
<template>
  <div class="room-manage">
    <el-card>
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="16">
            <span>包厢管理</span>
          </el-col>
          <el-col :span="8" style="text-align: right;">
            <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
              新增包厢
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="包厢号">
          <el-input v-model="searchForm.roomNo" placeholder="请输入包厢号"></el-input>
        </el-form-item>
        <el-form-item label="包厢类型">
          <el-select v-model="searchForm.roomType" placeholder="请选择" clearable>
            <el-option label="小包" value="1"></el-option>
            <el-option label="中包" value="2"></el-option>
            <el-option label="大包" value="3"></el-option>
            <el-option label="VIP包" value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="可用" value="available"></el-option>
            <el-option label="使用中" value="occupied"></el-option>
            <el-option label="维护中" value="maintenance"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="roomList" style="width: 100%">
        <el-table-column prop="roomNo" label="包厢号" width="100"></el-table-column>
        <el-table-column prop="roomType" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag>{{ getRoomTypeText(scope.row.roomType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容纳人数" width="100"></el-table-column>
        <el-table-column prop="equipment" label="设备"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
  name: 'RoomManage',
  data() {
    return {
      searchForm: {
        roomNo: '',
        roomType: '',
        status: ''
      },
      roomList: [
        { id: 1, roomNo: '101', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'available' },
        { id: 2, roomNo: '102', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'available' },
        { id: 3, roomNo: '103', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'occupied' },
        { id: 4, roomNo: '104', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'maintenance' },
        { id: 5, roomNo: '201', roomType: '2', capacity: 8, equipment: '专业音响、无线麦克风、点歌屏、大屏电视', status: 'available' },
        { id: 6, roomNo: '202', roomType: '2', capacity: 8, equipment: '专业音响、无线麦克风、点歌屏、大屏电视', status: 'available' },
        { id: 7, roomNo: '301', roomType: '3', capacity: 12, equipment: '豪华音响、无线麦克风、点歌屏、投影', status: 'available' },
        { id: 8, roomNo: '501', roomType: '4', capacity: 20, equipment: '顶级音响、多点点歌、投影、独立卫生间', status: 'available' }
      ],
      currentPage: 1,
      pageSize: 10,
      total: 18
    }
  },
  methods: {
    getRoomTypeText(type) {
      const textMap = { '1': '小包', '2': '中包', '3': '大包', '4': 'VIP包' }
      return textMap[type] || type
    },
    getStatusText(status) {
      const textMap = { 'available': '可用', 'occupied': '使用中', 'maintenance': '维护中' }
      return textMap[status] || status
    },
    getStatusType(status) {
      const typeMap = { 'available': 'success', 'occupied': 'danger', 'maintenance': 'warning' }
      return typeMap[status] || 'info'
    },
    handleSearch() {
      this.$message.success('搜索成功')
    },
    handleReset() {
      this.searchForm = { roomNo: '', roomType: '', status: '' }
    },
    handleAdd() {
      this.$message.info('新增包厢功能')
    },
    handleEdit(row) {
      this.$message.info(`编辑包厢：${row.roomNo}`)
    },
    handleDelete(row) {
      this.$confirm(`确认删除包厢 ${row.roomNo}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
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
.room-manage {
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
