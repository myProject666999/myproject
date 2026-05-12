
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="充值单号">
        <el-input v-model="queryForm.rechargeNo" placeholder="请输入充值单号" clearable style="width: 200px;" />
      </el-form-item>
      <el-form-item label="会员姓名">
        <el-input v-model="queryForm.memberName" placeholder="请输入会员姓名" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="充值日期">
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px;"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="rechargeNo" label="充值单号" width="180" />
      <el-table-column prop="memberName" label="会员姓名" width="100" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="cardName" label="充值卡" width="120" />
      <el-table-column prop="rechargeAmount" label="充值金额" width="100">
        <template #default="{ row }">
          <span style="color: #67C23A;">+¥{{ row.rechargeAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="giveAmount" label="赠送金额" width="100">
        <template #default="{ row }">
          <span v-if="row.giveAmount > 0" style="color: #E6A23C;">+¥{{ row.giveAmount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="payMethod" label="支付方式" width="100" />
      <el-table-column prop="createTime" label="充值时间" width="170" />
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
  rechargeNo: '',
  memberName: '',
  dateRange: []
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 50
})

const tableData = ref([
  { id: 1, rechargeNo: 'CZ202401150001', memberName: '张三', phone: '138****1234', cardName: '金卡储值卡', rechargeAmount: 3000, giveAmount: 500, payMethod: '微信支付', createTime: '2024-01-15 10:30:00' },
  { id: 2, rechargeNo: 'CZ202401150002', memberName: '王五', phone: '137****9012', cardName: '钻石卡储值卡', rechargeAmount: 5000, giveAmount: 1000, payMethod: '支付宝', createTime: '2024-01-15 14:20:00' },
  { id: 3, rechargeNo: 'CZ202401140001', memberName: '李四', phone: '139****5678', cardName: '银卡储值卡', rechargeAmount: 1000, giveAmount: 100, payMethod: '现金', createTime: '2024-01-14 16:45:00' }
])

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  queryForm.rechargeNo = ''
  queryForm.memberName = ''
  queryForm.dateRange = []
  pagination.current = 1
}
</script>
