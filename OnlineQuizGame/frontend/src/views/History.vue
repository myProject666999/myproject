<template>
  <div class="history-page">
    <div class="container">
      <div class="page-header">
        <h1>📊 答题记录</h1>
        <p>回顾你的答题历程</p>
      </div>

      <el-card class="card-shadow">
        <div v-if="!userStore.userId" class="no-login">
          <el-empty description="请先登录" />
          <el-button type="primary" @click="$router.push('/')">
            去登录
          </el-button>
        </div>

        <div v-else>
          <div v-if="!history.length" class="no-data">
            <el-empty description="暂无答题记录" />
            <el-button type="primary" @click="$router.push('/')">
              开始答题
            </el-button>
          </div>

          <div v-else>
            <el-table 
              :data="history" 
              style="width: 100%;"
              :header-cell-style="{ background: '#f9fafb' }"
              @row-click="viewDetail"
              highlight-current-row
            >
              <el-table-column label="时间" prop="createdAt" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="得分" prop="score" width="100">
                <template #default="{ row }">
                  <span class="score-text">{{ row.score }}</span>
                </template>
              </el-table-column>
              <el-table-column label="正确率" width="120">
                <template #default="{ row }">
                  {{ row.totalQuestions > 0 
                    ? ((row.correctCount / row.totalQuestions) * 100).toFixed(1) 
                    : 0 }}%
                </template>
              </el-table-column>
              <el-table-column label="最高连击" prop="maxCombo" width="100">
                <template #default="{ row }">
                  🔥 {{ row.maxCombo }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="primary" link @click.stop="viewDetail(row)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="loadHistory"
              style="margin-top: 20px; justify-content: center;"
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

    <el-dialog v-model="detailVisible" title="答题详情" width="600px">
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="开始时间">
            {{ formatDate(currentDetail.gameInfo.startTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ formatDate(currentDetail.gameInfo.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="总题数">
            {{ currentDetail.gameInfo.totalQuestions }}
          </el-descriptions-item>
          <el-descriptions-item label="正确数">
            {{ currentDetail.gameInfo.correctCount }}
          </el-descriptions-item>
          <el-descriptions-item label="得分">
            {{ currentDetail.gameInfo.score }}
          </el-descriptions-item>
          <el-descriptions-item label="最高连击">
            {{ currentDetail.gameInfo.maxCombo }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h4>答题详情</h4>
        <div v-for="(detail, index) in currentDetail.details" :key="detail.id" class="detail-item">
          <div class="detail-header">
            <span>第 {{ index + 1 }} 题</span>
            <el-tag :type="detail.isCorrect ? 'success' : 'danger'" size="small">
              {{ detail.isCorrect ? '正确' : '错误' }}
            </el-tag>
          </div>
          <p class="detail-question">{{ detail.questionText }}</p>
          <div class="detail-answer">
            <span>你的答案: <strong>{{ detail.userAnswer || '未作答' }}</strong></span>
            <span>正确答案: <strong class="correct">{{ detail.correctAnswer }}</strong></span>
          </div>
          <p v-if="detail.explanation" class="detail-explanation">
            解析: {{ detail.explanation }}
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHistory, getGameDetail } from '@/api'
import { useUserStore } from '@/store'
import { ArrowLeft } from '@element-plus/icons-vue'

const userStore = useUserStore()
const history = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailVisible = ref(false)
const currentDetail = ref(null)

const loadHistory = async () => {
  try {
    const res = await getHistory({ userId: userStore.userId })
    history.value = res.data || []
    total.value = history.value.length
  } catch (error) {
    console.error(error)
  }
}

const viewDetail = async (row) => {
  try {
    const res = await getGameDetail({ gameId: row.id })
    currentDetail.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  if (userStore.userId) {
    loadHistory()
  }
})
</script>

<style scoped>
.history-page {
  padding-top: 40px;
}

.no-login, .no-data {
  text-align: center;
  padding: 40px 0;
}

.score-text {
  font-weight: 600;
  color: #667eea;
  font-size: 18px;
}

.back-home {
  text-align: center;
  margin-top: 20px;
}

.detail-item {
  padding: 12px;
  margin-bottom: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-question {
  font-weight: 500;
  margin-bottom: 8px;
}

.detail-answer {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
}

.correct {
  color: #10b981;
}

.detail-explanation {
  color: #6b7280;
  font-size: 14px;
  padding: 8px;
  background: white;
  border-radius: 4px;
}
</style>
