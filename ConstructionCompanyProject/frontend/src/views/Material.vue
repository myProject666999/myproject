<template>
  <div>
    <el-card shadow="hover">
      <div slot="header" class="header">
        <span>材料管理</span>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增材料</el-button>
      </div>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="materialName" label="材料名称"></el-table-column>
        <el-table-column prop="materialCode" label="材料编码"></el-table-column>
        <el-table-column prop="specification" label="规格"></el-table-column>
        <el-table-column prop="unit" label="单位"></el-table-column>
        <el-table-column prop="unitPrice" label="单价"></el-table-column>
        <el-table-column prop="stock" label="库存"></el-table-column>
        <el-table-column prop="supplier" label="供应商"></el-table-column>
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
        <el-form-item label="材料名称" prop="materialName">
          <el-input v-model="form.materialName"></el-input>
        </el-form-item>
        <el-form-item label="材料编码" prop="materialCode">
          <el-input v-model="form.materialCode"></el-input>
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input v-model="form.specification"></el-input>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit"></el-input>
        </el-form-item>
        <el-form-item label="单价" prop="unitPrice">
          <el-input v-model="form.unitPrice"></el-input>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input v-model="form.stock"></el-input>
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier"></el-input>
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
import { materialApi } from '../api'

export default {
  name: 'Material',
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      dialogTitle: '新增材料',
      isEdit: false,
      form: {
        id: null,
        materialName: '',
        materialCode: '',
        specification: '',
        unit: '',
        unitPrice: '',
        stock: '',
        supplier: '',
        remark: ''
      },
      rules: {
        materialName: [{ required: true, message: '请输入材料名称', trigger: 'blur' }],
        materialCode: [{ required: true, message: '请输入材料编码', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await materialApi.list()
        this.tableData = res.data || []
      } catch (error) {
        this.$message.error('加载数据失败')
      }
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增材料'
      this.form = { id: null, materialName: '', materialCode: '', specification: '', unit: '', unitPrice: '', stock: '', supplier: '', remark: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑材料'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该材料吗？', '提示', { type: 'warning' })
        await materialApi.delete(id)
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
              await materialApi.update(this.form)
              this.$message.success('更新成功')
            } else {
              await materialApi.add(this.form)
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
