
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="消费单号">
        <el-input v-model="queryForm.consumptionNo" placeholder="请输入消费单号" clearable style="width: 200px;" />
      </el-form-item>
      <el-form-item label="会员姓名">
        <el-input v-model="queryForm.memberName" placeholder="请输入会员姓名" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="消费类型">
        <el-select v-model="queryForm.consumptionType" placeholder="请选择" clearable style="width: 130px;">
          <el-option label="服务消费" :value="1" />
          <el-option label="商品消费" :value="2" />
          <el-option label="开卡" :value="3" />
          <el-option label="充值" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="consumptionNo" label="消费单号" width="180" />
      <el-table-column prop="memberName" label="会员姓名" width="100" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="consumptionType" label="消费类型" width="100">
        <template #default="{ row }">
          <el-tag>{{ getTypeName(row.consumptionType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="消费金额" width="100">
        <template #default="{ row }">
          <span style="color: #F56C6C;">-¥{{ row.totalAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="discountAmount" label="优惠金额" width="100">
        <template #default="{ row }">
          <span v-if="row.discountAmount > 0" style="color: #E6A23C;">-¥{{ row.discountAmount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="payAmount" label="实付金额" width="100">
        <template #default="{ row }">¥{{ row.payAmount }}</template>
      </el-table-column>
      <el-table-column prop="payMethod" label="支付方式" width="100" />
      <el-table-column prop="createTime" label="消费时间" width="170" />
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">详情</el-button>
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
  consumptionNo: '',
  memberName: '',
  consumptionType: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 80
})

const tableData = ref([
  { id: 1, consumptionNo: 'XF202401150001', memberName: '张三', phone: '138****1234', consumptionType: 1, totalAmount: 268, discountAmount: 26.8, payAmount: 241.2, payMethod: '会员卡', createTime: '2024-01-15 10:30:00' },
  { id: 2, consumptionNo: 'XF202401150002', memberName: '王五', phone: '137****9012', consumptionType: 2, totalAmount: 256, discountAmount: 0, payAmount: 256, payMethod: '微信支付', createTime: '2024-01-15 14:20:00' },
  { id: 3, consumptionNo: 'XF202401150003', memberName: '赵六', phone: '136****3456', consumptionType: 1, totalAmount: 38, discountAmount: 0, payAmount: 38, payMethod: '现金', createTime: '2024-01-15 15:45:00' },
  { id: 4, consumptionNo: 'XF202401140001', memberName: '李四', phone: '139****5678', consumptionType: 3, totalAmount: 1000, discountAmount: 0, payAmount: 1000, payMethod: '支付宝', createTime: '2024-01-14 16:45:00' }
])

const getTypeName = (type) => {
  const map = { 1: '服务消费', 2: '商品消费', 3: '开卡', 4: '充值' }
  return map[type] || '未知'
}

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.consumptionNo = ''
  queryForm.memberName = ''
  queryForm.consumptionType = ''
  pagination.current = 1
}

const handleView = (row) => {
  console.log('查看消费详情:', row)
}
</script>
