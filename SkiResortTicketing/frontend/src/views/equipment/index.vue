<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>雪具租赁管理</span>
          <div>
            <el-button type="success" @click="handleRent">借出借出</el-button>
            <el-button type="info" @click="handleReturn">归还</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="雪具类型" name="type">
          <el-table :data="equipmentTypes" border>
            <el-table-column prop="name" label="雪具名称" />
            <el-table-column prop="code" label="编码" width="120" />
            <el-table-column prop="deposit" label="押金(元)" width="120">
              <template #default="{ row }"><span style="color: #e6a23c">¥{{ row.deposit }}</span></template>
            </el-table-column>
            <el-table-column prop="rentalPrice" label="租赁单价(元/次)" width="150">
              <template #default="{ row }"><span style="color: #f56c6c">¥{{ row.rentalPrice }}</span></template>
            </el-table-column>
            <el-table-column prop="description" label="描述" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="雪具库存" name="stock">
          <el-table :data="equipmentStock" border>
            <el-table-column prop="equipmentNo" label="雪具编号" width="120" />
            <el-table-column prop="typeName" label="雪具类型" />
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="租赁记录" name="rental">
          <el-table :data="rentalRecords" border>
            <el-table-column prop="orderNo" label="订单编号" width="160" />
            <el-table-column prop="equipmentNo" label="雪具编号" width="120" />
            <el-table-column prop="equipmentType" label="雪具类型" />
            <el-table-column prop="deposit" label="押金(元)" width="100">
              <template #default="{ row }"><span style="color: #e6a23c">¥{{ row.deposit }}</span></template>
            </el-table-column>
            <el-table-column prop="rentTime" label="借出时间" width="160" />
            <el-table-column prop="returnTime" label="归还时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getRentalStatusType(row.status)">{{ getRentalStatusName(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('type')

const equipmentTypes = ref([
  { name: '双板滑雪板', code: 'SKI_BOARD', deposit: 500, rentalPrice: 80, description: '双板套装含固定器' },
  { name: '单板滑雪板', code: 'SNOWBOARD', deposit: 500, rentalPrice: 100, description: '单板含固定器' },
  { name: '滑雪鞋', code: 'SKI_BOOTS', deposit: 200, rentalPrice: 40, description: '专业滑雪鞋' },
  { name: '头盔', code: 'HELMET', deposit: 100, rentalPrice: 20, description: '滑雪头盔' },
  { name: '雪杖', code: 'SKI_POLES', deposit: 50, rentalPrice: 10, description: '滑雪杖' },
  { name: '护目镜', code: 'GOGGLES', deposit: 100, rentalPrice: 30, description: '滑雪护目镜' },
  { name: '护具套装', code: 'PROTECTION', deposit: 150, rentalPrice: 40, description: '护膝护肘护臀套装' },
  { name: '滑雪服', code: 'SKI_JACKET', deposit: 300, rentalPrice: 60, description: '专业滑雪服套装' }
])

const equipmentStock = ref([
  { equipmentNo: 'SB001', typeName: '双板滑雪板', specification: '160cm', status: 0 },
  { equipmentNo: 'SB002', typeName: '双板滑雪板', specification: '165cm', status: 0 },
  { equipmentNo: 'SN001', typeName: '单板滑雪板', specification: '155cm', status: 1 },
  { equipmentNo: 'BT001', typeName: '滑雪鞋', specification: '38码', status: 1 },
  { equipmentNo: 'BT002', typeName: '滑雪鞋', specification: '40码', status: 0 },
  { equipmentNo: 'HM001', typeName: '头盔', specification: 'M码', status: 1 }
])

const rentalRecords = ref([
  { orderNo: 'ORD202405140001', equipmentNo: 'SN001', equipmentType: '单板滑雪板', deposit: 500, rentTime: '2024-05-14 10:30:00', returnTime: null, status: 1 },
  { orderNo: 'ORD202405140001', equipmentNo: 'BT001', equipmentType: '滑雪鞋', deposit: 200, rentTime: '2024-05-14 10:30:00', returnTime: null, status: 1 },
  { orderNo: 'ORD202405140002', equipmentNo: 'HM001', equipmentType: '头盔', deposit: 100, rentTime: '2024-05-14 09:15:00', returnTime: '2024-05-14 15:45:00', status: 2 }
])

const getStatusName = (status) => {
  const map = { 0: '在库', 1: '已借出', 2: '维修中', 3: '报废' }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = { 0: 'success', 1: 'warning', 2: 'danger', 3: 'info' }
  return map[status] || 'info'
}

const getRentalStatusName = (status) => {
  const map = { 1: '租赁中', 2: '已归还', 3: '损坏/遗失' }
  return map[status] || status
}

const getRentalStatusType = (status) => {
  const map = { 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

const handleRent = () => {}
const handleReturn = () => {}
</script>
