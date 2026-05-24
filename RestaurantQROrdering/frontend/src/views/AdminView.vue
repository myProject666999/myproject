<template>
  <div class="admin-view">
    <div class="sidebar">
      <div class="logo">餐厅管理系统</div>
      <div class="menu">
        <div 
          :class="['menu-item', { active: activeMenu === 'dish' }]" 
          @click="switchMenu('dish')"
        >
          🍽️ 菜品管理
        </div>
        <div 
          :class="['menu-item', { active: activeMenu === 'category' }]" 
          @click="switchMenu('category')"
        >
          📂 分类管理
        </div>
        <div 
          :class="['menu-item', { active: activeMenu === 'table' }]" 
          @click="switchMenu('table')"
        >
          🪑 桌台管理
        </div>
        <div 
          :class="['menu-item', { active: activeMenu === 'order' }]" 
          @click="switchMenu('order')"
        >
          📋 订单管理
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <div class="content-header">
        <h2>{{ getTitle() }}</h2>
        <button class="btn-add" @click="openAddDialog" v-if="activeMenu !== 'order'">
          + 新增
        </button>
      </div>
      
      <div class="content-body">
        <div v-if="activeMenu === 'dish'" class="dish-management">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>名称</th>
                <th>分类</th>
                <th>价格</th>
                <th>库存</th>
                <th>销量</th>
                <th>推荐</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dish in dishes" :key="dish.id">
                <td>{{ dish.id }}</td>
                <td>
                  <div class="dish-cell">
                    <img v-if="dish.image" :src="dish.image" class="dish-thumb" />
                    <span>{{ dish.name }}</span>
                  </div>
                </td>
                <td>{{ dish.categoryName }}</td>
                <td>¥{{ dish.price }}</td>
                <td>{{ dish.stock }}</td>
                <td>{{ dish.sales }}</td>
                <td>
                  <span v-if="dish.recommend === 1" class="badge-recommend">推荐</span>
                </td>
                <td>
                  <span :class="['status-badge', dish.status === 1 ? 'active' : 'inactive']">
                    {{ dish.status === 1 ? '在售' : '下架' }}
                  </span>
                </td>
                <td>
                  <button class="btn-edit" @click="editDish(dish)">编辑</button>
                  <button class="btn-delete" @click="deleteDish(dish.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="activeMenu === 'category'" class="category-management">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>名称</th>
                <th>图标</th>
                <th>排序</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td>{{ cat.id }}</td>
                <td>{{ cat.name }}</td>
                <td>{{ cat.icon }}</td>
                <td>{{ cat.sortOrder }}</td>
                <td>
                  <span :class="['status-badge', cat.status === 1 ? 'active' : 'inactive']">
                    {{ cat.status === 1 ? '启用' : '禁用' }}
                  </span>
                </td>
                <td>
                  <button class="btn-edit" @click="editCategory(cat)">编辑</button>
                  <button class="btn-delete" @click="deleteCategory(cat.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="activeMenu === 'table'" class="table-management">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>桌台号</th>
                <th>座位数</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="table in tables" :key="table.id">
                <td>{{ table.id }}</td>
                <td>{{ table.tableNo }}</td>
                <td>{{ table.seats }}</td>
                <td>
                  <span :class="['status-badge', getTableStatusClass(table.status)]">
                    {{ getTableStatusText(table.status) }}
                  </span>
                </td>
                <td>
                  <button class="btn-edit" @click="editTable(table)">编辑</button>
                  <button class="btn-delete" @click="deleteTable(table.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="activeMenu === 'order'" class="order-management">
          <div class="filter-bar">
            <button 
              :class="['filter-btn', { active: orderFilter === 'all' }]"
              @click="orderFilter = 'all'; loadOrders()"
            >
              全部
            </button>
            <button 
              :class="['filter-btn', { active: orderFilter === 'PENDING' }]"
              @click="orderFilter = 'PENDING'; loadOrders()"
            >
              待确认
            </button>
            <button 
              :class="['filter-btn', { active: orderFilter === 'CONFIRMED' }]"
              @click="orderFilter = 'CONFIRMED'; loadOrders()"
            >
              已确认
            </button>
            <button 
              :class="['filter-btn', { active: orderFilter === 'COOKING' }]"
              @click="orderFilter = 'COOKING'; loadOrders()"
            >
              制作中
            </button>
            <button 
              :class="['filter-btn', { active: orderFilter === 'SERVED' }]"
              @click="orderFilter = 'SERVED'; loadOrders()"
            >
              已出餐
            </button>
            <button 
              :class="['filter-btn', { active: orderFilter === 'COMPLETED' }]"
              @click="orderFilter = 'COMPLETED'; loadOrders()"
            >
              已完成
            </button>
            <button 
              :class="['filter-btn', { active: orderFilter === 'CANCELLED' }]"
              @click="orderFilter = 'CANCELLED'; loadOrders()"
            >
              已取消
            </button>
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>桌台</th>
                <th>金额</th>
                <th>订单状态</th>
                <th>支付状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="order-no-cell">{{ order.orderNo }}</td>
                <td>{{ order.tableNo }}</td>
                <td>¥{{ order.totalAmount }}</td>
                <td>
                  <span :class="['status-badge', order.orderStatus]">
                    {{ getOrderStatusText(order.orderStatus) }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', order.payStatus]">
                    {{ getPayStatusText(order.payStatus) }}
                  </span>
                </td>
                <td>{{ formatTime(order.createTime) }}</td>
                <td>
                  <button class="btn-detail" @click="viewOrderDetail(order)">详情</button>
                  <button v-if="order.orderStatus === 'PENDING'" class="btn-confirm" @click="confirmOrder(order.id)">确认</button>
                  <button v-if="order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELLED'" class="btn-cancel" @click="cancelOrder(order.id)">取消</button>
                  <button v-if="order.payStatus === 'UNPAID'" class="btn-pay" @click="payOrder(order.id)">收款</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div v-if="showAddDialog" class="dialog-overlay" @click.self="showAddDialog = false">
      <div class="dialog">
        <h3>{{ dialogTitle }}</h3>
        
        <div v-if="activeMenu === 'dish'" class="form">
          <div class="form-item">
            <label>菜品名称 *</label>
            <input v-model="formData.name" type="text" placeholder="请输入菜品名称" />
          </div>
          <div class="form-item">
            <label>分类 *</label>
            <select v-model="formData.categoryId">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>价格 *</label>
            <input v-model.number="formData.price" type="number" step="0.01" placeholder="请输入价格" />
          </div>
          <div class="form-item">
            <label>库存</label>
            <input v-model.number="formData.stock" type="number" placeholder="请输入库存" />
          </div>
          <div class="form-item">
            <label>图片URL</label>
            <input v-model="formData.image" type="text" placeholder="请输入图片URL" />
          </div>
          <div class="form-item">
            <label>描述</label>
            <textarea v-model="formData.description" placeholder="请输入描述"></textarea>
          </div>
          <div class="form-item checkbox-item">
            <label>
              <input type="checkbox" v-model="formData.recommend" :true-value="1" :false-value="0" />
              设为推荐
            </label>
          </div>
          <div class="form-item checkbox-item">
            <label>
              <input type="checkbox" v-model="formData.status" :true-value="1" :false-value="0" />
              上架
            </label>
          </div>
        </div>
        
        <div v-if="activeMenu === 'category'" class="form">
          <div class="form-item">
            <label>分类名称 *</label>
            <input v-model="formData.name" type="text" placeholder="请输入分类名称" />
          </div>
          <div class="form-item">
            <label>图标</label>
            <input v-model="formData.icon" type="text" placeholder="请输入图标" />
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" placeholder="请输入排序号" />
          </div>
        </div>
        
        <div v-if="activeMenu === 'table'" class="form">
          <div class="form-item">
            <label>桌台号 *</label>
            <input v-model="formData.tableNo" type="text" placeholder="请输入桌台号" />
          </div>
          <div class="form-item">
            <label>座位数</label>
            <input v-model.number="formData.seats" type="number" placeholder="请输入座位数" />
          </div>
        </div>
        
        <div class="dialog-actions">
          <button class="btn-cancel" @click="showAddDialog = false">取消</button>
          <button class="btn-confirm" @click="handleSubmit">确定</button>
        </div>
      </div>
    </div>
    
    <div v-if="showOrderDetail" class="dialog-overlay" @click.self="showOrderDetail = false">
      <div class="dialog order-detail-dialog">
        <h3>订单详情</h3>
        <div v-if="currentOrder" class="order-detail">
          <div class="detail-row">
            <span class="label">订单号:</span>
            <span class="value">{{ currentOrder.orderNo }}</span>
          </div>
          <div class="detail-row">
            <span class="label">桌台:</span>
            <span class="value">{{ currentOrder.tableNo }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单状态:</span>
            <span class="value">{{ getOrderStatusText(currentOrder.orderStatus) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">支付状态:</span>
            <span class="value">{{ getPayStatusText(currentOrder.payStatus) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">总金额:</span>
            <span class="value price">¥{{ currentOrder.totalAmount }}</span>
          </div>
          <div class="detail-row">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatTime(currentOrder.createTime) }}</span>
          </div>
          
          <h4>订单明细</h4>
          <table class="detail-table">
            <thead>
              <tr>
                <th>菜品</th>
                <th>单价</th>
                <th>数量</th>
                <th>小计</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in currentOrder.items" :key="item.id">
                <td>{{ item.dishName }}</td>
                <td>¥{{ item.dishPrice }}</td>
                <td>{{ item.quantity }}</td>
                <td>¥{{ item.subtotal }}</td>
                <td>{{ getItemStatusText(item.dishStatus) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="dialog-actions">
          <button class="btn-confirm" @click="showOrderDetail = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { 
  getCategories, getAllDishes, createCategory, updateCategory, deleteCategory as deleteCategoryApi,
  createDish, updateDish, deleteDish as deleteDishApi
} from '../api/dish'
import { getAllTables, createTable, updateTable, deleteTable as deleteTableApi } from '../api/table'
import { 
  getActiveOrders, getOrdersByStatus, confirmOrder as confirmOrderApi, 
  cancelOrder as cancelOrderApi, payOrder as payOrderApi, getOrderById
} from '../api/order'

const activeMenu = ref('dish')
const showAddDialog = ref(false)
const showOrderDetail = ref(false)
const editingId = ref(null)

const categories = ref([])
const dishes = ref([])
const tables = ref([])
const orders = ref([])
const currentOrder = ref(null)
const orderFilter = ref('all')

const formData = ref({
  name: '',
  categoryId: null,
  price: 0,
  stock: 999,
  image: '',
  description: '',
  recommend: 0,
  status: 1,
  icon: '',
  sortOrder: 0,
  tableNo: '',
  seats: 4
})

const dialogTitle = computed(() => {
  if (editingId.value) {
    return '编辑' + getTitle()
  }
  return '新增' + getTitle()
})

const switchMenu = (menu) => {
  activeMenu.value = menu
  loadData()
}

const getTitle = () => {
  const map = {
    dish: '菜品管理',
    category: '分类管理',
    table: '桌台管理',
    order: '订单管理'
  }
  return map[activeMenu.value]
}

const getTableStatusClass = (status) => {
  const map = { IDLE: 'idle', OCCUPIED: 'occupied', CLEANING: 'cleaning' }
  return map[status] || ''
}

const getTableStatusText = (status) => {
  const map = { IDLE: '空闲', OCCUPIED: '用餐中', CLEANING: '打扫中' }
  return map[status] || status
}

const getOrderStatusText = (status) => {
  const map = { PENDING: '待确认', CONFIRMED: '已确认', COOKING: '制作中', SERVED: '已出餐', COMPLETED: '已完成', CANCELLED: '已取消' }
  return map[status] || status
}

const getPayStatusText = (status) => {
  const map = { UNPAID: '未支付', PAID: '已支付', REFUNDED: '已退款' }
  return map[status] || status
}

const getItemStatusText = (status) => {
  const map = { PENDING: '待制作', COOKING: '制作中', SERVED: '已出餐' }
  return map[status] || status
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}

const loadData = async () => {
  try {
    if (activeMenu.value !== 'order') {
      categories.value = await getCategories(true)
    }
    if (activeMenu.value === 'dish') {
      dishes.value = await getAllDishes()
    } else if (activeMenu.value === 'table') {
      tables.value = await getAllTables()
    } else if (activeMenu.value === 'order') {
      loadOrders()
    }
  } catch (e) {
    console.error(e)
  }
}

const loadOrders = async () => {
  try {
    if (orderFilter.value === 'all') {
      orders.value = await getActiveOrders()
    } else {
      orders.value = await getOrdersByStatus([orderFilter.value])
    }
  } catch (e) {
    console.error(e)
  }
}

const openAddDialog = () => {
  editingId.value = null
  formData.value = {
    name: '',
    categoryId: categories.value[0]?.id || null,
    price: 0,
    stock: 999,
    image: '',
    description: '',
    recommend: 0,
    status: 1,
    icon: '',
    sortOrder: 0,
    tableNo: '',
    seats: 4
  }
  showAddDialog.value = true
}

const editDish = (dish) => {
  editingId.value = dish.id
  formData.value = { ...dish }
  showAddDialog.value = true
}

const editCategory = (cat) => {
  editingId.value = cat.id
  formData.value = { ...cat }
  showAddDialog.value = true
}

const editTable = (table) => {
  editingId.value = table.id
  formData.value = { ...table }
  showAddDialog.value = true
}

const deleteDish = async (id) => {
  try {
    await showConfirmDialog({ title: '确认删除', message: '确定要删除这个菜品吗？' })
    await deleteDishApi(id)
    showToast('删除成功')
    await loadData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const deleteCategory = async (id) => {
  try {
    await showConfirmDialog({ title: '确认删除', message: '确定要删除这个分类吗？' })
    await deleteCategoryApi(id)
    showToast('删除成功')
    await loadData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const deleteTable = async (id) => {
  try {
    await showConfirmDialog({ title: '确认删除', message: '确定要删除这个桌台吗？' })
    await deleteTableApi(id)
    showToast('删除成功')
    await loadData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const handleSubmit = async () => {
  try {
    if (activeMenu.value === 'dish') {
      if (editingId.value) {
        await updateDish(editingId.value, formData.value)
      } else {
        await createDish(formData.value)
      }
    } else if (activeMenu.value === 'category') {
      if (editingId.value) {
        await updateCategory(editingId.value, formData.value)
      } else {
        await createCategory(formData.value)
      }
    } else if (activeMenu.value === 'table') {
      if (editingId.value) {
        await updateTable(editingId.value, formData.value)
      } else {
        await createTable(formData.value)
      }
    }
    showToast('操作成功')
    showAddDialog.value = false
    editingId.value = null
    await loadData()
  } catch (e) {
    console.error(e)
  }
}

const viewOrderDetail = async (order) => {
  try {
    currentOrder.value = await getOrderById(order.id)
    showOrderDetail.value = true
  } catch (e) {
    console.error(e)
  }
}

const confirmOrder = async (id) => {
  try {
    await showConfirmDialog({ title: '确认订单', message: '确定要确认这个订单吗？' })
    await confirmOrderApi(id)
    showToast('订单已确认')
    await loadOrders()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const cancelOrder = async (id) => {
  try {
    await showConfirmDialog({ title: '确认取消', message: '确定要取消这个订单吗？' })
    await cancelOrderApi(id)
    showToast('订单已取消')
    await loadOrders()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const payOrder = async (id) => {
  try {
    await showConfirmDialog({ title: '确认收款', message: '确定要标记为已支付吗？' })
    await payOrderApi(id)
    showToast('收款成功')
    await loadOrders()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-view {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 200px;
  background: #2c3e50;
  color: white;
  padding: 20px 0;
  flex-shrink: 0;
}

.logo {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  padding: 0 20px 20px;
  border-bottom: 1px solid #34495e;
}

.menu {
  margin-top: 20px;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
}

.menu-item:hover {
  background: #34495e;
}

.menu-item.active {
  background: #3498db;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-header h2 {
  margin: 0;
  font-size: 20px;
}

.btn-add {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
}

.filter-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.data-table {
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.data-table th, .data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f5f5f5;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.dish-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dish-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.badge-recommend {
  background: #ff6b6b;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.status-badge.active { background: #d4edda; color: #155724; }
.status-badge.inactive { background: #f8d7da; color: #721c24; }
.status-badge.idle { background: #d4edda; color: #155724; }
.status-badge.occupied { background: #fff3cd; color: #856404; }
.status-badge.cleaning { background: #d1ecf1; color: #0c5460; }
.status-badge.PENDING { background: #fff3e0; color: #ff9800; }
.status-badge.CONFIRMED { background: #e3f2fd; color: #2196f3; }
.status-badge.COOKING { background: #fce4ec; color: #e91e63; }
.status-badge.SERVED { background: #e8f5e9; color: #4caf50; }
.status-badge.COMPLETED { background: #e0e0e0; color: #616161; }
.status-badge.CANCELLED { background: #ffebee; color: #f44336; }
.status-badge.UNPAID { background: #fff3e0; color: #ff9800; }
.status-badge.PAID { background: #e8f5e9; color: #4caf50; }

.order-no-cell {
  font-family: monospace;
}

.btn-edit, .btn-delete, .btn-detail, .btn-confirm, .btn-cancel, .btn-pay {
  padding: 4px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-right: 4px;
  font-size: 12px;
}

.btn-edit { background: #3498db; color: white; }
.btn-delete { background: #e74c3c; color: white; }
.btn-detail { background: #95a5a6; color: white; }
.btn-confirm { background: #27ae60; color: white; }
.btn-cancel { background: #e67e22; color: white; }
.btn-pay { background: #3498db; color: white; }

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  padding: 20px;
  overflow-y: auto;
}

.order-detail-dialog {
  width: 600px;
}

.dialog h3 {
  margin: 0 0 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.checkbox-item label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-item input, .form-item select, .form-item textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item textarea {
  min-height: 80px;
  resize: vertical;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel { background: #f5f5f5; color: #666; }
.btn-confirm { background: #3498db; color: white; }

.order-detail {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-row .label {
  width: 100px;
  color: #666;
}

.detail-row .value {
  flex: 1;
}

.detail-row .value.price {
  color: #ff6b6b;
  font-weight: 600;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.detail-table th, .detail-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #f5f5f5;
}

.detail-table th {
  background: #f8f9fa;
  font-size: 14px;
}
</style>
