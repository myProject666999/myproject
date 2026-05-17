<template>
  <div>
    <el-card shadow="hover">
      <div slot="header" class="header">
        <span>工人管理</span>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增工人</el-button>
      </div>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="idCard" label="身份证号"></el-table-column>
        <el-table-column prop="position" label="职位"></el-table-column>
        <el-table-column prop="skill" label="技能"></el-table-column>
        <el-table-column prop="dailyWage" label="日薪"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '在岗' ? 'success' : 'info'">{{ scope.row.status }}</el-tag>
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
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard"></el-input>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position"></el-input>
        </el-form-item>
        <el-form-item label="技能" prop="skill">
          <el-input v-model="form.skill"></el-input>
        </el-form-item>
        <el-form-item label="日薪" prop="dailyWage">
          <el-input v-model="form.dailyWage"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%;">
            <el-option label="在岗" value="在岗"></el-option>
            <el-option label="离岗" value="离岗"></el-option>
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
import { workerApi } from '../api'

export default {
  name: 'Worker',
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      dialogTitle: '新增工人',
      isEdit: false,
      form: {
        id: null,
        name: '',
        phone: '',
        idCard: '',
        position: '',
        skill: '',
        dailyWage: '',
        status: '在岗',
        remark: ''
      },
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入电话', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await workerApi.list()
        this.tableData = res.data || []
      } catch (error) {
        this.$message.error('加载数据失败')
      }
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增工人'
      this.form = { id: null, name: '', phone: '', idCard: '', position: '', skill: '', dailyWage: '', status: '在岗', remark: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑工人'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该工人吗？', '提示', { type: 'warning' })
        await workerApi.delete(id)
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
              await workerApi.update(this.form)
              this.$message.success('更新成功')
            } else {
              await workerApi.add(this.form)
              this.$message.success('新增成功')
            }
            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            this.$message.error(this.isEdit ? '更新失败' : '新增失败')
          }
        }
      })
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
