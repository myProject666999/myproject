<template>
  <div class="page-container">
    <div class="dashboard-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon drama">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.dramaCount }}</div>
              <div class="stat-label">剧集总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon stakeholder">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.stakeholderCount }}</div>
              <div class="stat-label">权益方数量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon amount">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ stats.totalAmount }}</div>
              <div class="stat-label">累计分账金额</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon task">
              <el-icon><List /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.taskCount }}</div>
              <div class="stat-label">分账任务数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <div class="card">
          <div class="card-header">
            <span class="card-title">最近分账任务</span>
          </div>
          <el-table :data="recentTasks" style="width: 100%">
            <el-table-column prop="task_no" label="任务编号" width="200" />
            <el-table-column prop="settlement_period" label="结算周期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" />
          </el-table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card">
          <div class="card-header">
            <span class="card-title">系统提示</span>
          </div>
          <div class="welcome-content">
            <el-alert
              title="欢迎使用短剧分账与版权结算平台"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>本平台提供以下功能：</p>
                <ul>
                  <li>剧集管理与权益分配</li>
                  <li>分账规则配置（支持DSL）</li>
                  <li>播放与付费数据接入</li>
                  <li>自动分账计算（幂等可重跑）</li>
                  <li>结算单生成与哈希验证</li>
                  <li>对账管理与版权授权</li>
                </ul>
              </template>
            </el-alert>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getCalculationTasks } from '@/api/share'

const stats = reactive({
  dramaCount: 0,
  stakeholderCount: 0,
  totalAmount: '0.00',
  taskCount: 0
})

const recentTasks = reactive([])

const getStatusType = (status) => {
  const types = ['info', 'warning', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待处理', '处理中', '已完成', '失败']
  return texts[status] || '未知'
}

const loadData = async () => {
  try {
    const res = await getCalculationTasks({ page_size: 5 })
    if (res && res.list) {
      recentTasks.push(...res.list)
      stats.taskCount = res.total || 0
    }
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

onMounted(() => {
  stats.dramaCount = 12
  stats.stakeholderCount = 45
  stats.totalAmount = '1,234,567.89'
  loadData()
})
</script>

<style scoped lang="scss">
.dashboard-stats {
  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #fff;

      &.drama {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      &.stakeholder {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
      &.amount {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
      &.task {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .stat-content {
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
      }
      .stat-label {
        font-size: 14px;
        color: #6b7280;
      }
    }
  }
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }
}

.welcome-content {
  ul {
    margin: 10px 0 0 20px;
    padding: 0;

    li {
      margin-bottom: 6px;
      color: #606266;
    }
  }
}
</style>
