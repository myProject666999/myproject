<template>
  <div>
    <el-card shadow="hover">
      <div slot="header" class="header">
        <span>项目管理</span>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增项目</el-button>
      </div>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="projectName" label="项目名称"></el-table-column>
        <el-table-column prop="projectAddress" label="项目地址"></el-table-column>
        <el-table-column prop="budget" label="预算"></el-table-column>
        <el-table-column prop="startDate" label="开始日期"></el-table-column>
        <el-table-column prop="endDate" label="结束日期"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="projectManager" label="项目经理"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName"></el-input>
        </el-form-item>
        <el-form-item label="项目地址" prop="projectAddress">
          <el-input v-model="form.projectAddress"></el-input>
        </el-form-item>
        <el-form-item label="预算" prop="budget">
          <el-input v-model="form.budget"></el-input>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="form.startDate" type="date" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="form.endDate" type="date" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%;">
            <el-option label="进行中" value="进行中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="暂停" value="暂停"></el-option>
            <el-option label="已取消" value="已取消"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目经理" prop="projectManager">
          <el-input v-model="form.projectManager"></el-input>
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
import { projectApi } from '../api'

export default {
  name: 'Project',
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      dialogTitle: '新增项目',
      isEdit: false,
      form: {
        id: null,
        projectName: '',
        projectAddress: '',
        budget: '',
        startDate: '',
        endDate: '',
        status: '进行中',
        projectManager: '',
        remark: ''
      },
      rules: {
        projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await projectApi.list()
        this.tableData = res.data || []
      } catch (error) {
        this.$message.error('加载数据失败')
      }
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增项目'
      this.form = { id: null, projectName: '', projectAddress: '', budget: '', startDate: '', endDate: '', status: '进行中', projectManager: '', remark: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑项目'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该项目吗？', '提示', { type: 'warning' })
        await projectApi.delete(id)
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
              await projectApi.update(this.form)
              this.$message.success('更新成功')
            } else {
              await projectApi.add(this.form)
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
        '暂停': 'warning',
        '已取消': 'danger'
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
