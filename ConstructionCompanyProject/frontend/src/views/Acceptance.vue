<template>
  <div>
    <el-card shadow="hover">
      <div slot="header" class="header">
        <span>验收管理</span>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增验收</el-button>
      </div>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="acceptanceNo" label="验收编号"></el-table-column>
        <el-table-column prop="acceptanceName" label="验收名称"></el-table-column>
        <el-table-column prop="projectId" label="项目ID" width="100"></el-table-column>
        <el-table-column prop="acceptanceDate" label="验收日期"></el-table-column>
        <el-table-column prop="acceptor" label="验收人"></el-table-column>
        <el-table-column prop="result" label="验收结果">
          <template slot-scope="scope">
            <el-tag :type="scope.row.result === '通过' ? 'success' : 'danger'">{{ scope.row.result }}</el-tag>
          </template>
        </el-table-column>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="验收编号" prop="acceptanceNo">
          <el-input v-model="form.acceptanceNo"></el-input>
        </el-form-item>
        <el-form-item label="验收名称" prop="acceptanceName">
          <el-input v-model="form.acceptanceName"></el-input>
        </el-form-item>
        <el-form-item label="项目ID" prop="projectId">
          <el-input v-model="form.projectId"></el-input>
        </el-form-item>
        <el-form-item label="验收日期" prop="acceptanceDate">
          <el-date-picker v-model="form.acceptanceDate" type="date" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="验收人" prop="acceptor">
          <el-input v-model="form.acceptor"></el-input>
        </el-form-item>
        <el-form-item label="验收结果" prop="result">
          <el-select v-model="form.result" style="width: 100%;">
            <el-option label="通过" value="通过"></el-option>
            <el-option label="不通过" value="不通过"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="存在问题" prop="problem">
          <el-input type="textarea" v-model="form.problem"></el-input>
        </el-form-item>
        <el-form-item label="建议" prop="suggestion">
          <el-input type="textarea" v-model="form.suggestion"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%;">
            <el-option label="待验收" value="待验收"></el-option>
            <el-option label="验收中" value="验收中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
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
import { acceptanceApi } from '../api'

export default {
  name: 'Acceptance',
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      dialogTitle: '新增验收',
      isEdit: false,
      form: {
        id: null,
        projectId: '',
        constructionNodeId: '',
        acceptanceNo: '',
        acceptanceName: '',
        acceptanceDate: '',
        acceptor: '',
        result: '',
        problem: '',
        suggestion: '',
        status: '待验收',
        remark: ''
      },
      rules: {
        acceptanceNo: [{ required: true, message: '请输入验收编号', trigger: 'blur' }],
        acceptanceName: [{ required: true, message: '请输入验收名称', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await acceptanceApi.list()
        this.tableData = res.data || []
      } catch (error) {
        this.$message.error('加载数据失败')
      }
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增验收'
      this.form = { id: null, projectId: '', constructionNodeId: '', acceptanceNo: '', acceptanceName: '', acceptanceDate: '', acceptor: '', result: '', problem: '', suggestion: '', status: '待验收', remark: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑验收'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该验收吗？', '提示', { type: 'warning' })
        await acceptanceApi.delete(id)
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
              await acceptanceApi.update(this.form)
              this.$message.success('更新成功')
            } else {
              await acceptanceApi.add(this.form)
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
        '待验收': 'warning',
        '验收中': 'primary',
        '已完成': 'success'
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
