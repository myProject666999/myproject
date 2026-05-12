
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="项目名称">
        <el-input v-model="queryForm.itemName" placeholder="请输入项目名称" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="项目分类">
        <el-select v-model="queryForm.categoryId" placeholder="请选择" clearable style="width: 150px;">
          <el-option label="美发" :value="1" />
          <el-option label="美容" :value="2" />
          <el-option label="养发" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增项目</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="itemCode" label="项目编码" width="120" />
      <el-table-column prop="itemName" label="项目名称" width="150" />
      <el-table-column prop="categoryName" label="分类" width="100" />
      <el-table-column prop="price" label="售价" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="costPrice" label="成本价" width="100">
        <template #default="{ row }">¥{{ row.costPrice }}</template>
      </el-table-column>
      <el-table-column prop="duration" label="时长(分钟)" width="100" />
      <el-table-column prop="description" label="项目描述" show-overflow-tooltip />
      <el-table-column prop="sort" label="排序" width="80" />
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
          <el-button :type="row.status === 1 ? 'warning' : 'success'" link @click="handleToggle(row)">
            {{ row.status === 1 ? '下架' : '上架' }}
          </el-button>
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
  itemName: '',
  categoryId: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 15
})

const tableData = ref([
  { id: 1, itemCode: 'S001', itemName: '精剪', categoryName: '剪发', price: 68, costPrice: 10, duration: 30, description: '专业精剪，根据脸型设计发型', sort: 1, status: 1 },
  { id: 2, itemCode: 'S002', itemName: '洗剪吹', categoryName: '剪发', price: 38, costPrice: 8, duration: 25, description: '基础洗剪吹套餐', sort: 2, status: 1 },
  { id: 3, itemCode: 'S003', itemName: '冷烫', categoryName: '烫发', price: 298, costPrice: 50, duration: 90, description: '温和冷烫，不伤发质', sort: 1, status: 1 },
  { id: 4, itemCode: 'S004', itemName: '热烫', categoryName: '烫发', price: 498, costPrice: 80, duration: 120, description: '持久热烫，卷度自然', sort: 2, status: 1 },
  { id: 5, itemCode: 'S005', itemName: '染发（黑色）', categoryName: '染发', price: 198, costPrice: 30, duration: 60, description: '植物染发剂，安全健康', sort: 1, status: 1 },
  { id: 6, itemCode: 'S006', itemName: '染发（彩色）', categoryName: '染发', price: 398, costPrice: 60, duration: 90, description: '多种颜色可选', sort: 2, status: 1 },
  { id: 7, itemCode: 'S007', itemName: '面部护理', categoryName: '美容', price: 298, costPrice: 50, duration: 60, description: '深层清洁补水', sort: 1, status: 1 },
  { id: 8, itemCode: 'S008', itemName: '精油SPA', categoryName: '养发', price: 198, costPrice: 40, duration: 45, description: '头皮精油SPA护理', sort: 1, status: 1 }
])

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.itemName = ''
  queryForm.categoryId = ''
  pagination.current = 1
}

const handleAdd = () => {
  console.log('新增项目')
}

const handleEdit = (row) => {
  console.log('编辑项目:', row)
}

const handleToggle = (row) => {
  console.log('切换状态:', row)
}
</script>
