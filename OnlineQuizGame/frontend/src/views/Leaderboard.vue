<template>
  <div class="leaderboard-page">
    <div class="container">
      <div class="page-header">
        <h1>🏆 排行榜</h1>
        <p>看看谁是知识王者</p>
      </div>

      <el-card class="card-shadow">
        <el-radio-group v-model="period" @change="loadLeaderboard" class="period-tabs">
          <el-radio-button value="daily">日榜</el-radio-button>
          <el-radio-button value="weekly">周榜</el-radio-button>
          <el-radio-button value="total">总榜</el-radio-button>
        </el-radio-group>

        <div v-if="topThree.length" class="top-three">
          <el-row :gutter="16" type="flex" justify="center">
            <el-col :span="6" v-if="topThree[1]">
              <div class="rank-card second">
                <div class="rank-number">2</div>
                <el-avatar :size="60" :src="topThree[1].avatar" />
                <div class="rank-name">{{ topThree[1].nickname }}</div>
                <div class="rank-score">{{ topThree[1].score }} 分</div>
              </div>
            </el-col>
            <el-col :span="6" v-if="topThree[0]">
              <div class="rank-card first">
                <div class="crown">👑</div>
                <div class="rank-number">1</div>
                <el-avatar :size="80" :src="topThree[0].avatar" />
                <div class="rank-name">{{ topThree[0].nickname }}</div>
                <div class="rank-score">{{ topThree[0].score }} 分</div>
              </div>
            </el-col>
            <el-col :span="6" v-if="topThree[2]">
              <div class="rank-card third">
                <div class="rank-number">3</div>
                <el-avatar :size="60" :src="topThree[2].avatar" />
                <div class="rank-name">{{ topThree[2].nickname }}</div>
                <div class="rank-score">{{ topThree[2].score }} 分</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-table 
          :data="restList" 
          style="margin-top: 20px;"
          empty-text="暂无数据"
          :header-cell-style="{ background: '#f9fafb' }"
        >
          <el-table-column label="排名" width="80" align="center">
            <template #default="{ $index }">
              <span class="rank-badge">{{ $index + 4 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户" min-width="150">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="36" :src="row.avatar" />
                <span class="user-name">{{ row.nickname }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="120" align="right">
            <template #default="{ row }">
              <span class="score-text">{{ row.score }} 分</span>
            </template>
          </el-table-column>
        </el-table>

        <el-divider />

        <div class="my-rank" v-if="userStore.userId">
          <el-button type="primary" @click="showMyRank">
            查看我的排名
          </el-button>
          <div v-if="myRank" class="my-rank-display">
            <el-alert
              :title="`你的排名：第 ${myRank.rank} 名，得分：${myRank.score} 分`"
              type="info"
              :closable="false"
            />
          </div>
        </div>
      </el-card>

      <div class="back-home">
        <el-button text @click="$router.push('/')">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLeaderboard, getUserRank } from '@/api'
import { useUserStore } from '@/store'
import { ArrowLeft } from '@element-plus/icons-vue'

const userStore = useUserStore()
const period = ref('total')
const leaderboard = ref([])
const myRank = ref(null)

const topThree = ref([])
const restList = ref([])

const loadLeaderboard = async () => {
  try {
    const res = await getLeaderboard({ 
      period: period.value, 
      limit: 50 
    })
    leaderboard.value = res.data || []
    topThree.value = leaderboard.value.slice(0, 3)
    restList.value = leaderboard.value.slice(3)
  } catch (error) {
    console.error(error)
  }
}

const showMyRank = async () => {
  try {
    const res = await getUserRank({
      userId: userStore.userId,
      period: period.value
    })
    myRank.value = res.data
  } catch (error) {
    myRank.value = null
  }
}

onMounted(() => {
  loadLeaderboard()
})
</script>

<style scoped>
.leaderboard-page {
  padding-top: 40px;
}

.period-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.top-three {
  margin-bottom: 30px;
  padding: 30px 0;
  background: linear-gradient(180deg, #f9fafb 0%, transparent 100%);
  border-radius: 16px;
}

.rank-card {
  text-align: center;
  padding: 20px 10px;
  border-radius: 16px;
  transition: transform 0.3s;
}

.rank-card:hover {
  transform: translateY(-5px);
}

.rank-card.first {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  transform: scale(1.1);
}

.rank-card.second {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
}

.rank-card.third {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
}

.rank-number {
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 8px;
}

.crown {
  font-size: 32px;
  margin-bottom: -10px;
}

.rank-name {
  margin-top: 12px;
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.rank-score {
  margin-top: 4px;
  color: #6b7280;
  font-size: 14px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 50%;
  font-weight: 600;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
}

.score-text {
  font-weight: 600;
  color: #667eea;
}

.my-rank {
  text-align: center;
}

.my-rank-display {
  margin-top: 16px;
}

.back-home {
  text-align: center;
  margin-top: 20px;
}
</style>
