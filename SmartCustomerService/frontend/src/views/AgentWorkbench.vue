<template>
  <div class="agent-workbench">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><UserFilled /></el-icon>
              <span>客服工作台</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="待处理工单" name="pending">
              <el-table :data="pendingTickets" stripe @row-click="goDetail">
                <el-table-column prop="ticketNo" label="工单号" width="160" />
                <el-table-column prop="title" label="标题" show-overflow-tooltip />
                <el-table-column prop="categoryName" label="分类" width="100" />
                <el-table-column prop="priorityName" label="优先级" width="80">
                  <template #default="{ row }">
                    <el-tag :color="row.priorityColor" effect="dark" size="small">{{ row.priorityName }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="customerName" label="客户" width="100" />
                <el-table-column prop="createdAt" label="创建时间" width="160">
                  <template #default="{ row }">
                    {{ formatTime(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" link @click.stop="handleClaim(row)">
                      领取
                    </el-button>
                    <el-button type="primary" link @click.stop="goDetail(row)">
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="我的工单" name="mine">
              <el-table :data="myTickets" stripe @row-click="goDetail">
                <el-table-column prop="ticketNo" label="工单号" width="160" />
                <el-table-column prop="title" label="标题" show-overflow-tooltip />
                <el-table-column prop="statusName" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :color="row.statusColor" effect="dark" size="small">{{ row.statusName }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="priorityName" label="优先级" width="80">
                  <template #default="{ row }">
                    <el-tag :color="row.priorityColor" effect="dark" size="small">{{ row.priorityName }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="customerName" label="客户" width="100" />
                <el-table-column prop="lastMessageAt" label="最后消息" width="160">
                  <template #default="{ row }">
                    {{ formatTime(row.lastMessageAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" link @click.stop="goDetail(row)">
                      处理
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="所有工单" name="all">
              <el-table :data="allTickets" stripe @row-click="goDetail">
                <el-table-column prop="ticketNo" label="工单号" width="160" />
                <el-table-column prop="title" label="标题" show-overflow-tooltip />
                <el-table-column prop="statusName" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :color="row.statusColor" effect="dark" size="small">{{ row.statusName }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="priorityName" label="优先级" width="80">
                  <template #default="{ row }">
                    <el-tag :color="row.priorityColor" effect="dark" size="small">{{ row.priorityName }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="assigneeName" label="处理人" width="100">
                  <template #default="{ row }">
                    {{ row.assigneeName || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" width="160">
                  <template #default="{ row }">
                    {{ formatTime(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" link @click.stop="goDetail(row)">
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>今日统计</span>
          </template>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="value">{{ todayStats.pendingTickets || 0 }}</div>
              <div class="label">待处理</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ todayStats.processingTickets || 0 }}</div>
              <div class="label">处理中</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ todayStats.todayResolved || 0 }}</div>
              <div class="label">今日解决</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ todayStats.avgResponseTime ? (todayStats.avgResponseTime / 60).toFixed(1) + '分钟' : '-' }}</div>
              <div class="label">平均响应</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>客服列表</span>
          </template>
          <el-table :data="agentList" size="small">
            <el-table-column prop="name" label="客服" />
            <el-table-column prop="department" label="部门" />
            <el-table-column prop="onlineStatus" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.onlineStatus === 1 ? 'success' : 'info'" size="small">
                  {{ row.onlineStatus === 1 ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ticketCount" label="工单数" width="80" />
            <el-table-column prop="resolvedCount" label="已解决" width="80" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTicketList, claimTicket } from '@/api/ticket'
import { getAgentList } from '@/api/user'
import { getStatsOverview } from '@/api/stats'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('pending')
const pendingTickets = ref([])
const myTickets = ref([])
const allTickets = ref([])
const agentList = ref([])
const todayStats = reactive({})

function formatTime(time) {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function goDetail(row) {
  router.push(`/ticket/detail/${row.id}`)
}

async function loadPendingTickets() {
  const res = await getTicketList({ page: 1, pageSize: 50, statusCode: 'pending' })
  if (res.code === 0) {
    pendingTickets.value = res.data.list || []
  }
}

async function loadMyTickets() {
  const res = await getTicketList({ page: 1, pageSize: 50 })
  if (res.code === 0) {
    myTickets.value = (res.data.list || []).filter(t => t.statusCode === 'processing')
  }
}

async function loadAllTickets() {
  const res = await getTicketList({ page: 1, pageSize: 50 })
  if (res.code === 0) {
    allTickets.value = res.data.list || []
  }
}

async function loadAgents() {
  const res = await getAgentList()
  if (res.code === 0) {
    agentList.value = res.data || []
  }
}

async function loadTodayStats() {
  const res = await getStatsOverview()
  if (res.code === 0) {
    Object.assign(todayStats, res.data)
  }
}

async function handleClaim(row) {
  try {
    await ElMessageBox.confirm('确定要领取此工单吗？', '提示')
    const res = await claimTicket(row.id)
    if (res.code === 0) {
      ElMessage.success('领取成功')
      loadPendingTickets()
    } else {
      ElMessage.error(res.message || '领取失败')
    }
  } catch (e) {}
}

watch(activeTab, (tab) => {
  if (tab === 'pending') {
    loadPendingTickets()
  } else if (tab === 'mine') {
    loadMyTickets()
  } else if (tab === 'all') {
    loadAllTickets()
  }
})

onMounted(() => {
  loadPendingTickets()
  loadMyTickets()
  loadAllTickets()
  loadAgents()
  loadTodayStats()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  .stat-item {
    text-align: center;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;

    .value {
      font-size: 24px;
      font-weight: bold;
      color: #409EFF;
    }

    .label {
      font-size: 14px;
      color: #909399;
      margin-top: 8px;
    }
  }
}
</style>
