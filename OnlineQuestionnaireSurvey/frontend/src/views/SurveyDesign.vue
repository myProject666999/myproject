<template>
  <div class="design-page">
    <div class="design-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <el-input v-model="surveyTitle" placeholder="请输入问卷标题" style="width: 300px; margin-left: 20px" />
      </div>
      <div class="header-right">
        <el-button @click="handleSave" :icon="Check">保存</el-button>
        <el-button type="primary" @click="handleSaveAndPublish" :icon="Promotion">保存并发布</el-button>
      </div>
    </div>
    
    <div class="design-content">
      <div class="left-panel">
        <div class="panel-title">添加题目</div>
        <div class="question-types">
          <div v-for="type in questionTypes" :key="type.key" class="question-type-item" @click="addQuestion(type)">
            <el-icon :size="20"><component :is="type.icon" /></el-icon>
            <span>{{ type.label }}</span>
          </div>
        </div>
      </div>
      
      <div class="center-panel">
        <div class="survey-preview">
          <div class="survey-header-preview">
            <h2>{{ surveyTitle || '问卷标题' }}</h2>
            <p class="survey-desc">{{ survey.description || '问卷描述' }}</p>
          </div>
          
          <div class="questions-list" ref="questionsListRef">
            <div v-for="(question, index) in questions" :key="question.id || question.tempId" 
                 class="question-card"
                 :class="{ 'selected': selectedQuestionId === (question.id || question.tempId) }"
                 @click="selectQuestion(question)">
              <div class="question-header">
                <span class="question-number">Q{{ index + 1 }}</span>
                <span class="question-type-tag">{{ getQuestionTypeLabel(question.questionType) }}</span>
                <div class="question-actions">
                  <el-icon class="action-icon" @click.stop="moveUp(index)" :class="{ disabled: index === 0 }"><ArrowUp /></el-icon>
                  <el-icon class="action-icon" @click.stop="moveDown(index)" :class="{ disabled: index === questions.length - 1 }"><ArrowDown /></el-icon>
                  <el-icon class="action-icon delete" @click.stop="deleteQuestion(question)"><Delete /></el-icon>
                </div>
              </div>
              <div class="question-body">
                <div class="question-title-row">
                  <el-input v-model="question.title" placeholder="请输入题目标题" @input="handleQuestionChange" />
                  <el-tag v-if="question.required" type="danger" size="small">必填</el-tag>
                </div>
                <div class="question-options" v-if="hasOptions(question.questionType)">
                  <div v-for="(option, optIndex) in getOptions(question)" :key="optIndex" class="option-row">
                    <el-radio v-if="question.questionType === 'single'" disabled>{{ option.text }}</el-radio>
                    <el-checkbox v-if="question.questionType === 'multi'" disabled>{{ option.text }}</el-checkbox>
                    <el-input v-model="option.text" placeholder="选项内容" style="flex: 1; margin-left: 8px" />
                    <el-icon class="delete-option" @click="deleteOption(question, optIndex)"><Close /></el-icon>
                  </div>
                  <el-button type="primary" link @click="addOption(question)" :icon="Plus">添加选项</el-button>
                </div>
                <div class="question-score" v-if="question.questionType === 'score'">
                  <el-rate disabled />
                </div>
                <div class="question-input" v-if="question.questionType === 'input'">
                  <el-input placeholder="用户将在此填写答案" disabled />
                </div>
              </div>
            </div>
            <el-empty v-if="questions.length === 0" description="点击左侧题型添加题目" />
          </div>
        </div>
      </div>
      
      <div class="right-panel">
        <div class="panel-title">题目设置</div>
        <div v-if="selectedQuestion" class="question-settings">
          <el-form label-position="top">
            <el-form-item label="是否必填">
              <el-switch v-model="selectedQuestion.required" active-text="必填" inactive-text="选填" />
            </el-form-item>
            <el-form-item v-if="hasOptions(selectedQuestion.questionType)" label="选项">
              <div v-for="(option, idx) in getOptions(selectedQuestion)" :key="idx" class="setting-option">
                <el-input v-model="option.text" placeholder="选项内容" />
              </div>
            </el-form-item>
            <el-form-item v-if="selectedQuestion.questionType === 'score'" label="评分设置">
              <div class="score-settings">
                <span>最高分：</span>
                <el-input-number v-model="getScoreConfig(selectedQuestion).max" :min="1" :max="10" />
              </div>
            </el-form-item>
          </el-form>
        </div>
        <el-empty v-else description="请选择题目进行编辑" :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Check, Promotion, Delete, Plus, Close,
  ArrowUp, ArrowDown, Select, List, Edit, Star, DataLine, Calendar
} from '@element-plus/icons-vue'
import { getSurvey, updateSurvey, getQuestions, saveQuestions } from '@/api/survey'

const route = useRoute()
const router = useRouter()
const surveyId = computed(() => route.params.id)

const surveyTitle = ref('')
const survey = reactive({
  id: null,
  title: '',
  description: '',
  status: 0
})

const questions = ref([])
const selectedQuestionId = ref(null)
let tempIdCounter = 0

const questionTypes = [
  { key: 'single', label: '单选题', icon: 'Select' },
  { key: 'multi', label: '多选题', icon: 'List' },
  { key: 'input', label: '填空题', icon: 'Edit' },
  { key: 'score', label: '评分题', icon: 'Star' },
  { key: 'rating', label: '量表题', icon: 'DataLine' },
  { key: 'date', label: '日期题', icon: 'Calendar' }
]

