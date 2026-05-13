
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
          <el-input v-model="searchForm.name" placeholder="请输入酒水名称"></el-input>
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
      
      <el-table :data="drinkList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="name" label="名称" width="150"></el-table-column>
        <el-table-column prop="category" label="类别" width="100">
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
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          background
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>
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
      drinkList: [
        { id: 1, name: '青岛啤酒', category: '1', price: 10, unit: '瓶', stock: 500, description: '经典青岛啤酒', status: '1' },
        { id: 2, name: '百威啤酒', category: '1', price: 15, unit: '瓶', stock: 300, description: '美国百威啤酒', status: '1' },
        { id: 3, name: '科罗娜啤酒', category: '1', price: 25, unit: '瓶', stock: 200, description: '墨西哥科罗娜', status: '1' },
        { id: 4, name: '芝华士12年', category: '2', price: 680, unit: '瓶', stock: 50, description: '苏格兰威士忌', status: '1' },
        { id: 5, name: '黑牌威士忌', category: '2', price: 580, unit: '瓶', stock: 60, description: '尊尼获加黑牌', status: '1' },
        { id: 6, name: '长城干红', category: '3', price: 128, unit: '瓶', stock: 100, description: '中国长城葡萄酒', status: '1' },
        { id: 7, name: '可口可乐', category: '4', price: 8, unit: '听', stock: 200, description: '可口可乐330ml', status: '1' },
        { id: 8, name: '农夫山泉', category: '4', price: 5, unit: '瓶', stock: 300, description: '农夫山泉矿泉水', status: '1' },
        { id: 9, name: '爆米花', category: '5', price: 25, unit: '份', stock: 50, description: '香甜爆米花', status: '1' },
        { id: 10, name: '水果拼盘(小)', category: '6', price: 68, unit: '份', stock: 30, description: '时令水果拼盘', status: '1' }
      ],
      currentPage: 1,
      pageSize: 10,
      total: 23
    }
  },
  methods: {
    getCategoryText(category) {
      const textMap = { '1': '啤酒', '2': '洋酒', '3': '红酒', '4': '饮料', '5': '小吃', '6': '水果' }
      return textMap[category] || category
    },
    handleSearch() {
      this.$message.success('搜索成功')
    },
    handleReset() {
      this.searchForm = { name: '', category: '', status: '' }
    },
    handleAdd() {
      this.$message.info('新增酒水功能')
    },
    handleEdit(row) {
      this.$message.info(`编辑酒水：${row.name}`)
    },
    handleDelete(row) {
      this.$confirm(`确认删除酒水 ${row.name}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleSizeChange(val) {
      this.pageSize = val
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
