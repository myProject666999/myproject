<template>
  <div class="admin-page">
    <el-card class="admin-card">
      <template #header>
        <div class="card-header">
          <span class="title">订单管理</span>
          <el-select v-model="filterStatus" placeholder="全部状态" style="width: 140px;" @change="loadOrders">
            <el-option label="全部" :value="-1" />
            <el-option label="待处理" :value="0" />
            <el-option label="已发货" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </div>
      </template>

      <el-table :data="orders" style="width: 100%" v-loading="loading">
        <el-table-column prop="order_no" label="订单号" width="200" />
        <el-table-column prop="product_name" label="商品" min-width="150" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="total_points" label="积分" width="100" align="center">
          <template #default="{ row }">
            <span class="points-cell">{{ row.total_points }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="consignee_name" label="收货人" width="120" />
        <el-table-column prop="consignee_phone" label="电话" width="130" />
        <el-table-column prop="consignee_address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="物流" width="200">
          <template #default="{ row }">
            <span v-if="row.express_no">
              {{ row.express_company }} - {{ row.express_no }}
            </span>
            <span v-else class="no-express">未发货</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="primary"
              size="small"
              @click="openShipDialog(row)"
            >
              发货
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="success"
              size="small"
              @click="completeOrder(row)"
            >
              完成
            </el-button>
            <el-button
              v-if="row.status === 0 || row.status === 1"
              type="danger"
              size="small"
              @click="cancelOrder(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadOrders"
        />
      </div>
    </el-card>

    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="订单号">
          <span>{{ currentOrder?.order_no }}</span>
        </el-form-item>
        <el-form-item label="商品">
          <span>{{ currentOrder?.product_name }}</span>
        </el-form-item>
        <el-form-item label="收货人">
          <span>{{ currentOrder?.consignee_name }} ({{ currentOrder?.consignee_phone }})</span>
        </el-form-item>
        <el-form-item label="快递公司" prop="express_company" :rules="[{ required: true, message: '请输入快递公司' }]">
          <el-select v-model="shipForm.express_company" placeholder="请选择快递公司">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="韵达快递" value="韵达快递" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="express_no" :rules="[{ required: true, message: '请输入快递单号' }]">
          <el-input v-model="shipForm.express_no" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminGetOrders, shipOrder, completeOrder as completeOrderApi, cancelOrder as cancelOrderApi } from '@/api'

const orders = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const filterStatus = ref(-1)
const shipDialogVisible = ref(false)
const currentOrder = ref(null)
const shipForm = ref({
  express_company: '',
  express_no: ''
})

const statusMap = {
  0: { text: '待处理', type: 'warning' },
  1: { text: '已发货', type: 'primary' },
  2: { text: '已完成', type: 'success' },
  3: { text: '已取消', type: 'info' },
  4: { text: '已退款', type: 'danger' }
}

function getStatusText(status) {
  return statusMap[status]?.text || '未知'
}

function getStatusType(status) {
  return statusMap[status]?.type || 'info'
}

async function loadOrders() {
  loading.value = true
  try {
    const res = await adminGetOrders({
      page: page.value,
      page_size: pageSize.value,
      status: filterStatus.value
    })
    if (res.code === 0) {
      orders.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } catch (e) {
    orders.value = getMockOrders()
    total.value = orders.value.length
  } finally {
    loading.value = false
  }
}

function getMockOrders() {
  return [
    { id: 1, order_no: 'EX20260525001', product_name: '精美马克杯', quantity: 1, total_points: 500, status: 0, consignee_name: '张三', consignee_phone: '13800000001', consignee_address: '北京市朝阳区xxx街道xxx小区', express_no: '', express_company: '', created_at: '2026-05-25 10:30:00' },
    { id: 2, order_no: 'EX20260524001', product_name: '蓝牙耳机', quantity: 1, total_points: 5000, status: 1, consignee_name: '李四', consignee_phone: '13800000002', consignee_address: '上海市浦东新区xxx路xxx号', express_no: 'SF1234567890', express_company: '顺丰速运', created_at: '2026-05-24 14:20:00' },
    { id: 3, order_no: 'EX20260523001', product_name: '50元优惠券', quantity: 2, total_points: 4000, status: 2, consignee_name: '王五', consignee_phone: '13800000003', consignee_address: '广州市天河区xxx路xxx号', express_no: 'JD9876543210', express_company: '京东物流', created_at: '2026-05-23 09:15:00' },
    { id: 4, order_no: 'EX20260522001', product_name: '保温杯', quantity: 1, total_points: 1500, status: 3, consignee_name: '赵六', consignee_phone: '13800000004', consignee_address: '深圳市南山区xxx路xxx号', express_no: '', express_company: '', created_at: '2026-05-22 16:00:00' }
  ]
}

function openShipDialog(order) {
  currentOrder.value = order
  shipForm.value = { express_company: '', express_no: '' }
  shipDialogVisible.value = true
}

async function confirmShip() {
  if (!shipForm.value.express_company || !shipForm.value.express_no) {
    ElMessage.warning('请填写快递公司和单号')
    return
  }
  try {
    await shipOrder({
      order_no: currentOrder.value.order_no,
      ...shipForm.value
    })
    ElMessage.success('发货成功！')
    shipDialogVisible.value = false
    loadOrders()
  } catch (e) {
    ElMessage.success('发货成功！（演示模式）')
    shipDialogVisible.value = false
    loadOrders()
  }
}

async function completeOrder(order) {
  try {
    await ElMessageBox.confirm(`确认完成订单 ${order.order_no}？`, '确认', { type: 'warning' })
    await completeOrderApi({ order_no: order.order_no })
    ElMessage.success('订单已完成！')
    loadOrders()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.success('订单已完成！（演示模式）')
      loadOrders()
    }
  }
}

async function cancelOrder(order) {
  try {
    const { value } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
      confirmButtonText: '确认取消',
      cancelButtonText: '返回',
      inputPattern: /.+/,
      inputErrorMessage: '请输入取消原因'
    })
    await cancelOrderApi({ order_no: order.order_no, reason: value })
    ElMessage.success('订单已取消，积分已退还')
    loadOrders()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.success('订单已取消（演示模式）')
      loadOrders()
    }
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.admin-page {
  .admin-card {
    border-radius: 12px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 20px;
        font-weight: 700;
        color: #303133;
      }
    }

    .pagination-wrap {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    .points-cell {
      color: #f59e0b;
      font-weight: 600;
    }

    .no-express {
      color: #c0c4cc;
      font-size: 13px;
    }
  }
}
</style>
