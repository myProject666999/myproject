<template>
  <div class="admin-view">
    <div class="sidebar">
      <div class="logo">餐厅管理系统</div>
      <div class="menu">
        <div 
          :class="['menu-item', { active: activeMenu === 'dish' }]" 
          @click="activeMenu = 'dish'"
        >
          🍽️ 菜品管理
        </div>
        <div 
          :class="['menu-item', { active: activeMenu === 'category' }]" 
          @click="activeMenu = 'category'"
        >
          📂 分类管理
        </div>
        <div 
          :class="['menu-item', { active: activeMenu === 'table' }]" 
          @click="activeMenu = 'table'"
        >
          🪑 桌台管理
        </div>
        <div 
          :class="['menu-item', { active: activeMenu === 'order' }]" 
          @click="activeMenu = 'order'"
        >
          📋 订单管理
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <div class="content-header">
        <h2>{{ getTitle() }}</h2>
        <button class="btn-add" @click="showAddDialog = true" v-if="activeMenu !== 'order'">
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
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dish in dishes" :key="dish.id">
                <td>{{ dish.id }}</td>
                <td>{{ dish.name }}</td>
                <td>{{ dish.categoryName }}</td>
                <td>¥{{ dish.price }}</td>
                <td>{{ dish.stock }}</td>
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
          <table class="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>桌台</th>
                <th>金额</th>
                <th>状态</th>
                <th>支付</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td>{{ order.orderNo }}</td>
                <td>{{ order.tableNo }}</td>
                <td>¥{{ order.totalAmount }}</td>
                <td>{{ getOrderStatusText(order.orderStatus) }}</td>
                <td>{{ getPayStatusText(order.payStatus) }}</td>
                <td>{{ formatTime(order.createTime) }}</td>
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
            <label>菜品名称</label>
            <input v-model="formData.name" type="text" placeholder="请输入菜品名称" />
          </div>
          <div class="form-item">
            <label>分类</label>
            <select v-model="formData.categoryId">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>价格</label>
            <input v-model.number="formData.price" type="number" step="0.01" placeholder="请输入价格" />
          </div>
          <div class="form-item">
            <label>库存</label>
            <input v-model.number="formData.stock" type="number" placeholder="请输入库存" />
          </div>
          <div class="form-item">
            <label>描述</label>
            <textarea v-model="formData.description" placeholder="请输入描述"></textarea>
          </div>
        </div>
        
        <div v-if="activeMenu === 'category'" class="form">
          <div class="form-item">
            <label>分类名称</label>
            <input v-model="formData.name" type="text" placeholder="请输入分类名称" />
          </div>
          <div class="form-item">
            <label>图标</label>
            <input v-model="formData.icon" type="text" placeholder="请输入图标emoji" />
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" placeholder="请输入排序号" />
          </div>
        </div>
        
        <div v-if="activeMenu === 'table'" class="form">
          <div class="form-item">
            <label>桌台号</label>
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
import { getActiveOrders } from '../api/order'

const activeMenu = ref('dish')
const showAddDialog = ref(false)
const editingId = ref(null)

const categories = ref([])
const dishes = ref([])
const tables = ref([])
const orders = ref([])

const formData = ref({})

const dialogTitle = computed(() => {
  if (editingId.value) {
    return '编辑' + getTitle()
  }
  return '新增' + getTitle()
})

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

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}

const loadData = async () => {
  try {
    categories.value = await getCategories()
    if (activeMenu.value === 'dish') {
      dishes.value = await getAllDishes()
    } else if (activeMenu.value === 'table') {
      tables.value = await getAllTables()
    } else if (activeMenu.value === 'order') {
      orders.value = await getActiveOrders()
    }
  } catch (e) {
    console.error(e)
  }
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
    formData.value = {}
    await loadData()
  } catch (e) {
    console.error(e)
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
}

.logo {
  font-size: 18px;
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
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.active { background: #d4edda; color: #155724; }
.status-badge.inactive { background: #f8d7da; color: #721c24; }
.status-badge.idle { background: #d4edda; color: #155724; }
.status-badge.occupied { background: #fff3cd; color: #856404; }
.status-badge.cleaning { background: #d1ecf1; color: #0c5460; }

.btn-edit, .btn-delete {
  padding: 4px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-right: 8px;
}

.btn-edit { background: #3498db; color: white; }
.btn-delete { background: #e74c3c; color: white; }

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
  width: 400px;
  max-width: 90%;
  padding: 20px;
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
}

.form-item input, .form-item select, .form-item textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
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

.btn-cancel, .btn-confirm {
  padding: 8px 24px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-cancel { background: #f5f5f5; color: #666; }
.btn-confirm { background: #3498db; color: white; }
</style>
