<template>
  <div class="paper-detail">
    <div class="page-header">
      <div>
        <el-button @click="goBack" style="margin-right: 15px;">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title" style="display: inline;">论文详情</h1>
      </div>
      <div class="header-actions">
        <el-button @click="exportBibTeX">
          <el-icon><Download /></el-icon>
          导出BibTeX
        </el-button>
        <el-button type="primary" @click="showEditDialog = true">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </div>
    </div>

    <div v-if="paper" class="detail-content">
      <div class="card">
        <h2 class="paper-title">{{ paper.title }}</h2>
        <div class="paper-meta">
          <span v-if="paper.authors" class="meta-item">
            <el-icon><User /></el-icon>
            {{ paper.authors }}
          </span>
          <span v-if="paper.publicationYear" class="meta-item">
            <el-icon><Calendar /></el-icon>
            {{ paper.publicationYear }}
          </span>
          <span v-if="paper.journal" class="meta-item">
            <el-icon><Reading /></el-icon>
            {{ paper.journal }}
            <span v-if="paper.volume">(Vol. {{ paper.volume }})</span>
          </span>
          <span v-if="paper.doi" class="meta-item">
            <el-icon><Link /></el-icon>
            {{ paper.doi }}
          </span>
        </div>
        <div v-if="paper.tags && paper.tags.length > 0" class="paper-tags">
          <span 
            v-for="tag in paper.tags" 
            :key="tag.id"
            class="tag-item"
            :style="{ backgroundColor: tag.color }"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <div class="card" style="margin-top: 20px;">
        <h3 class="section-title">摘要</h3>
        <p v-if="paper.abstractText" class="abstract-text">
          {{ paper.abstractText }}
        </p>
        <p v-else class="empty-text">暂无摘要</p>
      </div>

      <div v-if="paper.keywords" class="card" style="margin-top: 20px;">
        <h3 class="section-title">关键词</h3>
        <p>{{ paper.keywords }}</p>
      </div>

      <div class="card" style="margin-top: 20px;">
        <div class="notes-header">
          <h3 class="section-title" style="margin: 0;">笔记 ({{ paper.notes ? paper.notes.length : 0 }})</h3>
          <el-button type="primary" size="small" @click="showAddNoteDialog = true">
            <el-icon><Plus /></el-icon>
            添加笔记
          </el-button>
        </div>
        
        <div v-if="paper.notes && paper.notes.length > 0" class="notes-list">
          <div 
            v-for="note in paper.notes" 
            :key="note.id"
            class="note-item"
          >
            <div class="note-header">
              <h4 class="note-title">{{ note.title || '无标题笔记' }}</h4>
              <div class="note-actions">
                <el-button size="small" @click="editNote(note)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button size="small" type="danger" @click="deleteNote(note)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <p class="note-content">{{ note.content }}</p>
            <div class="note-meta">
              <span v-if="note.pageNumber">第 {{ note.pageNumber }} 页</span>
              <span>{{ formatDate(note.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <el-empty description="暂无笔记，点击上方按钮添加第一条笔记" />
        </div>
      </div>

      <div class="card" style="margin-top: 20px;">
        <h3 class="section-title">文件信息</h3>
        <div class="file-info">
          <div class="info-item">
            <span class="info-label">文件名：</span>
            <span class="info-value">{{ paper.fileName || '未上传文件' }}</span>
          </div>
          <div class="info-item" v-if="paper.fileSize">
            <span class="info-label">文件大小：</span>
            <span class="info-value">{{ formatFileSize(paper.fileSize) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ formatDate(paper.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">更新时间：</span>
            <span class="info-value">{{ formatDate(paper.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog 
      v-model="showEditDialog" 
      title="编辑论文"
      width="700px"
    >
      <el-form :model="paperForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="paperForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="paperForm.authors" placeholder="多个作者用逗号分隔" />
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number v-model="paperForm.publicationYear" :min="1900" :max="2100" />
        </el-form-item>
        <el-form-item label="期刊">
          <el-input v-model="paperForm.journal" placeholder="请输入期刊名称" />
        </el-form-item>
        <el-form-item label="卷/期">
          <el-input v-model="paperForm.volume" placeholder="卷" style="width: 45%;" />
          <el-input v-model="paperForm.issue" placeholder="期" style="width: 45%; margin-left: 10px;" />
        </el-form-item>
        <el-form-item label="页码">
          <el-input v-model="paperForm.pages" placeholder="如: 123-145" />
        </el-form-item>
        <el-form-item label="DOI">
          <el-input v-model="paperForm.doi" placeholder="请输入DOI" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="paperForm.keywords" placeholder="多个关键词用逗号分隔" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input 
            v-model="paperForm.abstractText" 
            type="textarea" 
            :rows="4"
            placeholder="请输入摘要"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-select 
            v-model="paperForm.tagIds" 
            multiple 
            placeholder="选择标签"
            style="width: 100%"
          >
            <el-option 
              v-for="tag in allTags" 
              :key="tag.id" 
              :label="tag.name" 
              :value="tag.id"
            >
              <span :style="{ color: tag.color }">●</span>
              {{ tag.name }}
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="savePaper">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="showAddNoteDialog" 
      :title="editingNote ? '编辑笔记' : '添加笔记'"
      width="600px"
    >
      <el-form :model="noteForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="noteForm.title" placeholder="笔记标题（可选）" />
        </el-form-item>
        <el-form-item label="页码">
          <el-input-number v-model="noteForm.pageNumber" :min="1" placeholder="页码" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input 
            v-model="noteForm.content" 
            type="textarea" 
            :rows="6"
            placeholder="请输入笔记内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeNoteDialog">取消</el-button>
        <el-button type="primary" @click="saveNote">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { paperApi, tagApi, noteApi } from '@/api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const paperId = route.params.id
const paper = ref(null)
const allTags = ref([])

const showEditDialog = ref(false)
const showAddNoteDialog = ref(false)
const editingNote = ref(null)

const paperForm = ref({
  title: '',
  authors: '',
  publicationYear: null,
  journal: '',
  volume: '',
  issue: '',
  pages: '',
  doi: '',
  keywords: '',
  abstractText: '',
  tagIds: []
})

const noteForm = ref({
  title: '',
  content: '',
  pageNumber: null
})

const loadPaper = async () => {
  try {
    const res = await paperApi.getDetail(paperId)
    if (res.success) {
      paper.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载论文详情失败')
  }
}

const loadTags = async () => {
  try {
    const res = await tagApi.getAll()
    if (res.success) {
      allTags.value = res.data
    }
  } catch (error) {
    console.error('加载标签失败')
  }
}

const goBack = () => {
  router.back()
}

const exportBibTeX = async () => {
  try {
    const blob = await paperApi.exportBibTeX(paperId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${paper.value.title.replace(/[^a-zA-Z0-9]/g, '_')}.bib`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const savePaper = async () => {
  if (!paperForm.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  
  try {
    await paperApi.update(paperId, paperForm.value)
    ElMessage.success('更新成功')
    showEditDialog.value = false
    loadPaper()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const editNote = (note) => {
  editingNote.value = note
  noteForm.value = {
    title: note.title || '',
    content: note.content,
    pageNumber: note.pageNumber || null
  }
  showAddNoteDialog.value = true
}

const saveNote = async () => {
  if (!noteForm.value.content) {
    ElMessage.warning('请输入笔记内容')
    return
  }
  
  try {
    if (editingNote.value) {
      await noteApi.update(editingNote.value.id, {
        ...noteForm.value,
        paperId: paperId
      })
      ElMessage.success('更新成功')
    } else {
      await noteApi.create({
        ...noteForm.value,
        paperId: paperId
      })
      ElMessage.success('添加成功')
    }
    closeNoteDialog()
    loadPaper()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteNote = async (note) => {
  try {
    await ElMessageBox.confirm('确定要删除这条笔记吗？', '确认删除', {
      type: 'warning'
    })
    await noteApi.delete(note.id)
    ElMessage.success('删除成功')
    loadPaper()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const closeNoteDialog = () => {
  showAddNoteDialog.value = false
  editingNote.value = null
  noteForm.value = {
    title: '',
    content: '',
    pageNumber: null
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

onMounted(() => {
  loadTags()
  loadPaper()
})
</script>

<style scoped>
.paper-detail {
  min-height: 100%;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.paper-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.paper-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
}

.paper-tags {
  margin-top: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.abstract-text {
  line-height: 1.8;
  color: #606266;
  text-align: justify;
}

.empty-text {
  color: #909399;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-title {
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.note-actions {
  display: flex;
  gap: 8px;
}

.note-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.note-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
}

.info-label {
  color: #606266;
  min-width: 80px;
}

.info-value {
  color: #303133;
}
</style>
