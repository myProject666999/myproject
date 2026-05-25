<template>
  <div class="quiz-page">
    <div class="container">
      <div v-if="!quizStore.questions.length">
        <el-empty description="没有题目数据" />
        <el-button type="primary" @click="$router.push('/')" style="margin-top: 20px;">
          返回首页
        </el-button>
      </div>

      <div v-else>
        <div class="quiz-header">
          <div class="quiz-info">
            <span class="question-index">
              第 {{ quizStore.currentIndex + 1 }} / {{ quizStore.questions.length }} 题
            </span>
            <span v-if="quizStore.currentCombo >= 3" class="combo-badge">
              🔥 {{ quizStore.currentCombo }} 连击
            </span>
          </div>
          <div class="score-info">
            <span>✅ {{ quizStore.correctCount }} 正确</span>
          </div>
        </div>

        <el-progress 
          :percentage="quizStore.progress" 
          :stroke-width="8"
          :show-text="false"
          style="margin-bottom: 16px;"
        />

        <div class="timer-container">
          <div class="timer-display">
            <el-icon :size="20"><Timer /></el-icon>
            <span :class="{ 'timer-warning': timeLeft <= 10, 'timer-danger': timeLeft <= 5 }">
              {{ timeLeft }}s
            </span>
          </div>
          <div class="timer-bar">
            <div 
              class="timer-progress" 
              :style="{ width: (timeLeft / quizStore.quizTime * 100) + '%' }"
            ></div>
          </div>
        </div>

        <transition name="slide" mode="out-in">
          <el-card class="question-card card-shadow" :key="quizStore.currentIndex">
            <h2 class="question-text">
              {{ currentQuestion.questionText }}
            </h2>

            <div class="options">
              <button
                v-for="(option, index) in options"
                :key="index.key"
                class="option-btn"
                :class="getOptionClass(option.key)"
                :disabled="quizStore.currentAnswer || quizStore.isSubmitting"
                @click="handleSelect(option.key)"
              >
                <span class="option-label">{{ option.key }}</span>
                <span class="option-text">{{ option.text }}</span>
              </button>
            </div>

            <div v-if="quizStore.currentAnswer" class="answer-feedback">
              <el-alert
                :title="currentAnswer.isCorrect ? '回答正确！' : '回答错误'"
                :type="currentAnswer.isCorrect ? 'success' : 'error'"
                :closable="false"
                style="margin-bottom: 12px;"
              />
              <div v-if="currentAnswer.explanation" class="explanation">
                <strong>解析：</strong>{{ currentAnswer.explanation }}
              </div>
            </div>

            <div class="action-buttons">
              <el-button
                v-if="quizStore.currentAnswer"
                type="primary"
                size="large"
                @click="handleNext"
                :loading="quizStore.isSubmitting"
                style="width: 100%;"
              >
                {{ quizStore.currentIndex === quizStore.questions.length - 1 ? '查看结果' : '下一题' }}
              </el-button>
            </div>
          </el-card>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/store'
import { ElMessage } from 'element-plus'
import { Timer } from '@element-plus/icons-vue'

const router = useRouter()
const quizStore = useQuizStore()

const timeLeft = ref(30)
let timer = null

const currentQuestion = computed(() => quizStore.currentQuestion)
const currentAnswer = computed(() => {
  return quizStore.answers[quizStore.answers.length - 1] || null
})

const options = computed(() => {
  if (!currentQuestion.value) return []
  return [
    { key: 'A', text: currentQuestion.value.optionA },
    { key: 'B', text: currentQuestion.value.optionB },
    { key: 'C', text: currentQuestion.value.optionC },
    { key: 'D', text: currentQuestion.value.optionD }
  ]
})

const getOptionClass = (key) => {
  if (!quizStore.currentAnswer) return ''
  if (key === quizStore.currentAnswer) {
    return currentAnswer.value?.isCorrect ? 'correct' : 'wrong'
  }
  if (currentAnswer.value && key === currentAnswer.value.correctAnswer) {
    return 'correct'
  }
  return ''
}

const startTimer = () => {
  timeLeft.value = quizStore.quizTime
  if (timer) clearInterval(timer)
  
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      handleTimeout()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const handleTimeout = async () => {
  stopTimer()
  if (!quizStore.currentAnswer) {
    try {
      await quizStore.submitAnswer('E')
      ElMessage.warning('时间到！')
    } catch (error) {
      console.error(error)
    }
  }
}

const handleSelect = async (answer) => {
  if (quizStore.currentAnswer || quizStore.isSubmitting) return
  
  stopTimer()
  try {
    await quizStore.submitAnswer(answer)
  } catch (error) {
    console.error(error)
  }
}

const handleNext = async () => {
  if (quizStore.currentIndex === quizStore.questions.length - 1) {
    try {
      await quizStore.finishQuiz()
      router.push('/result')
    } catch (error) {
      console.error(error)
    }
  } else {
    const hasNext = quizStore.nextQuestion()
    if (hasNext) {
      startTimer()
    }
  }
}

watch(() => quizStore.currentIndex, () => {
  startTimer()
})

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.quiz-page {
  padding-top: 20px;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: white;
}

.quiz-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-index {
  font-size: 18px;
  font-weight: 600;
}

.score-info {
  font-size: 16px;
}

.timer-container {
  margin-bottom: 20px;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
}

.timer-display span {
  transition: all 0.3s;
}

.timer-warning {
  color: #f59e0b !important;
}

.timer-danger {
  color: #ef4444 !important;
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.question-card {
  padding: 8px;
}

.question-text {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.6;
  margin-bottom: 24px;
  color: #1f2937;
}

.options {
  margin-bottom: 20px;
}

.answer-feedback {
  margin-top: 16px;
}

.explanation {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  line-height: 1.6;
  color: #4b5563;
}

.action-buttons {
  margin-top: 16px;
}
</style>
