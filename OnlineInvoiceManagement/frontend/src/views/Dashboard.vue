<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <el-icon size="40" color="#409EFF"><OfficeBuilding /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total_titles || 0 }}</div>
              <div class="stat-label">抬头总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <el-icon size="40" color="#E6A23C"><List /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total_applications || 0 }}</div>
              <div class="stat-label">申请总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <el-icon size="40" color="#67C23A"><Tickets /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total_invoices || 0 }}</div>
              <div class="stat-label">发票总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <el-icon size="40" color="#F56C6C"><Money /></el-icon>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatMoney(stats.total_invoice_amount) }}</div>
              <div class="stat-label">开票总金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>申请状态分布</span>
          </template>
          <div class="status-dist">
            <div v-for="(item, index) in statusList" :key="index" class="status-item">
              <el-tag :type="item.type" size="large">{{ item.label }}</el-tag>
              <span class="status-count">{{ item.count }} 条</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="$router.push('/applications/create')">
              <el-icon><Edit /></el-icon>
              新建开票申请
            </el-button>
            <el-button type="success" size="large" @click="$router.push('/review')">
              <el-icon><CircleCheck /></el-icon>
              审核申请
            </el-button>
            <el-button type="warning" size="large" @click="$router.push('/titles')">
              <el-icon><OfficeBuilding /></el-icon>
              管理抬头
            </el-button>
            <el-button type="info" size="large" @click="$router.push('/invoices')">
              <el-icon><Tickets /></el-icon>
              查看发票记录
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { statisticsApi } from '../api'

const stats = ref({})

onMounted(async () => {
  try {
    const res = await statisticsApi.get()
    stats.value = res.data
  } catch (e) {
    console.error(e)
  }
})

const statusList = computed(() => {
  const sc = stats.value.status_counts || {}
  return [
    { label: '待审核', count: sc[1] || 0, type: 'warning' },
    { label: '已通过', count: sc[2] || 0, type: 'success' },
    { label: '已驳回', count: sc[3] || 0, type: 'danger' },
    { label: '已开票', count: sc[4] || 0, type: 'info' }
  ]
})

const formatMoney = (v) => {
  if (!v) return '0.00'
  return Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.status-dist {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.status-count {
  font-size: 16px;
  color: #606266;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-actions .el-button {
  width: 100%;
  justify-content: flex-start;
}
</style>