<template>
  <div class="result-page">
    <div class="container">
      <div class="page-header">
        <h1>🎊 答题完成！</h1>
        <p>恭喜你完成了本轮挑战</p>
      </div>

      <el-card class="card-shadow result-card">
        <div class="score-display">
          <div class="score-number gradient-text">{{ quizStore.score }}</div>
          <div class="score-label">总得分</div>
        </div>

        <el-row :gutter="20" style="margin-top: 30px;">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ quizStore.correctCount }}/{{ quizStore.totalQuestions }}</div>
              <div class="stat-label">正确数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ quizStore.accuracy.toFixed(1) }}%</div>
              <div class="stat-label">正确率</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">🔥 {{ quizStore.maxCombo }}</div>
              <div class="stat-label">最高连击</div>
            </div>
          </el-col>
        </el-row>

        <div class="rating-display">
          <el-rate 
            :model-value="getRating" 
            disabled 
            :max="5"
            size="large"
          />
          <p class="rating-text">{{ getRatingText }}</p>
        </div>

        <div class="action-buttons">
          <el-button type="primary" size="large" @click="$router.push('/analysis')">
            📖 查看解析
          </el-button>
          <el-button size="large" @click="playAgain">
            🔄 再来一局
          </el-button>
          <el-button size="large" @click="$router.push('/leaderboard')">
            🏆 排行榜
          </el-button>
        </div>

        <el-divider />

        <div class="back-home">
          <el-button text @click="$router.push('/')">返回首页</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/store'

const router = useRouter()
const quizStore = useQuizStore()

const getRating = computed(() => {
  const accuracy = quizStore.accuracy
  if (accuracy >= 90) return 5
  if (accuracy >= 75) return 4
  if (accuracy >= 60) return 3
  if (accuracy >= 40) return 2
  return 1
})

const getRatingText = computed(() => {
  const accuracy = quizStore.accuracy
  if (accuracy >= 90) return '太棒了！你是知识王者！'
  if (accuracy >= 75) return '非常优秀！继续保持！'
  if (accuracy >= 60) return '表现不错，还有进步空间！'
  if (accuracy >= 40) return '继续加油，下次会更好！'
  return '别灰心，多学习一下再来挑战！'
})

const playAgain = () => {
  quizStore.resetQuiz()
  router.push('/')
}
</script>

<style scoped>
.result-page {
  padding-top: 40px;
}

.result-card {
  text-align: center;
  padding: 40px 20px;
}

.score-display {
  margin-bottom: 20px;
}

.score-number {
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
}

.score-label {
  font-size: 18px;
  color: #6b7280;
  margin-top: 8px;
}

.stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.rating-display {
  margin-top: 30px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.rating-text {
  margin-top: 12px;
  font-size: 16px;
  color: #4b5563;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 30px;
}

.action-buttons .el-button {
  width: 100%;
  padding: 16px;
  font-size: 16px;
}

.back-home {
  margin-top: 10px;
}
</style>
