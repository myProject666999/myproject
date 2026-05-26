<template>
  <div class="ranking-page">
    <el-card class="ranking-card">
      <template #header>
        <div class="card-header">
          <span class="title">积分排行榜</span>
          <span class="subtitle">实时更新 · 全平台积分排名</span>
        </div>
      </template>

      <div class="top-three" v-if="ranking.length >= 3">
        <div class="rank-item rank-2" @click="goUserDetail(ranking[1])">
          <div class="avatar">
            <el-avatar :size="64" :icon="UserFilled" />
          </div>
          <div class="medal silver"><el-icon><Medal /></el-icon></div>
          <div class="info">
            <p class="name">{{ ranking[1]?.nickname }}</p>
            <p class="points">{{ ranking[1]?.total_points }} 积分</p>
          </div>
        </div>
        <div class="rank-item rank-1" @click="goUserDetail(ranking[0])">
          <div class="crown"><el-icon :size="28"><Crown /></el-icon></div>
          <div class="avatar">
            <el-avatar :size="72" :icon="UserFilled" />
          </div>
          <div class="medal gold"><el-icon><Trophy /></el-icon></div>
          <div class="info">
            <p class="name">{{ ranking[0]?.nickname }}</p>
            <p class="points">{{ ranking[0]?.total_points }} 积分</p>
          </div>
        </div>
        <div class="rank-item rank-3" @click="goUserDetail(ranking[2])">
          <div class="avatar">
            <el-avatar :size="64" :icon="UserFilled" />
          </div>
          <div class="medal bronze"><el-icon><Medal /></el-icon></div>
          <div class="info">
            <p class="name">{{ ranking[2]?.nickname }}</p>
            <p class="points">{{ ranking[2]?.total_points }} 积分</p>
          </div>
        </div>
      </div>

      <el-table :data="ranking.slice(3)" style="width: 100%; margin-top: 24px;" v-loading="loading">
        <el-table-column type="index" label="排名" width="80" align="center">
          <template #default="{ $index }">
            <span class="rank-num">{{ $index + 4 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36" :icon="UserFilled" />
              <span class="nickname">{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_points" label="总积分" width="150" align="center">
          <template #default="{ row }">
            <span class="points-cell">{{ row.total_points }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="goUserDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getRanking } from '@/api'

const ranking = ref([])
const loading = ref(false)

async function loadRanking() {
  loading.value = true
  try {
    const res = await getRanking({ limit: 20 })
    if (res.code === 0) {
      ranking.value = res.data || []
    }
  } catch (e) {
    ranking.value = getMockRanking()
  } finally {
    loading.value = false
  }
}

function getMockRanking() {
  return [
    { rank: 1, user_id: 1, nickname: '超级管理员', total_points: 10000 },
    { rank: 2, user_id: 4, nickname: '王五', total_points: 8000 },
    { rank: 3, user_id: 2, nickname: '张三', total_points: 5000 },
    { rank: 4, user_id: 3, nickname: '李四', total_points: 3000 },
    { rank: 5, user_id: 5, nickname: '赵六', total_points: 1500 },
    { rank: 6, user_id: 6, nickname: '钱七', total_points: 800 },
    { rank: 7, user_id: 7, nickname: '孙八', total_points: 500 },
    { rank: 8, user_id: 8, nickname: '周九', total_points: 300 }
  ]
}

function goUserDetail(row) {
  ElMessage.info(`查看用户 ${row.nickname} 的详情（演示功能）`)
}

onMounted(() => {
  loadRanking()
})
</script>

<style lang="scss" scoped>
.ranking-page {
  .ranking-card {
    border-radius: 12px;

    .card-header {
      display: flex;
      align-items: baseline;
      gap: 12px;

      .title {
        font-size: 20px;
        font-weight: 700;
        color: #303133;
      }

      .subtitle {
        font-size: 13px;
        color: #909399;
      }
    }

    .top-three {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 48px;
      padding: 32px 0 8px;

      .rank-item {
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
          transform: translateY(-4px);
        }

        .crown {
          color: #f59e0b;
          margin-bottom: 8px;
        }

        .avatar {
          margin-bottom: 12px;

          :deep(.el-avatar) {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        }

        .medal {
          margin-bottom: 8px;
          font-size: 28px;

          &.gold {
            color: #f59e0b;
          }

          &.silver {
            color: #909399;
          }

          &.bronze {
            color: #cd7f32;
          }
        }

        .info {
          .name {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin: 0 0 4px;
          }

          .points {
            font-size: 18px;
            font-weight: 700;
            color: #f59e0b;
            margin: 0;
          }
        }

        &.rank-1 {
          transform: scale(1.1);

          &:hover {
            transform: scale(1.1) translateY(-4px);
          }

          .avatar :deep(.el-avatar) {
            background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          }
        }

        &.rank-2 {
          .avatar :deep(.el-avatar) {
            background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
          }
        }

        &.rank-3 {
          .avatar :deep(.el-avatar) {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          }
        }
      }
    }

    .rank-num {
      font-weight: 600;
      color: #606266;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      :deep(.el-avatar) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .nickname {
        font-weight: 500;
        color: #303133;
      }
    }

    .points-cell {
      font-weight: 600;
      color: #f59e0b;
      font-size: 15px;
    }
  }
}
</style>
