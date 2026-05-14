<template>
  <div class="equipment-admin">
    <el-card>
      <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold;">商品管理</span>
        <el-button type="primary" @click="openDialog">新增商品</el-button>
      </div>

      <el-table :data="equipment" border>
        <el-table-column prop="name" label="商品名称"></el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template slot-scope="scope">
            <el-tag size="small">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template slot-scope="scope">
            <span :style="{ color: scope.row.stock < 10 ? '#e6a23c' : '#67c23a' }">{{ scope.row.stock }} {{ scope.row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="editItem(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteItem(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" placeholder="鱼竿/渔轮/鱼线/鱼钩/饵料/浮漂/配件"></el-input>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2"></el-input-number>
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.unit" placeholder="支/个/卷/包/袋"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2"></el-input>
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
  name: 'EquipmentAdmin',
  data() {
    return {
      equipment: [],
      dialogVisible: false,
      dialogTitle: '新增商品',
      submitting: false,
      form: {
        id: null,
        name: '',
        category: '',
        price: 0,
        stock: 0,
        unit: '',
        description: '',
        status: 1
      }
    }
  },
  mounted() {
    this.loadEquipment()
  },
  methods: {
    async loadEquipment() {
      try {
        const res = await request.get('/equipment/list')
        this.equipment = res.data
      } catch (error) {
        console.error(error)
      }
    },
    openDialog() {
      this.dialogTitle = '新增商品'
      this.form = {
        id: null,
        name: '',
        category: '',
        price: 0,
        stock: 0,
        unit: '',
        description: '',
        status: 1
      }
      this.dialogVisible = true
    },
    editItem(row) {
      this.dialogTitle = '编辑商品'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async deleteItem(id) {
      this.$confirm('确定要删除该商品吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await request.delete('/equipment/' + id)
          this.$message.success('删除成功')
          this.loadEquipment()
        } catch (error) {
          console.error(error)
        }
      }).catch(() => {})
    },
    async submitForm() {
      this.submitting = true
      try {
        if (this.form.id) {
          await request.put('/equipment/' + this.form.id, this.form)
          this.$message.success('更新成功')
        } else {
          await request.post('/equipment', this.form)
          this.$message.success('添加成功')
        }
        this.dialogVisible = false
        this.loadEquipment()
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
.equipment-admin {
  padding: 10px;
}
</style>
