<template>
  <div class="analysis-page">
    <div class="container">
      <div class="page-header">
        <h1>📖 答题解析</h1>
        <p>回顾你的答题过程</p>
      </div>

      <el-card class="card-shadow">
        <div v-if="!quizStore.answers.length" class="no-data">
          <el-empty description="暂无答题记录" />
          <el-button type="primary" @click="$router.push('/')">
            开始答题
          </el-button>
        </div>

        <div v-else class="analysis-list">
          <div 
            v-for="(answer, index) in quizStore.answers" 
            :key="answer.questionId"
            class="analysis-item"
          >
            <div class="item-header">
              <span class="item-number">第 {{ index + 1 }} 题</span>
              <el-tag 
                :type="answer.isCorrect ? 'success' : 'danger'"
                size="small"
              >
                {{ answer.isCorrect ? '正确' : '错误' }}
              </el-tag>
            </div>

            <h3 class="question-text">
              {{ getQuestionText(answer.questionId) }}
            </h3>

            <div class="options-review">
              <div 
                v-for="option in getOptions(answer.questionId)" 
                :key="option.key"
                class="option-review"
                :class="getOptionClass(option.key, answer)"
              >
                <span class="option-label">{{ option.key }}</span>
                <span class="option-text">{{ option.text }}</span>
                <span v-if="option.key === answer.userAnswer" class="your-answer">
                  (你的选择)
                </span>
              </div>
            </div>

            <div v-if="answer.explanation" class="explanation-box">
              <el-alert
                title="答案解析"
                :description="answer.explanation"
                type="info"
                :closable="false"
                show-icon
              />
            </div>
          </div>
        </div>

        <el-divider />

        <div class="action-buttons">
          <el-button type="primary" size="large" @click="$router.push('/result')">
            返回结果
          </el-button>
          <el-button size="large" @click="$router.push('/')">
            返回首页
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuizStore } from '@/store'

const quizStore = useQuizStore()

const questionMap = computed(() => {
  const map = {}
  quizStore.questions.forEach(q => {
    map[q.id] = q
  })
  return map
})

const getQuestionText = (questionId) => {
  return questionMap.value[questionId]?.questionText || '题目已删除'
}

const getOptions = (questionId) => {
  const question = questionMap.value[questionId]
  if (!question) return []
  return [
    { key: 'A', text: question.optionA },
    { key: 'B', text: question.optionB },
    { key: 'C', text: question.optionC },
    { key: 'D', text: question.optionD }
  ]
}

const getOptionClass = (key, answer) => {
  if (key === answer.correctAnswer) return 'correct'
  if (key === answer.userAnswer && key !== answer.correctAnswer) return 'wrong'
  return ''
}
</script>

<style scoped>
.analysis-page {
  padding-top: 40px;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-item {
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-number {
  font-weight: 600;
  color: #6b7280;
}

.question-text {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.options-review {
  margin-bottom: 16px;
}

.option-review {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.option-review.correct {
  border-color: #10b981;
  background: #d1fae5;
}

.option-review.wrong {
  border-color: #ef4444;
  background: #fee2e2;
}

.option-label {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.option-review.correct .option-label {
  background: #10b981;
}

.option-review.wrong .option-label {
  background: #ef4444;
}

.option-text {
  flex: 1;
}

.your-answer {
  font-size: 12px;
  color: #6b7280;
}

.explanation-box {
  margin-top: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-buttons .el-button {
  min-width: 140px;
}
</style>
