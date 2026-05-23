<template>
  <div class="fill-page">
    <div class="fill-container">
      <div v-if="loading" class="loading-state">
        <el-icon :size="48" class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <el-result icon="error" :title="errorTitle" :sub-title="errorMessage">
          <template #extra>
            <el-button type="primary" @click="goHome">返回首页</el-button>
          </template>
        </el-result>
      </div>
      
      <div v-else-if="submitted" class="success-state">
        <el-result icon="success" title="提交成功" sub-title="感谢您的参与！">
          <template #extra>
            <el-button type="primary" @click="goHome">返回首页</el-button>
          </template>
        </el-result>
      </div>
      
      <div v-else class="survey-content">
        <div class="survey-header">
          <h1>{{ survey.title }}</h1>
          <p v-if="survey.description" class="survey-desc">{{ survey.description }}</p>
          <div class="survey-meta">
            <el-tag type="info">已收集 {{ survey.responseCount }} 份答卷</el-tag>
          </div>
        </div>
        
        <el-form ref="formRef" :model="answerForm" :rules="formRules" label-position="top">
          <div v-for="(question, index) in questions" :key="question.id" class="question-section">
            <div class="question-title">
              <span class="question-number">{{ index + 1 }}.</span>
              <span>{{ question.title }}</span>
              <span v-if="question.required" class="required-mark">*</span>
            </div>
            
            <div v-if="question.description" class="question-desc">{{ question.description }}</div>
            
            <el-form-item :prop="`answers.${question.id}`" :rules="question.required ? [{ required: true, message: '请回答此问题', trigger: 'change' }] : []">
              <div class="answer-area">
                <el-radio-group v-if="question.questionType === 'single'" v-model="answerForm.answers[question.id]">
                  <el-radio v-for="opt in getOptions(question)" :key="opt.id || opt.text" :value="opt.text" :label="opt.text">
                    {{ opt.text }}
                  </el-radio>
                </el-radio-group>
                
                <el-checkbox-group v-if="question.questionType === 'multi'" v-model="answerForm.answers[question.id]">
                  <el-checkbox v-for="opt in getOptions(question)" :key="opt.id || opt.text" :value="opt.text" :label="opt.text">
                    {{ opt.text }}
                  </el-checkbox>
                </el-checkbox-group>
                
                <el-input v-if="question.questionType === 'input'" 
                         v-model="answerForm.answers[question.id]" 
                         type="textarea" 
                         :rows="3"
                         :placeholder="getInputPlaceholder(question)" />
                
                <div v-if="question.questionType === 'score'" class="score-answer">
                  <el-rate v-model="answerForm.answers[question.id]" 
                           :max="getScoreMax(question)" 
                           show-text 
                           :texts="['1分', '2分', '3分', '4分', '5分']" />
                </div>
                
                <div v-if="question.questionType === 'rating'" class="rating-answer">
                  <el-slider v-model="answerForm.answers[question.id]" 
                             :min="0" 
                             :max="10" 
                             show-input 
                             :marks="{ 0: '0', 5: '5', 10: '10' }" />
                </div>
                
                <el-date-picker v-if="question.questionType === 'date'"
                               v-model="answerForm.answers[question.id]"
                               type="date"
                               placeholder="选择日期"
                               style="width: 100%" />
              </div>
            </el-form-item>
          </div>
        </el-form>
        
        <div class="submit-section">
          <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit" :icon="Check">
            提交问卷
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, Check } from '@element-plus/icons-vue'
import { getPublishedSurvey, getQuestions } from '@/api/survey'
import { submitAnswer } from '@/api/answer'

const route = useRoute()
const router = useRouter()
const surveyId = computed(() => route.params.id)

const loading = ref(true)
const submitting = ref(false)
const submitted = ref(false)
const error = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')

const survey = ref({})
const questions = ref([])
const formRef = ref(null)

const answerForm = reactive({
  answers: {}
})

const formRules = {}

function getOptions(question) {
  if (!question.config) return []
  let config = question.config
  if (typeof config === 'string') {
    try { config = JSON.parse(config) } catch (e) { return [] }
  }
  return config.options || []
}

function getInputPlaceholder(question) {
  let config = question.config
  if (typeof config === 'string') {
    try { config = JSON.parse(config) } catch (e) { config = {} }
  }
  return config?.placeholder || '请输入您的答案'
}

function getScoreMax(question) {
  let config = question.config
  if (typeof config === 'string') {
    try { config = JSON.parse(config) } catch (e) { config = {} }
  }
  return config?.max || 5
}

async function loadSurvey() {
  try {
    const [surveyRes, questionsRes] = await Promise.all([
      getPublishedSurvey(surveyId.value),
      getQuestions(surveyId.value)
    ])
    survey.value = surveyRes.data
    questions.value = questionsRes.data || []
    
    questions.value.forEach(q => {
      if (q.questionType === 'multi') {
        answerForm.answers[q.id] = []
      } else if (q.questionType === 'score') {
        answerForm.answers[q.id] = null
      } else if (q.questionType === 'rating') {
        answerForm.answers[q.id] = 5
      } else {
        answerForm.answers[q.id] = ''
      }
    })
  } catch (e) {
    error.value = true
    errorTitle.value = '加载失败'
    errorMessage.value = e.response?.data?.message || '问卷不存在或已被删除'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        const answers = []
        questions.value.forEach(q => {
          answers.push({
            questionId: q.id,
            questionType: q.questionType,
            answerContent: answerForm.answers[q.id]
          })
        })
        await submitAnswer({
          surveyId: surveyId.value,
          deviceId: generateDeviceId(),
          answers
        })
        submitted.value = true
      } catch (e) {
      } finally {
        submitting.value = false
      }
    }
  })
}

function generateDeviceId() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('fingerprint', 2, 2)
  return canvas.toDataURL().slice(-50)
}

function goHome() {
  router.push('/login')
}

onMounted(loadSurvey)
</script>

<style scoped lang="scss">
.fill-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
  padding: 40px 20px;
}
.fill-container {
  max-width: 720px;
  margin: 0 auto;
}
.loading-state, .error-state, .success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.loading-state {
  color: #909399;
  gap: 16px;
}
.survey-content {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.survey-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;
  h1 {
    font-size: 28px;
    color: #303133;
    margin-bottom: 12px;
  }
  .survey-desc {
    color: #606266;
    margin-bottom: 16px;
  }
}
.question-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}
.question-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 12px;
  .question-number {
    font-weight: 600;
    color: #409EFF;
  }
  .required-mark {
    color: #f56c6c;
    margin-left: 4px;
  }
}
.question-desc {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
}
.answer-area {
  padding-left: 8px;
}
.score-answer, .rating-answer {
  padding: 16px 0;
}
.submit-section {
  text-align: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 2px solid #f0f2f5;
}
</style>
