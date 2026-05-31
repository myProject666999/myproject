<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>管理后台</h2>
    </div>
    <el-card v-loading="statsLoading" shadow="never" class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">用户总数</div>
            <div class="stat-value">{{ statistics.userCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">团购总数</div>
            <div class="stat-value">{{ statistics.groupCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">订单总数</div>
            <div class="stat-value">{{ statistics.orderCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">交易总额</div>
            <div class="stat-value">¥{{ statistics.totalAmount || 0 }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-card shadow="never" class="tabs-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="用户管理" name="users">
          <el-table :data="users" v-loading="usersLoading" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="nickname" label="昵称" />
            <el-table-column prop="phone" label="手机号" />
            <el-table-column label="角色" width="100">
              <template #default="{ row }">
                <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'info'" size="small">
                  {{ row.role === 'ADMIN' ? '管理员' : '普通用户' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="注册时间" width="170">
              <template #default="{ row }">
                {{ formatDate(row.createTime || row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="团购管理" name="groups">
          <el-table :data="adminGroups" v-loading="groupsLoading" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column label="价格" width="120">
              <template #default="{ row }">
                <span class="price-text">¥{{ row.groupPrice || row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column label="进度" width="160">
              <template #default="{ row }">
                <el-progress
                  :percentage="getProgressPercentage(row)"
                  :stroke-width="8"
                  style="max-width: 120px;"
                />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="groupStatusTagType(row.status)" size="small">
                  {{ groupStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="170">
              <template #default="{ row }">
                {{ formatDate(row.createTime || row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="订单管理" name="orders">
          <el-table :data="adminOrders" v-loading="ordersLoading" stripe>
            <el-table-column prop="id" label="订单号" width="100">
              <template #default="{ row }">
                #{{ row.id }}
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="商品" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column label="金额" width="120" align="right">
              <template #default="{ row }">
                <span class="amount-text">¥{{ row.totalAmount || row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="orderStatusTagType(row.status)" size="small">
                  {{ orderStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="下单时间" width="170">
              <template #default="{ row }">
                {{ formatDate(row.createTime || row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="商品管理" name="products">
          <el-table :data="adminProducts" v-loading="productsLoading" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column label="价格" width="120" align="right">
              <template #default="{ row }">
                <span class="amount-text">¥{{ row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="100" align="center" />
            <el-table-column prop="createTime" label="上架时间" width="170">
              <template #default="{ row }">
                {{ formatDate(row.createTime || row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api'

const activeTab = ref('users')
const statsLoading = ref(false)
const statistics = ref({})

const users = ref([])
const usersLoading = ref(false)
const adminGroups = ref([])
const groupsLoading = ref(false)
const adminOrders = ref([])
const ordersLoading = ref(false)
const adminProducts = ref([])
const productsLoading = ref(false)

async function fetchStatistics() {
  statsLoading.value = true
  try {
    const res = await adminApi.getStatistics()
    statistics.value = res.data || {}
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  } finally {
    statsLoading.value = false
  }
}

async function fetchUsers() {
  usersLoading.value = true
  try {
    const res = await adminApi.getUsers({ page: 1, size: 50 })
    users.value = res.data || []
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    usersLoading.value = false
  }
}

async function fetchGroups() {
  groupsLoading.value = true
  try {
    const res = await adminApi.getGroups({ page: 1, size: 50 })
    adminGroups.value = res.data || []
  } catch (error) {
    ElMessage.error('获取团购列表失败')
  } finally {
    groupsLoading.value = false
  }
}

async function fetchOrders() {
  ordersLoading.value = true
  try {
    const res = await adminApi.getOrders({ page: 1, size: 50 })
    adminOrders.value = res.data || []
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    ordersLoading.value = false
  }
}

async function fetchProducts() {
  productsLoading.value = true
  try {
    const res = await adminApi.getProducts({ page: 1, size: 50 })
    adminProducts.value = res.data || []
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    productsLoading.value = false
  }
}

function handleTabChange(tab) {
  if (tab === 'users' && users.value.length === 0) fetchUsers()
  if (tab === 'groups' && adminGroups.value.length === 0) fetchGroups()
  if (tab === 'orders' && adminOrders.value.length === 0) fetchOrders()
  if (tab === 'products' && adminProducts.value.length === 0) fetchProducts()
}

function getProgressPercentage(row) {
  const current = row.currentCount || row.joinedCount || 0
  const target = row.targetCount || row.maxCount || 1
  return Math.min(Math.round((current / target) * 100), 100)
}

function groupStatusTagType(status) {
  const map = { 0: 'success', 1: 'primary', 2: 'info', 3: 'danger' }
  return map[status] || 'info'
}

function groupStatusText(status) {
  const map = { 0: '进行中', 1: '已成团', 2: '拼团失败', 3: '已取消' }
  return map[status] ?? status
}

function orderStatusTagType(status) {
  const map = { 0: 'warning', 1: 'success', 2: 'info', 3: 'danger' }
  return map[status] || 'info'
}

function orderStatusText(status) {
  const map = { 0: '待支付', 1: '已支付', 2: '已退款', 3: '已取消' }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  fetchStatistics()
  fetchUsers()
})
</script>

<style scoped>
.admin-page {
  padding: 10px 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.stats-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px 0;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.tabs-card {
  border-radius: 12px;
}

.price-text {
  color: #f56c6c;
  font-weight: 500;
}

.amount-text {
  color: #f56c6c;
  font-weight: 600;
}
</style>
