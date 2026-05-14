<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>雪具租赁管理</span>
          <div>
            <el-button type="success" @click="openRentDialog">
              <el-icon><Plus /></el-icon>
              借出
            </el-button>
            <el-button type="info" @click="openReturnDialog">
              <el-icon><Minus /></el-icon>
              归还
            </el-button>
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

    <el-dialog v-model="rentDialogVisible" title="雪具借出" width="600px">
      <el-form :model="rentForm" label-width="100px">
        <el-form-item label="订单编号">
          <el-input v-model="rentForm.orderNo" placeholder="请输入或选择订单编号" />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="rentForm.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="rentForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="选择雪具">
          <el-select v-model="rentForm.equipmentIds" multiple placeholder="请选择要借出的雪具" style="width: 100%">
            <el-option
              v-for="item in availableEquipments"
              :key="item.id"
              :label="`${item.equipmentNo} - ${item.typeName} (${item.specification})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRentConfirm">确认借出</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="returnDialogVisible" title="雪具归还" width="600px">
      <el-form :model="returnForm" label-width="100px">
        <el-form-item label="选择归还雪具">
          <el-select v-model="returnForm.rentalIds" multiple placeholder="请选择要归还的雪具" style="width: 100%">
            <el-option
              v-for="item in rentedEquipments"
              :key="item.id"
              :label="`${item.equipmentNo} - ${item.equipmentType} (押金: ¥${item.deposit})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReturnConfirm">确认归还</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('type')
const rentDialogVisible = ref(false)
const returnDialogVisible = ref(false)

const rentForm = reactive({
  orderNo: '',
  customerName: '',
  phone: '',
  equipmentIds: []
})

const returnForm = reactive({
  rentalIds: []
})

const equipmentTypes = ref([
  { id: 1, name: '双板滑雪板', code: 'SKI_BOARD', deposit: 500, rentalPrice: 80, description: '双板套装含固定器' },
  { id: 2, name: '单板滑雪板', code: 'SNOWBOARD', deposit: 500, rentalPrice: 100, description: '单板含固定器' },
  { id: 3, name: '滑雪鞋', code: 'SKI_BOOTS', deposit: 200, rentalPrice: 40, description: '专业滑雪鞋' },
  { id: 4, name: '头盔', code: 'HELMET', deposit: 100, rentalPrice: 20, description: '滑雪头盔' },
  { id: 5, name: '雪杖', code: 'SKI_POLES', deposit: 50, rentalPrice: 10, description: '滑雪杖' },
  { id: 6, name: '护目镜', code: 'GOGGLES', deposit: 100, rentalPrice: 30, description: '滑雪护目镜' },
  { id: 7, name: '护具套装', code: 'PROTECTION', deposit: 150, rentalPrice: 40, description: '护膝护肘护臀套装' },
  { id: 8, name: '滑雪服', code: 'SKI_JACKET', deposit: 300, rentalPrice: 60, description: '专业滑雪服套装' }
])

const equipmentStock = ref([
  { id: 1, equipmentNo: 'SB001', typeName: '双板滑雪板', specification: '160cm', status: 0, typeId: 1 },
  { id: 2, equipmentNo: 'SB002', typeName: '双板滑雪板', specification: '165cm', status: 0, typeId: 1 },
  { id: 3, equipmentNo: 'SB003', typeName: '双板滑雪板', specification: '170cm', status: 0, typeId: 1 },
  { id: 4, equipmentNo: 'SB004', typeName: '双板滑雪板', specification: '175cm', status: 0, typeId: 1 },
  { id: 5, equipmentNo: 'SN001', typeName: '单板滑雪板', specification: '155cm', status: 1, typeId: 2 },
  { id: 6, equipmentNo: 'SN002', typeName: '单板滑雪板', specification: '160cm', status: 0, typeId: 2 },
  { id: 7, equipmentNo: 'SN003', typeName: '单板滑雪板', specification: '150cm', status: 0, typeId: 2 },
  { id: 8, equipmentNo: 'BT001', typeName: '滑雪鞋', specification: '38码', status: 1, typeId: 3 },
  { id: 9, equipmentNo: 'BT002', typeName: '滑雪鞋', specification: '40码', status: 0, typeId: 3 },
  { id: 10, equipmentNo: 'BT003', typeName: '滑雪鞋', specification: '42码', status: 0, typeId: 3 },
  { id: 11, equipmentNo: 'BT004', typeName: '滑雪鞋', specification: '44码', status: 0, typeId: 3 },
  { id: 12, equipmentNo: 'HM001', typeName: '头盔', specification: 'M码', status: 1, typeId: 4 },
  { id: 13, equipmentNo: 'HM002', typeName: '头盔', specification: 'L码', status: 0, typeId: 4 },
  { id: 14, equipmentNo: 'PL001', typeName: '雪杖', specification: '标准', status: 0, typeId: 5 },
  { id: 15, equipmentNo: 'PL002', typeName: '雪杖', specification: '标准', status: 0, typeId: 5 },
  { id: 16, equipmentNo: 'GG001', typeName: '护目镜', specification: '标准', status: 0, typeId: 6 },
  { id: 17, equipmentNo: 'PR001', typeName: '护具套装', specification: 'M码', status: 0, typeId: 7 },
  { id: 18, equipmentNo: 'PR002', typeName: '护具套装', specification: 'L码', status: 0, typeId: 7 },
  { id: 19, equipmentNo: 'SJ001', typeName: '滑雪服', specification: 'M码', status: 0, typeId: 8 },
  { id: 20, equipmentNo: 'SJ002', typeName: '滑雪服', specification: 'L码', status: 0, typeId: 8 }
])

