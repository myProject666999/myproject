<template>
  <div>
    <div class="page-header">
      <h2>数据概览</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409eff">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.nannies }}</div>
            <div class="stat-label">月嫂总数</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon><ShoppingBag /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.orders }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.demands }}</div>
            <div class="stat-label">需求总数</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.courses }}</div>
            <div class="stat-label">课程总数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最新订单</span>
          </template>
          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column prop="order_no" label="订单号" width="180" />
            <el-table-column prop="service_type" label="服务类型" />
            <el-table-column prop="price" label="金额">
              <template #default="{ row }">
                ¥{{ row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>待处理纠纷</span>
          </template>
          <el-table :data="recentDisputes" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'pending' ? 'warning' : 'success'">
                  {{ row.status === 'pending' ? '待处理' : '已处理' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNannies, getOrders, getDemands, getCourses, getDisputes, getMyOrders, getMyDemands } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const stats = ref({ nannies: 0, orders: 0, demands: 0, courses: 0 })
const recentOrders = ref([])
const recentDisputes = ref([])

const loadData = async () => {
  try {
    const [nannies, courses, disputes] = await Promise.all([
      getNannies({ page_size: 1000 }),
      getCourses({ page_size: 1000 }),
      getDisputes()
    ])

    let ordersRes
    let demandsRes

    if (userStore.role === 'admin') {
      const [o, d] = await Promise.all([
        getOrders({ page_size: 5 }),
        getDemands({ page_size: 1000 })
      ])
      ordersRes = o
      demandsRes = d
    } else {
      const [o, d] = await Promise.all([
        getMyOrders(),
        userStore.role === 'customer' ? getMyDemands() : { data: [] }
      ])
      ordersRes = { data: { list: o.data || [], total: (o.data || []).length } }
      demandsRes = { data: { list: d.data || [], total: (d.data || []).length } }
    }

    stats.value = {
      nannies: nannies.data.total || 0,
      orders: ordersRes.data.total || 0,
      demands: demandsRes.data.total || 0,
      courses: courses.data.total || 0
    }

    recentOrders.value = ordersRes.data.list || ordersRes.data || []
    recentDisputes.value = (disputes.data || []).slice(0, 5)
  } catch (error) {
    console.error(error)
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

onMounted(loadData)
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}
</style>
