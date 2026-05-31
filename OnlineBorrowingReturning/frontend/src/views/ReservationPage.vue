<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Clock /></el-icon>
        预约排队
      </h2>
    </div>

    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>发起预约</span>
        </div>
      </template>
      <el-form :inline="true" :model="reserveForm">
        <el-form-item label="选择物品">
          <el-select v-model="reserveForm.itemId" placeholder="请选择物品" filterable style="width: 250px;">
            <el-option
              v-for="item in items"
              :key="item.id"
              :label="`${item.name} (库存: ${item.quantity}/${item.total_quantity})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预约人">
          <el-input v-model="reserveForm.reserverName" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="学号/工号">
          <el-input v-model="reserveForm.reserverId" placeholder="学号或工号" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="reserveForm.phone" placeholder="联系电话" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submitReservation">
            提交预约
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-divider />

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="当前排队" name="waiting">
        <el-table :data="waitingReservations" v-loading="loading" style="width: 100%;">
          <el-table-column prop="queue_position" label="排队位置" width="100">
            <template #default="{ row }">
              <el-tag :type="row.queue_position === 1 ? 'success' : 'warning'" size="large">
                第 {{ row.queue_position }} 位
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="item.name" label="物品名称" />
          <el-table-column prop="reserver_name" label="预约人" />
          <el-table-column prop="reserver_id" label="学号/工号" />
          <el-table-column prop="phone" label="联系电话" />
          <el-table-column prop="reserve_date" label="预约时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.reserve_date) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                {{ row.status === 'active' ? '可领取' : '等待中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="danger" size="small" @click="cancelReservation(row)">
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!loading && waitingReservations.length === 0" description="暂无排队预约" />
      </el-tab-pane>

      <el-tab-pane label="历史预约" name="history">
        <el-table :data="historyReservations" v-loading="loading" style="width: 100%;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="item.name" label="物品名称" />
          <el-table-column prop="reserver_name" label="预约人" />
          <el-table-column prop="reserver_id" label="学号/工号" />
          <el-table-column prop="reserve_date" label="预约时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.reserve_date) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getReservationStatusType(row.status)" size="small">
                {{ getReservationStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!loading && historyReservations.length === 0" description="暂无历史记录" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import { itemApi, reservationApi } from '@/api'

const loading = ref(false)
const submitting = ref(false)
const activeTab = ref('waiting')
const items = ref([])
const reservations = ref([])

const reserveForm = ref({
  itemId: null,
  reserverName: '',
  reserverId: '',
  phone: ''
})

const waitingReservations = computed(() => {
  return reservations.value.filter(r => r.status === 'waiting' || r.status === 'active')
    .sort((a, b) => a.queue_position - b.queue_position)
})

const historyReservations = computed(() => {
  return reservations.value.filter(r => r.status === 'completed' || r.status === 'cancelled')
})

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getReservationStatusType = (status) => {
  const map = {
    waiting: 'info',
    active: 'success',
    completed: 'primary',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const getReservationStatusText = (status) => {
  const map = {
    waiting: '等待中',
    active: '可领取',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const loadItems = async () => {
  try {
    const res = await itemApi.getItems()
    items.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadReservations = async () => {
  loading.value = true
  try {
    const res = await reservationApi.getReservations()
    reservations.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const submitReservation = async () => {
  if (!reserveForm.value.itemId || !reserveForm.value.reserverName || !reserveForm.value.reserverId) {
    ElMessage.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    const data = {
      item_id: reserveForm.value.itemId,
      reserver_name: reserveForm.value.reserverName,
      reserver_id: reserveForm.value.reserverId,
      phone: reserveForm.value.phone,
      reserve_date: new Date().toISOString()
    }
    const res = await reservationApi.createReservation(data)
    ElMessage.success(`预约成功，排队位置: 第 ${res.data.queue_position} 位`)
    reserveForm.value = { itemId: null, reserverName: '', reserverId: '', phone: '' }
    loadReservations()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const cancelReservation = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await reservationApi.cancelReservation(row.id)
    ElMessage.success('取消成功')
    loadReservations()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

onMounted(() => {
  loadItems()
  loadReservations()
})
</script>
