<template>
  <div>
    <div class="page-header flex-between">
      <h2>需求管理</h2>
      <el-button type="primary" @click="$router.push('/demands/create')">
        <el-icon><Plus /></el-icon>
        发布需求
      </el-button>
    </div>

    <el-card>
      <el-table :data="demands" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="service_type" label="服务类型" />
        <el-table-column label="服务时间">
          <template #default="{ row }">
            {{ formatDate(row.start_date) }} 至 {{ formatDate(row.end_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="budget" label="预算">
          <template #default="{ row }">
            ¥{{ row.budget || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleRecommendNannies(row.id)">
              智能匹配
            </el-button>
            <el-dropdown @command="(cmd) => handleStatusChange(row.id, cmd)">
              <el-button type="text">更新状态</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pending">待处理</el-dropdown-item>
                  <el-dropdown-item command="matched">已匹配</el-dropdown-item>
                  <el-dropdown-item command="completed">已完成</el-dropdown-item>
                  <el-dropdown-item command="cancelled">已取消</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="recommendVisible" title="智能推荐月嫂" width="80%">
      <el-table :data="recommendedNannies">
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="50">
              <img :src="row.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="等级">
          <template #default="{ row }">
            <el-tag type="success">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="经验" prop="experience">
          <template #default="{ row }">
            {{ row.experience }}年
          </template>
        </el-table-column>
        <el-table-column label="评分">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column label="匹配度">
          <template #default="{ row }">
            <el-progress :percentage="Math.min((row.rating / 10) * 100, 100)" :color="getProgressColor(row.rating)" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="primary" @click="quickOrder(row)">立即预约</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyDemands, getDemands, updateDemandStatus, recommendNannies as apiRecommendNannies, createOrder } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const demands = ref([])
const loading = ref(false)
const recommendVisible = ref(false)
const recommendedNannies = ref([])
const currentDemandId = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    let res
    if (userStore.role === 'customer') {
      res = await getMyDemands()
    } else {
      res = await getDemands({ page_size: 100 })
    }
    demands.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const map = { pending: 'warning', matched: 'primary', completed: 'success', cancelled: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '待处理', matched: '已匹配', completed: '已完成', cancelled: '已取消' }
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

const getProgressColor = (rating) => {
  if (rating >= 8) return '#67c23a'
  if (rating >= 6) return '#409eff'
  return '#e6a23c'
}

const handleStatusChange = async (id, status) => {
  try {
    await updateDemandStatus(id, { status })
    ElMessage.success('状态更新成功')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const handleRecommendNannies = async (id) => {
  currentDemandId.value = id
  try {
    const res = await apiRecommendNannies(id)
    recommendedNannies.value = res.data
    recommendVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

const formatDateForAPI = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const quickOrder = async (nanny) => {
  try {
    const demand = demands.value.find(d => d.id === currentDemandId.value)
    await createOrder({
      nanny_id: nanny.id,
      demand_id: currentDemandId.value,
      service_type: demand?.service_type || '月嫂服务',
      start_date: formatDateForAPI(demand?.start_date),
      end_date: formatDateForAPI(demand?.end_date),
      price: demand?.budget || 15000
    })
    ElMessage.success('订单创建成功')
    recommendVisible.value = false
    router.push('/orders')
  } catch (error) {
    console.error(error)
  }
}

onMounted(loadData)
</script>
