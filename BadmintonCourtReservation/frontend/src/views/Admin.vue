<template>
  <div class="admin-page">
    <el-card>
      <div slot="header">
        <span style="font-size: 18px; font-weight: bold;">管理后台</span>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="场地管理" name="court">
          <div style="margin-bottom: 20px;">
            <el-button type="primary" @click="showCourtDialog">添加场地</el-button>
          </div>
          <el-table :data="courts" style="width: 100%;">
            <el-table-column prop="courtNo" label="场地编号" width="120"></el-table-column>
            <el-table-column prop="name" label="名称" width="150"></el-table-column>
            <el-table-column label="类型" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.type === 'BADMINTON' ? 'success' : 'warning'">
                  {{ scope.row.type === 'BADMINTON' ? '羽毛球' : '网球' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="100">
              <template slot-scope="scope">
                ¥{{ scope.row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button type="text" @click="editCourt(scope.row)">编辑</el-button>
                <el-button type="text" style="color: #f56c6c;" @click="deleteCourt(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="闸机验证" name="gate">
          <el-card>
            <div style="text-align: center; margin-bottom: 20px;">
              <el-input
                v-model="qrCode"
                placeholder="请输入二维码内容或扫码"
                style="width: 400px;">
              </el-input>
              <el-button type="primary" style="margin-left: 10px;" @click="verifyIn">入场验证</el-button>
              <el-button type="success" style="margin-left: 10px;" @click="verifyOut">出场验证</el-button>
            </div>
            <el-alert
              v-if="verifyResult"
              :title="verifyResult.message"
              :type="verifyResult.type"
              show-icon
              style="margin-bottom: 20px;">
            </el-alert>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog :title="editingCourt ? '编辑场地' : '添加场地'" :visible.sync="courtDialogVisible" width="500px">
      <el-form :model="courtForm" label-width="80px">
        <el-form-item label="场地编号">
          <el-input v-model="courtForm.courtNo"></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="courtForm.name"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="courtForm.type" style="width: 100%;">
            <el-option label="羽毛球" value="BADMINTON"></el-option>
            <el-option label="网球" value="TENNIS"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="courtForm.price" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="courtForm.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="courtForm.description" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="courtDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCourt">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Admin',
  data() {
    return {
      activeTab: 'court',
      courts: [],
      courtDialogVisible: false,
      editingCourt: null,
      courtForm: {
        courtNo: '',
        name: '',
        type: 'BADMINTON',
        price: 60,
        status: 1,
        description: ''
      },
      qrCode: '',
      verifyResult: null
    }
  },
  mounted() {
    this.loadCourts()
  },
  methods: {
    async loadCourts() {
      try {
        this.courts = await request.get('/court/list')
        this.courts = this.courts || []
      } catch (error) {
        console.error(error)
      }
    },
    showCourtDialog() {
      this.editingCourt = null
      this.courtForm = {
        courtNo: '',
        name: '',
        type: 'BADMINTON',
        price: 60,
        status: 1,
        description: ''
      }
      this.courtDialogVisible = true
    },
    editCourt(court) {
      this.editingCourt = court
      this.courtForm = { ...court }
      this.courtDialogVisible = true
    },
    async submitCourt() {
      try {
        if (this.editingCourt) {
          await request.put('/court/' + this.editingCourt.id, this.courtForm)
          this.$message.success('更新成功')
        } else {
          await request.post('/court', this.courtForm)
          this.$message.success('添加成功')
        }
        this.courtDialogVisible = false
        this.loadCourts()
      } catch (error) {
        console.error(error)
      }
    },
    deleteCourt(court) {
      this.$confirm('确定要删除该场地吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await request.delete('/court/' + court.id)
          this.$message.success('删除成功')
          this.loadCourts()
        } catch (error) {
          console.error(error)
        }
      }).catch(() => {})
    },
    async verifyIn() {
      if (!this.qrCode) {
        this.$message.warning('请输入二维码内容')
        return
      }
      try {
        await request.post('/reservation/gate/verify', {
          qrCode: this.qrCode,
          action: 'in'
        })
        this.verifyResult = {
          message: '入场验证成功，欢迎光临！',
          type: 'success'
        }
      } catch (error) {
        this.verifyResult = {
          message: '验证失败：' + (error.message || '未知错误'),
          type: 'error'
        }
      }
    },
    async verifyOut() {
      if (!this.qrCode) {
        this.$message.warning('请输入二维码内容')
        return
      }
      try {
        await request.post('/reservation/gate/verify', {
          qrCode: this.qrCode,
          action: 'out'
        })
        this.verifyResult = {
          message: '出场验证成功，感谢光临！',
          type: 'success'
        }
      } catch (error) {
        this.verifyResult = {
          message: '验证失败：' + (error.message || '未知错误'),
          type: 'error'
        }
      }
    }
  }
}
</script>

<style scoped>
.admin-page {
  padding: 20px;
}
</style>