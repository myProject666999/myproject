<template>
  <div>
    <h2 class="mb-20">订单管理</h2>

    <el-card>
      <el-table :data="orders" v-loading="loading">
        <el-table-column prop="order_no" label="订单号" width="200" />
        <el-table-column prop="service_type" label="服务类型" />
        <el-table-column label="服务时间" width="250">
          <template #default="{ row }">
            {{ formatDate(row.start_date) }} 至 {{ formatDate(row.end_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_days" label="天数" width="80" />
        <el-table-column prop="price" label="金额">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row.id)">详情</el-button>
            <el-dropdown @command="(cmd) => handleStatusChange(row.id, cmd)" v-if="isAdmin">
              <el-button type="text">更新状态</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pending">待确认</el-dropdown-item>
                  <el-dropdown-item command="active">进行中</el-dropdown-item>
                  <el-dropdown-item command="completed">已完成</el-dropdown-item>
                  <el-dropdown-item command="cancelled">已取消</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyOrders, getOrders, updateOrderStatus } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const orders = ref([])
const loading = ref(false)

const isAdmin = computed(() => userStore.role === 'admin')

const loadData = async () => {
  loading.value = true
  try {
    let res
    if (userStore.role === 'admin') {
      res = await getOrders({ page_size: 100 })
      orders.value = res.data.list
    } else {
      res = await getMyOrders()
      orders.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const map = { pending: 'warning', active: 'primary', completed: 'success', cancelled: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '待确认', active: '进行中', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const viewDetail = (id) => {
  router.push(`/orders/${id}`)
}

const handleStatusChange = async (id, status) => {
  try {
    await updateOrderStatus(id, { status })
    ElMessage.success('状态更新成功')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

onMounted(loadData)
</script>
