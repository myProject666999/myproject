<template>
  <div class="page-container">
    <div class="card hero-card">
      <h1>欢迎来到在线编程评测系统</h1>
      <p class="subtitle">支持 C/C++/Java/Python 多语言判题，海量题库等你来挑战！</p>
      <div class="quick-actions">
        <el-button type="primary" size="large" @click="$router.push('/problem/list')">
          <el-icon><Collection /></el-icon>开始刷题
        </el-button>
        <el-button size="large" @click="$router.push('/contest/list')">
          <el-icon><Trophy /></el-icon>参加竞赛
        </el-button>
        <el-button size="large" @click="$router.push('/ranklist')">
          <el-icon><Medal /></el-icon>查看排行榜
        </el-button>
      </div>
    </div>

    <div class="content-row">
      <div class="card announcement-card">
        <div class="card-header">
          <h3><el-icon><Bell /></el-icon>系统公告</h3>
        </div>
        <div v-if="announcements.length === 0" class="empty">暂无公告</div>
        <div v-else class="announcement-list">
          <div v-for="item in announcements" :key="item.id" class="announcement-item">
            <el-tag v-if="item.priority === 1" type="danger" size="small" class="tag">置顶</el-tag>
            <div class="announcement-content">
              <div class="announcement-title">{{ item.title }}</div>
              <div class="announcement-meta">{{ item.createTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card stats-card">
        <div class="card-header">
          <h3><el-icon><DataAnalysis /></el-icon>平台数据</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.problemCount }}</div>
            <div class="stat-label">题目总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.submissionCount }}</div>
            <div class="stat-label">提交次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.userCount }}</div>
            <div class="stat-label">注册用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.contestCount }}</div>
            <div class="stat-label">竞赛场次</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card recent-card">
      <div class="card-header">
        <h3><el-icon><Clock /></el-icon>最近提交</h3>
        <el-link type="primary" @click="$router.push('/submission/list')">查看全部</el-link>
      </div>
      <el-table :data="recentSubmissions" stripe>
        <el-table-column label="用户" width="120">
          <template #default="scope">
            {{ scope.row.user?.nickname || scope.row.user?.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="题目" width="200">
          <template #default="scope">
            <router-link :to="`/problem/detail/${scope.row.problemId}`" style="color: #409eff; text-decoration: none;">
              {{ scope.row.problem?.title || `#${scope.row.problemId}` }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="语言" prop="language" width="80" />
        <el-table-column label="状态" width="150">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.status)">{{ scope.row.statusText }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用时" width="80">
          <template #default="scope">
            {{ scope.row.timeUsed ? scope.row.timeUsed + 'ms' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="提交时间" prop="createTime" width="170" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const announcements = ref([])
const recentSubmissions = ref([])
const stats = ref({
  problemCount: 0,
  submissionCount: 0,
  userCount: 0,
  contestCount: 0
})

const fetchAnnouncements = async () => {
  try {
    const res = await request.get('/announcement/list', { params: { page: 1, size: 5 } })
    announcements.value = res.data.records || []
  } catch (e) {}
}

const fetchRecentSubmissions = async () => {
  try {
    const res = await request.get('/submission/list', { params: { page: 1, size: 10 } })
    recentSubmissions.value = res.data.records || []
  } catch (e) {}
}

const getStatusClass = (s) => {
  if (s === 2) return 'status-accepted'
  if (s === 0 || s === 1) return 'status-pending'
  return 'status-error'
}

onMounted(() => {
  fetchAnnouncements()
  fetchRecentSubmissions()
})
</script>

<style lang="scss" scoped>
.hero-card {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;

  h1 {
    font-size: 32px;
    margin: 0 0 10px;
  }

  .subtitle {
    font-size: 16px;
    opacity: 0.9;
    margin: 0 0 20px;
  }

  .quick-actions {
    display: flex;
    gap: 15px;
    justify-content: center;

    .el-button {
      color: #303133;
    }

    .el-button--primary {
      color: #fff;
    }
  }
}

.content-row {
  display: flex;
  gap: 20px;
  margin-bottom: 0;

  .card {
    flex: 1;
    margin-bottom: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;

  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
  }
}

.announcement-list {
  .announcement-item {
    display: flex;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid #f5f7fa;

    &:last-child {
      border-bottom: none;
    }

    .tag {
      flex-shrink: 0;
      margin-right: 10px;
    }

    .announcement-content {
      flex: 1;

      .announcement-title {
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
      }

      .announcement-meta {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.empty {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;

  .stat-item {
    text-align: center;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 8px;

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
    }

    .stat-label {
      font-size: 13px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

@media (max-width: 768px) {
  .content-row {
    flex-direction: column;
  }

  .hero-card h1 {
    font-size: 24px;
  }
}
</style>
