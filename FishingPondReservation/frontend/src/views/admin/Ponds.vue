<template>
  <div class="ponds-admin">
    <el-card>
      <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold;">塘位管理</span>
        <el-button type="primary" @click="openDialog">新增塘位</el-button>
      </div>

      <el-table :data="ponds" border>
        <el-table-column prop="pondNo" label="塘位编号" width="120"></el-table-column>
        <el-table-column prop="name" label="名称" width="150"></el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pricePerDay" label="价格(元/天)" width="120">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.pricePerDay }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量(人)" width="100"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="editPond(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deletePond(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="塘位编号">
          <el-input v-model="form.pondNo"></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 100%;">
            <el-option label="综合塘" value="综合塘"></el-option>
            <el-option label="鲫鱼塘" value="鲫鱼塘"></el-option>
            <el-option label="鲤鱼塘" value="鲤鱼塘"></el-option>
            <el-option label="青鱼塘" value="青鱼塘"></el-option>
            <el-option label="竞技塘" value="竞技塘"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.pricePerDay" :min="0" :precision="2"></el-input-number>
        </el-form-item>
        <el-form-item label="容量">
          <el-input-number v-model="form.capacity" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../utils/request'

export default {
  name: 'PondsAdmin',
  data() {
    return {
      ponds: [],
      dialogVisible: false,
      dialogTitle: '新增塘位',
      submitting: false,
      form: {
        id: null,
        pondNo: '',
        name: '',
        type: '综合塘',
        pricePerDay: 200,
        capacity: 1,
        description: '',
        status: 1
      }
    }
  },
  mounted() {
    this.loadPonds()
  },
  methods: {
    async loadPonds() {
      try {
        const res = await request.get('/pond/list')
        this.ponds = res.data
      } catch (error) {
        console.error(error)
      }
    },
    openDialog() {
      this.dialogTitle = '新增塘位'
      this.form = {
        id: null,
        pondNo: '',
        name: '',
        type: '综合塘',
        pricePerDay: 200,
        capacity: 1,
        description: '',
        status: 1
      }
      this.dialogVisible = true
    },
    editPond(row) {
      this.dialogTitle = '编辑塘位'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async deletePond(id) {
      this.$confirm('确定要删除该塘位吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await request.delete('/pond/' + id)
          this.$message.success('删除成功')
          this.loadPonds()
        } catch (error) {
          console.error(error)
        }
      }).catch(() => {})
    },
    async submitForm() {
      this.submitting = true
      try {
        if (this.form.id) {
          await request.put('/pond/' + this.form.id, this.form)
          this.$message.success('更新成功')
        } else {
          await request.post('/pond', this.form)
          this.$message.success('添加成功')
        }
        this.dialogVisible = false
        this.loadPonds()
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
.ponds-admin {
  padding: 10px;
}
</style>