const selectedQuestion = computed(() => {
  return questions.value.find(q => (q.id || q.tempId) === selectedQuestionId.value)
})

function getQuestionTypeLabel(type) {
  const map = { single: '单选题', multi: '多选题', input: '填空题', score: '评分题', rating: '量表题', date: '日期题' }
  return map[type] || type
}

function hasOptions(type) {
  return ['single', 'multi'].includes(type)
}

function getOptions(question) {
  if (!question.config) {
    question.config = { options: [] }
  }
  if (typeof question.config === 'string') {
    try { question.config = JSON.parse(question.config) } catch (e) { question.config = { options: [] } }
  }
  if (!question.config.options) question.config.options = []
  return question.config.options
}

function getScoreConfig(question) {
  if (!question.config) question.config = {}
  if (typeof question.config === 'string') {
    try { question.config = JSON.parse(question.config) } catch (e) { question.config = {} }
  }
  if (!question.config.max) question.config.max = 5
  return question.config
}

function addQuestion(type) {
  const newQuestion = {
    tempId: `temp_${++tempIdCounter}`,
    questionType: type.key,
    title: '',
    required: 1,
    sortOrder: questions.value.length + 1,
    config: type.key === 'single' || type.key === 'multi' 
      ? { options: [{ text: '选项1' }, { text: '选项2' }] } 
      : type.key === 'score' ? { max: 5 } : {}
  }
  questions.value.push(newQuestion)
  selectedQuestionId.value = newQuestion.tempId
}

function selectQuestion(question) {
  selectedQuestionId.value = question.id || question.tempId
}

function deleteQuestion(question) {
  ElMessageBox.confirm('确定要删除此题目吗？', '提示', {
    type: 'warning'
  }).then(() => {
    const index = questions.value.findIndex(q => (q.id || q.tempId) === (question.id || question.tempId))
    if (index > -1) {
      questions.value.splice(index, 1)
      if (selectedQuestionId.value === (question.id || question.tempId)) {
        selectedQuestionId.value = null
      }
    }
  }).catch(() => {})
}

function moveUp(index) {
  if (index > 0) {
    const temp = questions.value[index]
    questions.value[index] = questions.value[index - 1]
    questions.value[index - 1] = temp
    updateSortOrder()
  }
}

function moveDown(index) {
  if (index < questions.value.length - 1) {
    const temp = questions.value[index]
    questions.value[index] = questions.value[index + 1]
    questions.value[index + 1] = temp
    updateSortOrder()
  }
}

function updateSortOrder() {
  questions.value.forEach((q, i) => { q.sortOrder = i + 1 })
}

function addOption(question) {
  const options = getOptions(question)
  options.push({ text: `选项${options.length + 1}` })
}

function deleteOption(question, optIndex) {
  const options = getOptions(question)
  if (options.length > 1) {
    options.splice(optIndex, 1)
  } else {
    ElMessage.warning('至少保留一个选项')
  }
}

function handleQuestionChange() {
}

function goBack() {
  router.push('/surveys')
}

async function loadSurvey() {
  try {
    const res = await getSurvey(surveyId.value)
    survey.id = res.data.id
    survey.title = res.data.title
    survey.description = res.data.description
    surveyTitle.value = res.data.title
  } catch (e) {
  }
}

async function loadQuestions() {
  try {
    const res = await getQuestions(surveyId.value)
    questions.value = res.data || []
  } catch (e) {
  }
}

async function handleSave() {
  try {
    await updateSurvey(surveyId.value, {
      id: surveyId.value,
      title: surveyTitle.value,
      description: survey.description
    })
    const questionsToSave = questions.value.map((q, i) => ({
      ...q,
      sortOrder: i + 1
    }))
    await saveQuestions(surveyId.value, questionsToSave)
    ElMessage.success('保存成功')
  } catch (e) {
  }
}

async function handleSaveAndPublish() {
  await handleSave()
  ElMessage.success('已保存，可前往发布')
  router.push('/surveys')
}

onMounted(() => {
  loadSurvey()
  loadQuestions()
})
</script>

<style scoped lang="scss">
.design-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.design-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
.design-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.left-panel, .right-panel {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  padding: 16px;
  overflow-y: auto;
}
.right-panel {
  border-right: none;
  border-left: 1px solid #e4e7ed;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}
.question-types {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.question-type-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #ecf5ff;
    color: #409EFF;
  }
}
.center-panel {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f0f2f5;
}
.survey-preview {
  max-width: 720px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 32px;
}
.survey-header-preview {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;
  h2 {
    font-size: 24px;
    color: #303133;
    margin-bottom: 12px;
  }
  .survey-desc {
    color: #606266;
  }
}
.question-card {
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #409EFF;
  }
  &.selected {
    border-color: #409EFF;
    background: #ecf5ff;
  }
}
.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  .question-number {
    font-weight: 600;
    color: #409EFF;
  }
  .question-type-tag {
    font-size: 12px;
    color: #909399;
    background: #f4f4f5;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .question-actions {
    margin-left: auto;
    display: flex;
    gap: 8px;
    .action-icon {
      font-size: 16px;
      color: #909399;
      cursor: pointer;
      &:hover { color: #409EFF; }
      &.delete:hover { color: #f56c6c; }
      &.disabled { color: #dcdfe6; cursor: not-allowed; }
    }
  }
}
.question-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.question-options {
  .option-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    .delete-option {
      color: #909399;
      cursor: pointer;
      &:hover { color: #f56c6c; }
    }
  }
}
.question-settings {
  .setting-option {
    margin-bottom: 8px;
  }
  .score-settings {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
