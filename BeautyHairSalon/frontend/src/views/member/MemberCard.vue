
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="卡名称">
        <el-input v-model="queryForm.cardName" placeholder="请输入卡名称" clearable style="width: 200px;" />
      </el-form-item>
      <el-form-item label="卡类型">
        <el-select v-model="queryForm.cardType" placeholder="请选择" clearable style="width: 150px;">
          <el-option label="储值卡" :value="1" />
          <el-option label="次卡" :value="2" />
          <el-option label="套餐卡" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增卡类型</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="cardName" label="卡名称" width="150" />
      <el-table-column prop="cardType" label="卡类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getCardTypeTag(row.cardType)">{{ getCardTypeName(row.cardType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cardCode" label="卡编码" width="120" />
      <el-table-column prop="faceValue" label="面值(元)" width="100">
        <template #default="{ row }">
          ¥{{ row.faceValue }}
        </template>
      </el-table-column>
      <el-table-column prop="giveValue" label="赠送(元)" width="100">
        <template #default="{ row }">
          ¥{{ row.giveValue || 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="validityDays" label="有效期(天)" width="100">
        <template #default="{ row }">
          {{ row.validityDays || '不限' }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
  cardName: '',
  cardType: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 5
})

const tableData = ref([
  { id: 1, cardName: '银卡储值卡', cardType: 1, cardCode: 'C001', faceValue: 1000, giveValue: 100, validityDays: 730, description: '充值1000送100，全场9折', status: 1 },
  { id: 2, cardName: '金卡储值卡', cardType: 1, cardCode: 'C002', faceValue: 3000, giveValue: 500, validityDays: 730, description: '充值3000送500，全场85折', status: 1 },
  { id: 3, cardName: '钻石卡储值卡', cardType: 1, cardCode: 'C003', faceValue: 5000, giveValue: 1000, validityDays: 730, description: '充值5000送1000，全场8折', status: 1 },
  { id: 4, cardName: '剪发10次卡', cardType: 2, cardCode: 'C004', faceValue: 500, giveValue: 0, validityDays: 365, description: '可使用精剪10次', status: 1 },
  { id: 5, cardName: '烫发套餐卡', cardType: 3, cardCode: 'C005', faceValue: 888, giveValue: 0, validityDays: 365, description: '包含烫发+染发各1次', status: 1 }
])

const getCardTypeName = (type) => {
  const map = { 1: '储值卡', 2: '次卡', 3: '套餐卡' }
  return map[type] || '未知'
}

const getCardTypeTag = (type) => {
  const map = { 1: 'primary', 2: 'success', 3: 'warning' }
  return map[type] || 'info'
}

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.cardName = ''
  queryForm.cardType = ''
  pagination.current = 1
}

const handleAdd = () => {
  console.log('新增卡类型')
}

const handleEdit = (row) => {
  console.log('编辑卡类型:', row)
}

const handleDelete = (row) => {
  console.log('删除卡类型:', row)
}
</script>
