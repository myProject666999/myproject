
<template>
  <div class="drink-manage">
    <el-card>
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="16">
            <span>酒水管理</span>
          </el-col>
          <el-col :span="8" style="text-align: right;">
            <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
              新增酒水
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="酒水名称">
          <el-input v-model="searchForm.name" placeholder="请输入酒水名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable>
            <el-option label="啤酒" value="1"></el-option>
            <el-option label="洋酒" value="2"></el-option>
            <el-option label="红酒" value="3"></el-option>
            <el-option label="饮料" value="4"></el-option>
            <el-option label="小吃" value="5"></el-option>
            <el-option label="水果" value="6"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="上架" value="1"></el-option>
            <el-option label="下架" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="pageData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="name" label="名称" width="150"></el-table-column>
        <el-table-column prop="category" label="类别" width="80">
          <template slot-scope="scope">
            <el-tag>{{ getCategoryText(scope.row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">¥{{ scope.row.price }}/{{ scope.row.unit }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">
              {{ scope.row.status === '1' ? '上架' : '下架' }}
            </el-tag>
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
        <el-form-item label="酒水名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入酒水名称"></el-input>
        </el-form-item>
        <el-form-item label="酒水类别" prop="category">
          <el-select v-model="formData.category" placeholder="请选择酒水类别" style="width: 100%;">
            <el-option label="啤酒" value="1"></el-option>
            <el-option label="洋酒" value="2"></el-option>
            <el-option label="红酒" value="3"></el-option>
            <el-option label="饮料" value="4"></el-option>
            <el-option label="小吃" value="5"></el-option>
            <el-option label="水果" value="6"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格 (¥)" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="formData.unit" placeholder="请选择单位" style="width: 100%;">
            <el-option label="瓶" value="瓶"></el-option>
            <el-option label="听" value="听"></el-option>
            <el-option label="杯" value="杯"></el-option>
            <el-option label="份" value="份"></el-option>
            <el-option label="扎" value="扎"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input-number v-model="formData.stock" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="上架状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">上架</el-radio>
            <el-radio label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="formData.description" :rows="3" placeholder="请输入酒水描述"></el-input>
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
  name: 'DrinkManage',
  data() {
    return {
      searchForm: {
        name: '',
        category: '',
        status: ''
      },
      allDrinks: [
        { id: 1, name: '青岛啤酒', category: '1', price: 10, unit: '瓶', stock: 500, description: '经典青岛啤酒', status: '1' },
        { id: 2, name: '百威啤酒', category: '1', price: 15, unit: '瓶', stock: 300, description: '美国百威啤酒', status: '1' },
        { id: 3, name: '科罗娜啤酒', category: '1', price: 25, unit: '瓶', stock: 200, description: '墨西哥科罗娜', status: '1' },
        { id: 4, name: '哈尔滨啤酒', category: '1', price: 8, unit: '瓶', stock: 400, description: '哈尔滨小麦王', status: '1' },
        { id: 5, name: '雪花啤酒', category: '1', price: 8, unit: '瓶', stock: 350, description: '雪花勇闯天涯', status: '1' },
        { id: 6, name: '芝华士12年', category: '2', price: 680, unit: '瓶', stock: 50, description: '苏格兰威士忌', status: '1' },
        { id: 7, name: '黑牌威士忌', category: '2', price: 580, unit: '瓶', stock: 60, description: '尊尼获加黑牌', status: '1' },
        { id: 8, name: '人头马VSOP', category: '2', price: 1280, unit: '瓶', stock: 30, description: '法国干邑白兰地', status: '1' },
        { id: 9, name: '杰克丹尼', category: '2', price: 480, unit: '瓶', stock: 40, description: '美国田纳西威士忌', status: '1' },
        { id: 10, name: '长城干红', category: '3', price: 128, unit: '瓶', stock: 100, description: '中国长城葡萄酒', status: '1' },
        { id: 11, name: '张裕解百纳', category: '3', price: 158, unit: '瓶', stock: 80, description: '张裕解百纳干红', status: '1' },
        { id: 12, name: '拉菲传奇', category: '3', price: 398, unit: '瓶', stock: 40, description: '法国拉菲传奇', status: '1' },
        { id: 13, name: '可口可乐', category: '4', price: 8, unit: '听', stock: 200, description: '可口可乐330ml', status: '1' },
        { id: 14, name: '农夫山泉', category: '4', price: 5, unit: '瓶', stock: 300, description: '农夫山泉矿泉水', status: '1' },
        { id: 15, name: '脉动', category: '4', price: 8, unit: '瓶', stock: 150, description: '脉动维生素饮料', status: '1' },
        { id: 16, name: '红牛', category: '4', price: 10, unit: '听', stock: 120, description: '红牛维生素功能饮料', status: '1' },
        { id: 17, name: '爆米花', category: '5', price: 25, unit: '份', stock: 50, description: '香甜爆米花', status: '1' },
        { id: 18, name: '炸薯条', category: '5', price: 20, unit: '份', stock: 60, description: '香脆炸薯条', status: '1' },
        { id: 19, name: '炸鸡翅', category: '5', price: 30, unit: '份', stock: 40, description: '香酥炸鸡翅', status: '1' },
        { id: 20, name: '水果拼盘(小)', category: '6', price: 68, unit: '份', stock: 30, description: '时令水果拼盘(2-3人)', status: '1' },
        { id: 21, name: '水果拼盘(中)', category: '6', price: 98, unit: '份', stock: 25, description: '时令水果拼盘(4-6人)', status: '1' },
        { id: 22, name: '水果拼盘(大)', category: '6', price: 138, unit: '份', stock: 20, description: '时令水果拼盘(8-10人)', status: '1' },
        { id: 23, name: '瓜子花生', category: '5', price: 15, unit: '份', stock: 80, description: '瓜子花生拼盘', status: '1' }
      ],
      currentPage: 1,
      pageSize: 5,
      dialogVisible: false,
      isEdit: false,
      dialogTitle: '',
      formData: {
        id: null,
        name: '',
        category: '',
        price: 0,
        unit: '瓶',
        stock: 0,
        status: '1',
        description: ''
      },
      formRules: {
        name: [{ required: true, message: '请输入酒水名称', trigger: 'blur' }],
        category: [{ required: true, message: '请选择酒水类别', trigger: 'change' }],
        price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
        unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
        stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
        status: [{ required: true, message: '请选择上架状态', trigger: 'change' }]
      }
    }
  },
  computed: {
    filteredDrinks() {
      return this.allDrinks.filter(drink => {
        const nameMatch = !this.searchForm.name || drink.name.includes(this.searchForm.name)
        const categoryMatch = !this.searchForm.category || drink.category === this.searchForm.category
        const statusMatch = !this.searchForm.status || drink.status === this.searchForm.status
        return nameMatch && categoryMatch && statusMatch
      })
    },
    total() {
      return this.filteredDrinks.length
    },
    pageData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredDrinks.slice(start, end)
    }
  },
  methods: {
    getCategoryText(category) {
      const textMap = { '1': '啤酒', '2': '洋酒', '3': '红酒', '4': '饮料', '5': '小吃', '6': '水果' }
      return textMap[category] || category
    },
    handleSearch() {
      this.currentPage = 1
      this.$message.success(`搜索成功，共找到 ${this.total} 条记录`)
    },
    handleReset() {
      this.searchForm = { name: '', category: '', status: '' }
      this.currentPage = 1
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增酒水'
      this.formData = {
        id: null,
        name: '',
        category: '',
        price: 0,
        unit: '瓶',
        stock: 0,
        status: '1',
        description: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑酒水'
      this.formData = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm(`确认删除酒水 "${row.name}"？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.allDrinks.findIndex(item => item.id === row.id)
        if (index > -1) {
          this.allDrinks.splice(index, 1)
        }
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          if (this.isEdit) {
            const index = this.allDrinks.findIndex(item => item.id === this.formData.id)
            if (index > -1) {
              this.allDrinks[index] = { ...this.formData }
            }
            this.$message.success('修改成功')
          } else {
            const newId = Math.max(...this.allDrinks.map(d => d.id)) + 1
            this.allDrinks.push({ ...this.formData, id: newId })
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
.drink-manage {
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
