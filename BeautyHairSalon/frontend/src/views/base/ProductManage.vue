
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="商品名称">
        <el-input v-model="queryForm.productName" placeholder="请输入商品名称" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="queryForm.category" placeholder="请选择" clearable style="width: 130px;">
          <el-option label="洗护用品" value="洗护用品" />
          <el-option label="染烫产品" value="染烫产品" />
          <el-option label="护理产品" value="护理产品" />
          <el-option label="造型产品" value="造型产品" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增商品</el-button>
        <el-button type="primary" icon="Plus" @click="handleInbound">入库</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="productCode" label="商品编码" width="120" />
      <el-table-column prop="productName" label="商品名称" width="180" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="unit" label="单位" width="60" />
      <el-table-column prop="stock" label="库存" width="80">
        <template #default="{ row }">
          <span :style="{ color: row.stock < row.safetyStock ? '#F56C6C' : '' }">
            {{ row.stock }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="safetyStock" label="安全库存" width="80" />
      <el-table-column prop="salePrice" label="售价" width="100">
        <template #default="{ row }">¥{{ row.salePrice }}</template>
      </el-table-column>
      <el-table-column prop="costPrice" label="成本价" width="100">
        <template #default="{ row }">¥{{ row.costPrice }}</template>
      </el-table-column>
      <el-table-column prop="supplier" label="供应商" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="warning" link @click="handleInboundItem(row)">入库</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination-container"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const queryForm = reactive({
  productName: '',
  category: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 25
})

const tableData = ref([
  { id: 1, productCode: 'P001', productName: '滋养洗发水', category: '洗护用品', unit: '瓶', stock: 50, safetyStock: 20, salePrice: 88, costPrice: 35, supplier: 'XX供应商', status: 1 },
  { id: 2, productCode: 'P002', productName: '修复护发素', category: '洗护用品', unit: '瓶', stock: 45, safetyStock: 20, salePrice: 68, costPrice: 28, supplier: 'XX供应商', status: 1 },
  { id: 3, productCode: 'P003', productName: '营养发膜', category: '护理产品', unit: '盒', stock: 30, safetyStock: 15, salePrice: 128, costPrice: 52, supplier: 'YY供应商', status: 1 },
  { id: 4, productCode: 'P004', productName: '植物染发膏（黑色）', category: '染烫产品', unit: '盒', stock: 25, safetyStock: 10, salePrice: 158, costPrice: 65, supplier: 'ZZ供应商', status: 1 },
  { id: 5, productCode: 'P005', productName: '卷发定型喷雾', category: '造型产品', unit: '瓶', stock: 8, safetyStock: 10, salePrice: 58, costPrice: 22, supplier: 'XX供应商', status: 1 }
])

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.productName = ''
  queryForm.category = ''
  pagination.current = 1
}

const handleAdd = () => {
  console.log('新增商品')
}

const handleEdit = (row) => {
  console.log('编辑商品:', row)
}

const handleInbound = () => {
  console.log('商品入库')
}

const handleInboundItem = (row) => {
  console.log('商品入库:', row)
}
</script>