const rentalRecords = ref([
  { id: 1, orderNo: 'ORD202405140001', equipmentId: 5, equipmentNo: 'SN001', equipmentType: '单板滑雪板', deposit: 500, rentalPrice: 100, rentTime: '2024-05-14 10:30:00', returnTime: null, status: 1 },
  { id: 2, orderNo: 'ORD202405140001', equipmentId: 8, equipmentNo: 'BT001', equipmentType: '滑雪鞋', deposit: 200, rentalPrice: 40, rentTime: '2024-05-14 10:30:00', returnTime: null, status: 1 },
  { id: 3, orderNo: 'ORD202405140002', equipmentId: 12, equipmentNo: 'HM001', equipmentType: '头盔', deposit: 100, rentalPrice: 20, rentTime: '2024-05-14 09:15:00', returnTime: '2024-05-14 15:45:00', status: 2 }
])

const availableEquipments = computed(() => {
  return equipmentStock.value.filter(item => item.status === 0)
})

const rentedEquipments = computed(() => {
  return rentalRecords.value.filter(item => item.status === 1)
})

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

const openRentDialog = () => {
  if (availableEquipments.value.length === 0) {
    ElMessage.warning('当前没有可用的雪具！')
    return
  }
  rentForm.orderNo = ''
  rentForm.customerName = ''
  rentForm.phone = ''
  rentForm.equipmentIds = []
  rentDialogVisible.value = true
}

const handleRentConfirm = () => {
  if (!rentForm.orderNo) {
    ElMessage.warning('请输入订单编号！')
    return
  }
  if (rentForm.equipmentIds.length === 0) {
    ElMessage.warning('请至少选择一件雪具！')
    return
  }

  ElMessageBox.confirm(`确认借出 ${rentForm.equipmentIds.length} 件雪具吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const now = new Date().toLocaleString()
    let totalDeposit = 0

    rentForm.equipmentIds.forEach(equipmentId => {
      const stock = equipmentStock.value.find(e => e.id === equipmentId)
      if (stock) {
        const type = equipmentTypes.value.find(t => t.id === stock.typeId)
        const deposit = type ? type.deposit : 0
        totalDeposit += deposit

        stock.status = 1

        rentalRecords.value.unshift({
          id: Date.now() + Math.random(),
          orderNo: rentForm.orderNo,
          equipmentId: stock.id,
          equipmentNo: stock.equipmentNo,
          equipmentType: stock.typeName,
          deposit: deposit,
          rentalPrice: type ? type.rentalPrice : 0,
          rentTime: now,
          returnTime: null,
          status: 1
        })
      }
    })

    rentDialogVisible.value = false
    ElMessage.success(`借出成功！共 ${rentForm.equipmentIds.length} 件雪具，押金合计: ¥${totalDeposit}`)
  }).catch(() => {})
}

const openReturnDialog = () => {
  if (rentedEquipments.value.length === 0) {
    ElMessage.warning('当前没有租赁中的雪具！')
    return
  }
  returnForm.rentalIds = []
  returnDialogVisible.value = true
}

const handleReturnConfirm = () => {
  if (returnForm.rentalIds.length === 0) {
    ElMessage.warning('请至少选择一件要归还的雪具！')
    return
  }

  ElMessageBox.confirm(`确认归还 ${returnForm.rentalIds.length} 件雪具吗？押金将原路退回。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const now = new Date().toLocaleString()
    let totalDeposit = 0

    returnForm.rentalIds.forEach(rentalId => {
      const rental = rentalRecords.value.find(r => r.id === rentalId)
      if (rental) {
        rental.status = 2
        rental.returnTime = now
        totalDeposit += rental.deposit

        const stock = equipmentStock.value.find(e => e.id === rental.equipmentId)
        if (stock) {
          stock.status = 0
        }
      }
    })

    returnDialogVisible.value = false
    ElMessage.success(`归还成功！共 ${returnForm.rentalIds.length} 件雪具，退还押金: ¥${totalDeposit}`)
  }).catch(() => {})
}
</script>
