<template>
  <div>
    <el-card shadow="hover">
      <div slot="header" class="header">
        <span>进度管理</span>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增进度</el-button>
      </div>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="projectId" label="项目ID" width="100"></el-table-column>
        <el-table-column prop="customerId" label="客户ID" width="100"></el-table-column>
        <el-table-column prop="stage" label="阶段"></el-table-column>
        <el-table-column prop="progressPercent" label="进度百分比">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.progressPercent || 0"></el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="progressDescription" label="进度描述"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="项目ID" prop="projectId">
          <el-input v-model="form.projectId"></el-input>
        </el-form-item>
        <el-form-item label="客户ID" prop="customerId">
          <el-input v-model="form.customerId"></el-input>
        </el-form-item>
        <el-form-item label="阶段" prop="stage">
          <el-input v-model="form.stage"></el-input>
        </el-form-item>
        <el-form-item label="进度百分比" prop="progressPercent">
          <el-slider v-model="form.progressPercent" :min="0" :max="100" show-input></el-slider>
        </el-form-item>
        <el-form-item label="进度描述" prop="progressDescription">
          <el-input type="textarea" v-model="form.progressDescription"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%;">
            <el-option label="进行中" value="进行中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="延期" value="延期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { progressApi } from '../api'

export default {
  name: 'Progress',
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      dialogTitle: '新增进度',
      isEdit: false,
      form: {
        id: null,
        projectId: '',
        customerId: '',
        stage: '',
        progressPercent: 0,
        progressDescription: '',
        status: '进行中',
        remark: ''
      },
      rules: {
        projectId: [{ required: true, message: '请输入项目ID', trigger: 'blur' }],
        stage: [{ required: true, message: '请输入阶段', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await progressApi.list()
        this.tableData = res.data || []
      } catch (error) {
        this.$message.error('加载数据失败')
      }
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增进度'
      this.form = { id: null, projectId: '', customerId: '', stage: '', progressPercent: 0, progressDescription: '', status: '进行中', remark: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑进度'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该进度吗？', '提示', { type: 'warning' })
        await progressApi.delete(id)
        this.$message.success('删除成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    async handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            if (this.isEdit) {
              await progressApi.update(this.form)
              this.$message.success('更新成功')
            } else {
              await progressApi.add(this.form)
              this.$message.success('新增成功')
            }
            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            this.$message.error(this.isEdit ? '更新失败' : '新增失败')
          }
        }
      })
    },
    getStatusType(status) {
      const typeMap = {
        '进行中': 'primary',
        '已完成': 'success',
        '延期': 'warning'
      }
      return typeMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
