<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">今日日记</h1>
      <p class="page-subtitle">{{ todayDate }} · 记录今天的心情和故事</p>
    </div>

    <el-form :model="form" ref="formRef" label-position="top">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="给今天的日记起个标题..."
          size="large"
        />
      </el-form-item>

      <el-form-item label="心情评分" prop="moodScore">
        <div class="mood-selector">
          <div
            v-for="score in 10"
            :key="score"
            class="mood-btn"
            :class="{ active: form.moodScore === score }"
            @click="form.moodScore = score"
          >
            {{ score }}
          </div>
          <span class="mood-label">{{ getMoodLabel(form.moodScore) }}</span>
        </div>
      </el-form-item>

      <el-form-item label="日记内容" prop="content">
        <div class="editor-wrapper">
          <Toolbar
            style="border-bottom: 1px solid #e4e7ed"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            mode="default"
          />
          <Editor
            v-model="form.content"
            style="height: 400px; overflow-y: hidden;"
            :defaultConfig="editorConfig"
            mode="default"
            @onCreated="handleCreated"
          />
        </div>
      </el-form-item>

      <div v-if="savedDiary" class="mood-analysis">
        <el-divider content-position="left">情绪分析</el-divider>
        <div class="analysis-content">
          <div class="mood-score-display">
            <div
              class="mood-score-badge"
              :class="getScoreClass(savedDiary.moodScore)"
            >
              {{ savedDiary.moodScore }}
            </div>
            <div class="score-info">
              <div class="score-title">综合情绪分</div>
              <div class="score-desc">{{ savedDiary.moodSummary }}</div>
            </div>
          </div>
          <div v-if="savedDiary.tags && savedDiary.tags.length > 0" class="tags-section">
            <div class="tags-title">提取的关键词：</div>
            <span
              v-for="tag in savedDiary.tags"
              :key="tag.id"
              class="mood-tag"
              :class="getTagClass(tag.category)"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>

      <el-form-item>
        <el-button type="primary" size="large" @click="handleSave" :loading="saving">
          <el-icon><Check /></el-icon>
          保存日记
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import dayjs from 'dayjs'
import { saveDiary, getTodayDiary } from '../api/diary'

const editorRef = shallowRef()
const formRef = ref()
const saving = ref(false)
const savedDiary = ref(null)

const todayDate = dayjs().format('YYYY年MM月DD日 dddd')

const form = reactive({
  id: null,
  title: '',
  content: '',
  moodScore: 5,
  diaryDate: dayjs().format('YYYY-MM-DD'),
  userId: 1
})

const toolbarConfig = {
  excludeKeys: []
}

const editorConfig = {
  placeholder: '开始记录今天的故事吧...',
  MENU_CONF: {}
}

const handleCreated = (editor) => {
  editorRef.value = editor
}

const getMoodLabel = (score) => {
  if (score >= 8) return '非常开心 😄'
  if (score >= 6) return '心情不错 🙂'
  if (score >= 4) return '一般般 😐'
  if (score >= 2) return '有点低落 😔'
  return '很不好 😢'
}

const getScoreClass = (score) => {
  if (score >= 7) return 'mood-score-high'
  if (score >= 4) return 'mood-score-medium'
  return 'mood-score-low'
}

const getTagClass = (category) => {
  switch (category) {
    case '积极': return 'positive'
    case '消极': return 'negative'
    default: return 'neutral'
  }
}

const loadTodayDiary = async () => {
  try {
    const res = await getTodayDiary(1)
    if (res.data.code === 200 && res.data.data) {
      const diary = res.data.data
      form.id = diary.id
      form.title = diary.title
      form.content = diary.content
      form.moodScore = diary.moodScore
      savedDiary.value = diary
    }
  } catch (e) {
    console.error(e)
  }
}

const handleSave = async () => {
  if (!form.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!form.content.trim()) {
    ElMessage.warning('请输入日记内容')
    return
  }

  saving.value = true
  try {
    const res = await saveDiary(form)
    if (res.data.code === 200) {
      ElMessage.success('保存成功！')
      savedDiary.value = res.data.data
      form.id = res.data.data.id
    } else {
      ElMessage.error(res.data.message || '保存失败')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadTodayDiary()
})
</script>

<style scoped>
.mood-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mood-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s;
  background: white;
}

.mood-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.mood-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  transform: scale(1.1);
}

.mood-label {
  margin-left: 16px;
  font-size: 14px;
  color: #606266;
}

.editor-wrapper {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.mood-analysis {
  margin-top: 20px;
}

.analysis-content {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.mood-score-display {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.score-info {
  flex: 1;
}

.score-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.score-desc {
  font-size: 14px;
  color: #606266;
}

.tags-section {
  margin-top: 16px;
}

.tags-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}
</style>
