
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
          <el-input v-model="searchForm.roomNo" placeholder="请输入包厢号" clearable></el-input>
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
      
      <el-table :data="pageData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
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
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="包厢号" prop="roomNo">
          <el-input v-model="formData.roomNo" placeholder="请输入包厢号" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="包厢类型" prop="roomType">
          <el-select v-model="formData.roomType" placeholder="请选择包厢类型" style="width: 100%;">
            <el-option label="小包 (1-4人)" value="1"></el-option>
            <el-option label="中包 (5-8人)" value="2"></el-option>
            <el-option label="大包 (9-12人)" value="3"></el-option>
            <el-option label="VIP包 (15-20人)" value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="容纳人数" prop="capacity">
          <el-input-number v-model="formData.capacity" :min="1" :max="50"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="可用" value="available"></el-option>
            <el-option label="使用中" value="occupied"></el-option>
            <el-option label="维护中" value="maintenance"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备描述" prop="equipment">
          <el-input type="textarea" v-model="formData.equipment" :rows="3" placeholder="请输入设备描述"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="formData.description" :rows="2" placeholder="请输入描述（可选）"></el-input>
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
  name: 'RoomManage',
  data() {
    return {
      searchForm: {
        roomNo: '',
        roomType: '',
        status: ''
      },
      allRooms: [
        { id: 1, roomNo: '101', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'available', description: '小包1号' },
        { id: 2, roomNo: '102', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'available', description: '小包2号' },
        { id: 3, roomNo: '103', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'occupied', description: '小包3号' },
        { id: 4, roomNo: '104', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'maintenance', description: '小包4号，设备维护中' },
        { id: 5, roomNo: '105', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'available', description: '小包5号' },
        { id: 6, roomNo: '106', roomType: '1', capacity: 4, equipment: '音响、麦克风、点歌屏、WiFi', status: 'available', description: '小包6号' },
        { id: 7, roomNo: '201', roomType: '2', capacity: 8, equipment: '专业音响、无线麦克风、点歌屏、WiFi、大屏电视', status: 'available', description: '中包1号' },
        { id: 8, roomNo: '202', roomType: '2', capacity: 8, equipment: '专业音响、无线麦克风、点歌屏、WiFi、大屏电视', status: 'available', description: '中包2号' },
        { id: 9, roomNo: '203', roomType: '2', capacity: 8, equipment: '专业音响、无线麦克风、点歌屏、WiFi、大屏电视', status: 'available', description: '中包3号' },
        { id: 10, roomNo: '204', roomType: '2', capacity: 8, equipment: '专业音响、无线麦克风、点歌屏、WiFi、大屏电视', status: 'available', description: '中包4号' },
        { id: 11, roomNo: '205', roomType: '2', capacity: 8, equipment: '专业音响、无线麦克风、点歌屏、WiFi、大屏电视', status: 'available', description: '中包5号' },
        { id: 12, roomNo: '206', roomType: '2', capacity: 8, equipment: '专业音响、无线麦克风、点歌屏、WiFi、大屏电视', status: 'available', description: '中包6号' },
        { id: 13, roomNo: '301', roomType: '3', capacity: 12, equipment: '豪华音响、无线麦克风、点歌屏、WiFi、投影', status: 'available', description: '大包1号' },
        { id: 14, roomNo: '302', roomType: '3', capacity: 12, equipment: '豪华音响、无线麦克风、点歌屏、WiFi、投影', status: 'available', description: '大包2号' },
        { id: 15, roomNo: '303', roomType: '3', capacity: 12, equipment: '豪华音响、无线麦克风、点歌屏、WiFi、投影', status: 'available', description: '大包3号' },
        { id: 16, roomNo: '304', roomType: '3', capacity: 12, equipment: '豪华音响、无线麦克风、点歌屏、WiFi、投影', status: 'available', description: '大包4号' },
        { id: 17, roomNo: '501', roomType: '4', capacity: 20, equipment: '顶级音响、无线麦克风、多点点歌、WiFi、投影、独立卫生间', status: 'available', description: 'VIP包1号' },
        { id: 18, roomNo: '502', roomType: '4', capacity: 20, equipment: '顶级音响、无线麦克风、多点点歌、WiFi、投影、独立卫生间', status: 'available', description: 'VIP包2号' }
      ],
      currentPage: 1,
      pageSize: 5,
      dialogVisible: false,
      isEdit: false,
      dialogTitle: '',
      formData: {
        id: null,
        roomNo: '',
        roomType: '',
        capacity: 4,
        status: 'available',
        equipment: '',
        description: ''
      },
      formRules: {
        roomNo: [{ required: true, message: '请输入包厢号', trigger: 'blur' }],
        roomType: [{ required: true, message: '请选择包厢类型', trigger: 'change' }],
        capacity: [{ required: true, message: '请输入容纳人数', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        equipment: [{ required: true, message: '请输入设备描述', trigger: 'blur' }]
      }
    }
  },
  computed: {
    filteredRooms() {
      return this.allRooms.filter(room => {
        const roomNoMatch = !this.searchForm.roomNo || room.roomNo.includes(this.searchForm.roomNo)
        const typeMatch = !this.searchForm.roomType || room.roomType === this.searchForm.roomType
        const statusMatch = !this.searchForm.status || room.status === this.searchForm.status
        return roomNoMatch && typeMatch && statusMatch
      })
    },
    total() {
      return this.filteredRooms.length
    },
    pageData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredRooms.slice(start, end)
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
      this.currentPage = 1
      this.$message.success(`搜索成功，共找到 ${this.total} 条记录`)
    },
    handleReset() {
      this.searchForm = { roomNo: '', roomType: '', status: '' }
      this.currentPage = 1
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增包厢'
      this.formData = {
        id: null,
        roomNo: '',
        roomType: '',
        capacity: 4,
        status: 'available',
        equipment: '',
        description: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑包厢'
      this.formData = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm(`确认删除包厢 ${row.roomNo}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.allRooms.findIndex(item => item.id === row.id)
        if (index > -1) {
          this.allRooms.splice(index, 1)
        }
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          if (this.isEdit) {
            const index = this.allRooms.findIndex(item => item.id === this.formData.id)
            if (index > -1) {
              this.allRooms[index] = { ...this.formData }
            }
            this.$message.success('修改成功')
          } else {
            const newId = Math.max(...this.allRooms.map(r => r.id)) + 1
            this.allRooms.push({ ...this.formData, id: newId })
            this.$message.success('新增成功')
          }
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
