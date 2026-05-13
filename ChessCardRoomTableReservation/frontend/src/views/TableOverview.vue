<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div style="display: flex; gap: 30px">
            <div style="display: flex; align-items: center; gap: 8px">
              <span style="width: 16px; height: 16px; background: #67c23a; display: inline-block"></span>
              <span>空闲</span>
              <el-tag type="success" effect="dark" size="small">{{ idleCount }}</el-tag>
            </div>
            <div style="display: flex; align-items: center; gap: 8px">
              <span style="width: 16px; height: 16px; background: #f56c6c; display: inline-block"></span>
              <span>使用中</span>
              <el-tag type="danger" effect="dark" size="small">{{ busyCount }}</el-tag>
            </div>
            <div style="display: flex; align-items: center; gap: 8px">
              <span style="width: 16px; height: 16px; background: #909399; display: inline-block"></span>
              <span>维护中</span>
              <el-tag type="info" effect="dark" size="small">{{ maintainCount }}</el-tag>
            </div>
          </div>
          <el-button type="primary" @click="loadTables" :icon="Refresh">刷新</el-button>
        </div>
      </template>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, 150px); gap: 20px; padding: 10px">
        <div
          v-for="table in tables"
          :key="table.id"
          :class="['table-card', getTableClass(table.status)]"
          @click="handleTableClick(table)"
        >
          <div class="table-no">{{ table.tableNo }}</div>
          <div class="table-type">{{ table.typeName }}</div>
          <div class="table-rate">¥{{ table.hourlyRate }}/小时</div>
          <div v-if="table.status === 1" class="table-status">
            <el-icon style="font-size: 18px"><Timer /></el-icon>
            <span>{{ formatDuration(table.startTime) }}</span>
          </div>
          <div v-else class="table-status">
            {{ getStatusText(table.status) }}
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="openTableDialog" title="开台" width="500px">
      <el-form :model="openForm" label-width="80px">
        <el-form-item label="桌台">
          <el-input :value="currentTable?.tableNo" disabled />
        </el-form-item>
        <el-form-item label="类型">
          <el-input :value="currentTable?.typeName" disabled />
        </el-form-item>
        <el-form-item label="会员">
          <el-select v-model="openForm.memberId" placeholder="可选" clearable filterable :remote-method="searchMember">
            <el-option v-for="m in members" :key="m.id" :label="m.name + ' - ' + m.memberNo" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="openForm.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="openTableDialog = false">取消</el-button>
        <el-button type="primary" @click="submitOpenTable">开台</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="orderDetailDialog" title="订单详情" width="700px">
      <div v-if="currentOrder">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="桌台">{{ currentOrder.tableNo }}</el-descriptions-item>
          <el-descriptions-item label="开台时间">{{ formatTime(currentOrder.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="当前时长">{{ formatDuration(currentOrder.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="会员">{{ currentOrder.memberName || '散客' }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <h4>已点商品</h4>
        <el-table :data="currentOrder.orderItems || []" size="small" style="margin-top: 10px">
          <el-table-column prop="productName" label="商品" />
          <el-table-column prop="price" label="单价" />
          <el-table-column prop="quantity" label="数量" />
          <el-table-column prop="totalPrice" label="小计" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="orderDetailDialog = false">关闭</el-button>
        <el-button @click="showAddProductDialog = true" type="primary">加点商品</el-button>
        <el-button @click="showTransferDialog = true">转台</el-button>
        <el-button @click="showMergeDialog = true">并台</el-button>
        <el-button type="success" @click="showCheckoutDialog = true">结账</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAddProductDialog" title="添加商品" width="600px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="茶水" name="tea" />
        <el-tab-pane label="酒水" name="drink" />
        <el-tab-pane label="零食" name="snack" />
      </el-tabs>
      <el-table :data="filteredProducts" size="small" style="margin-top: 15px">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="stock" label="库存" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-input-number v-model="row.quantity" :min="1" size="small" style="width: 100px" @change="updateCart(row)" />
          </template>
        </el-table-column>
      </el-table>
      <el-divider />
      <div style="display: flex; justify-content: flex-end">
        <span style="margin-right: 20px">已选：{{ cartList.length }} 件</span>
        <span style="font-weight: bold; margin-right: 20px">小计：¥{{ cartTotal.toFixed(2) }}</span>
      </div>
      <template #footer>
        <el-button @click="showAddProductDialog = false; cartList = []">取消</el-button>
        <el-button type="primary" @click="submitAddProduct">确认添加</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showTransferDialog" title="转台" width="400px">
      <el-form label-width="80px">
        <el-form-item label="当前桌台">
          <el-input :value="currentTable?.tableNo" disabled />
        </el-form-item>
        <el-form-item label="目标桌台">
          <el-select v-model="transferForm.toTableId" placeholder="请选择空闲桌台">
            <el-option v-for="t in idleTables" :key="t.id" :label="t.tableNo + ' - ' + t.typeName" :value="t.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransferDialog = false">取消</el-button>
        <el-button type="primary" @click="submitTransfer">确认转台</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showMergeDialog" title="并台" width="500px">
      <el-form label-width="80px">
        <el-form-item label="目标订单">
          <el-input :value="currentOrder?.tableNo" disabled />
        </el-form-item>
        <el-form-item label="并入订单">
          <el-select v-model="mergeForm.sourceOrderIds" multiple placeholder="选择要并入的订单">
            <el-option v-for="o in otherActiveOrders" :key="o.id" :label="o.tableNo" :value="o.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMergeDialog = false">取消</el-button>
        <el-button type="primary" @click="submitMerge">确认并台</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCheckoutDialog" title="结账" width="550px">
      <h4>账单详情</h4>
      <el-descriptions :column="2" border style="margin-top: 10px">
        <el-descriptions-item label="开台时间">{{ formatTime(currentOrder?.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="结账时间">{{ formatTime(new Date()) }}</el-descriptions-item>
        <el-descriptions-item label="使用时长">{{ formatDuration(currentOrder?.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="桌台费用">¥{{ finalCheckout.tableFee?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="商品费用">¥{{ finalCheckout.productFee?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ finalCheckout.totalAmount?.toFixed(2) }}</el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <h4>会员折扣</h4>
      <el-form label-width="80px">
        <el-form-item label="选择会员">
          <el-select v-model="checkoutMemberId" placeholder="输入会员号搜索" clearable filterable :remote-method="searchMember">
            <el-option v-for="m in members" :key="m.id" :label="m.name + ' - ' + (m.discountRate*100).toFixed(0) + '折'" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="selectedMember" label="优惠">
          <span style="color: #f56c6c; font-weight: bold">优惠 ¥{{ finalCheckout.discountAmount?.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-radio-group v-model="checkoutPaymentMethod">
            <el-radio value="cash">现金</el-radio>
            <el-radio value="wechat">微信</el-radio>
            <el-radio value="alipay">支付宝</el-radio>
            <el-radio value="card">刷卡</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <el-divider />
      <div style="text-align: right; font-size: 20px; font-weight: bold">
        实付金额：<span style="color: #f56c6c">¥{{ finalCheckout.payAmount?.toFixed(2) }}</span>
      </div>
      <template #footer>
        <el-button @click="showCheckoutDialog = false">取消</el-button>
        <el-button type="success" size="large" @click="submitCheckout">确认结账</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getTables,
  getProducts,
  getMembers,
  searchMember as apiSearchMember,
  openTable as apiOpenTable,
  getOrderDetail,
  addProduct as apiAddProduct,
  transferTable as apiTransferTable,
  mergeTable as apiMergeTable,
  checkout as apiCheckout
} from '../api'
import { Refresh, Timer } from '@element-plus/icons-vue'

const tables = ref([])
const members = ref([])
const products = ref([])
const idleCount = ref(0)
const busyCount = ref(0)
const maintainCount = ref(0)

const openTableDialog = ref(false)
const orderDetailDialog = ref(false)
const showAddProductDialog = ref(false)
const showTransferDialog = ref(false)
const showMergeDialog = ref(false)
const showCheckoutDialog = ref(false)

const currentTable = ref(null)
const currentOrder = ref(null)
const activeTab = ref('tea')
const cartList = ref([])

const openForm = ref({ tableId: null, memberId: null, remark: '' })
const transferForm = ref({ orderId: null, fromTableId: null, toTableId: null })
const mergeForm = ref({ targetOrderId: null, sourceOrderIds: [] })

const checkoutMemberId = ref(null)
const selectedMember = ref(null)
const checkoutPaymentMethod = ref('cash')

const finalCheckout = ref({
  tableFee: 0,
  productFee: 0,
  totalAmount: 0,
  discountAmount: 0,
  payAmount: 0
})

const estimateTableFee = computed(() => {
  if (!currentOrder.value?.startTime) return 0
  const start = new Date(currentOrder.value.startTime)
  const now = new Date()
  const hours = (now - start) / (1000 * 60 * 60)
  const rate = currentTable.value?.hourlyRate || 0
  return hours * rate
})

const productTotal = computed(() => {
  return (currentOrder.value?.orderItems || []).reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0)
})

const idleTables = computed(() => tables.value.filter(t => t.status === 0))

const otherActiveOrders = computed(() => {
  return tables.value
    .filter(t => t.status === 1 && t.currentOrderId && t.id !== currentTable.value?.id)
    .map(t => ({ id: t.currentOrderId, tableNo: t.tableNo }))
})

const filteredProducts = computed(() => {
  return products.value
    .filter(p => p.category === activeTab.value)
    .map(p => ({ ...p, quantity: (cartList.value.find(c => c.productId === p.id)?.quantity) || 0 }))
})

const cartTotal = computed(() => cartList.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))

async function loadTables() {
  try {
    tables.value = await getTables()
    idleCount.value = tables.value.filter(t => t.status === 0).length
    busyCount.value = tables.value.filter(t => t.status === 1).length
    maintainCount.value = tables.value.filter(t => t.status === 3).length
  } catch (e) {
    console.error(e)
  }
}

function getTableClass(status) {
  if (status === 0) return 'table-idle'
  if (status === 1) return 'table-busy'
  if (status === 3) return 'table-maintain'
  return 'table-idle'
}

function getStatusText(status) {
  if (status === 0) return '空闲'
  if (status === 1) return '使用中'
  if (status === 2) return '已预订'
  if (status === 3) return '维护中'
  return '未知'
}

function formatDuration(startTime) {
  if (!startTime) return ''
  const start = new Date(startTime)
  const now = new Date()
  const diff = Math.floor((now - start) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return h + '小时' + m + '分'
}

function formatTime(time) {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

function handleTableClick(table) {
  currentTable.value = table
  if (table.status === 0) {
    openForm.value = { tableId: table.id, memberId: null, remark: '' }
    openTableDialog.value = true
  } else if (table.status === 1) {
    loadOrderDetail(table.currentOrderId)
  }
}

async function loadOrderDetail(orderId) {
  try {
    currentOrder.value = await getOrderDetail(orderId)
    orderDetailDialog.value = true
  } catch (e) {
    console.error(e)
  }
}

async function submitOpenTable() {
  try {
    await apiOpenTable({
      tableId: currentTable.value.id,
      memberId: openForm.value.memberId,
      remark: openForm.value.remark
    })
    ElMessage.success('开台成功')
    openTableDialog.value = false
    loadTables()
  } catch (e) {
    console.error(e)
  }
}

function searchMember(query) {
  if (!query) {
    getMembers().then(data => members.value = data)
  } else {
    apiSearchMember(query).then(data => {
      members.value = data ? [data] : []
    })
  }
}

function updateCart(row) {
  const idx = cartList.value.findIndex(c => c.productId === row.id)
  if (row.quantity > 0) {
    if (idx >= 0) {
      cartList.value[idx].quantity = row.quantity
    } else {
      cartList.value.push({
        productId: row.id,
        productName: row.name,
        price: row.price,
        quantity: row.quantity
      })
    }
  } else if (idx >= 0) {
    cartList.value.splice(idx, 1)
  }
}

async function submitAddProduct() {
  if (cartList.value.length === 0) {
    ElMessage.warning('请选择商品')
    return
  }
  try {
    await apiAddProduct(currentOrder.value.id, { items: cartList.value })
    ElMessage.success('添加成功')
    showAddProductDialog.value = false
    cartList.value = []
    loadOrderDetail(currentOrder.value.id)
  } catch (e) {
    console.error(e)
  }
}

async function submitTransfer() {
  if (!transferForm.value.toTableId) {
    ElMessage.warning('请选择目标桌台')
    return
  }
  try {
    await apiTransferTable({
      orderId: currentOrder.value.id,
      fromTableId: currentTable.value.id,
      toTableId: transferForm.value.toTableId
    })
    ElMessage.success('转台成功')
    showTransferDialog.value = false
    orderDetailDialog.value = false
    loadTables()
  } catch (e) {
    console.error(e)
  }
}

async function submitMerge() {
  if (mergeForm.value.sourceOrderIds.length === 0) {
    ElMessage.warning('请选择要并入的订单')
    return
  }
  try {
    await apiMergeTable({
      targetOrderId: currentOrder.value.id,
      sourceOrderIds: mergeForm.value.sourceOrderIds
    })
    ElMessage.success('并台成功')
    showMergeDialog.value = false
    orderDetailDialog.value = false
    loadTables()
  } catch (e) {
    console.error(e)
  }
}

function updateCheckout() {
  const tableFee = estimateTableFee.value
  const pFee = productTotal.value
  const total = tableFee + pFee
  let discountAmount = 0
  if (selectedMember.value) {
    const discount = parseFloat(selectedMember.value.discountRate) || 1
    discountAmount = total * (1 - discount)
  }
  finalCheckout.value = {
    tableFee: tableFee,
    productFee: pFee,
    totalAmount: total,
    discountAmount: discountAmount,
    payAmount: total - discountAmount
  }
}

watch(checkoutMemberId, (val) => {
  if (val) {
    selectedMember.value = members.value.find(m => m.id === val)
  } else {
    selectedMember.value = null
  }
  updateCheckout()
})

watch(showCheckoutDialog, (val) => {
  if (val) {
    checkoutMemberId.value = null
    selectedMember.value = null
    updateCheckout()
  }
})

async function submitCheckout() {
  try {
    const params = {
      paymentMethod: checkoutPaymentMethod.value
    }
    if (checkoutMemberId.value) {
      params.memberId = checkoutMemberId.value
    }
    await apiCheckout(currentOrder.value.id, params)
    ElMessage.success('结账成功')
    showCheckoutDialog.value = false
    orderDetailDialog.value = false
    loadTables()
  } catch (e) {
    console.error(e)
  }
}

let refreshTimer = null

onMounted(() => {
  loadTables()
  getProducts().then(data => products.value = data)
  getMembers().then(data => members.value = data)
  refreshTimer = setInterval(loadTables, 30000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.table-card {
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.table-idle {
  background: linear-gradient(135deg, #f0f9eb, #e1f3d8);
  border: 2px solid #67c23a;
}

.table-busy {
  background: linear-gradient(135deg, #fef0f0, #fde2e2);
  border: 2px solid #f56c6c;
}

.table-maintain {
  background: linear-gradient(135deg, #f4f4f5, #e9e9eb);
  border: 2px solid #909399;
}

.table-no {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.table-type {
  font-size: 13px;
  color: #606266;
  margin-bottom: 5px;
}

.table-rate {
  font-size: 14px;
  color: #f56c6c;
  font-weight: 500;
  margin-bottom: 8px;
}

.table-status {
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
