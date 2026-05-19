<template>
  <div class="paper-list">
    <div class="page-header">
      <h1 class="page-title">文献库</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showUploadDialog = true">
          <el-icon><Upload /></el-icon>
          上传PDF
        </el-button>
        <el-button @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          手动添加
        </el-button>
        <el-button 
          type="success" 
          :disabled="selectedPapers.length === 0"
          @click="exportSelected"
        >
          <el-icon><Download /></el-icon>
          导出BibTeX
        </el-button>
      </div>
    </div>

    <div class="card">
      <div class="search-bar">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索标题或作者..."
          style="width: 300px"
          clearable
          @input="loadPapers"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select 
          v-model="selectedTagId" 
          placeholder="选择标签筛选"
          clearable
          style="width: 200px"
          @change="loadPapers"
        >
          <el-option 
            v-for="tag in tags" 
            :key="tag.id" 
            :label="tag.name" 
            :value="tag.id"
          >
            <span :style="{ color: tag.color }">●</span>
            {{ tag.name }}
          </el-option>
        </el-select>
      </div>

      <el-table 
        :data="papers" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="标题" min-width="250">
          <template #default="{ row }">
            <el-link type="primary" @click="goToDetail(row.id)">
              {{ row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="authors" label="作者" min-width="180" />
        <el-table-column prop="publicationYear" label="年份" width="100" />
        <el-table-column prop="journal" label="期刊" min-width="150" />
        <el-table-column label="标签" min-width="200">
          <template #default="{ row }">
            <span 
              v-for="tag in row.tags" 
              :key="tag.id"
              class="tag-item"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="noteCount" label="笔记数" width="80" />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button size="small" @click="goToDetail(row.id)">
                查看
              </el-button>
              <el-button size="small" type="primary" @click="editPaper(row)">
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deletePaper(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadPapers"
        @current-change="loadPapers"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <el-dialog 
      v-model="showUploadDialog" 
      title="上传PDF"
      width="500px"
    >
      <el-upload
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="true"
        accept=".pdf"
        multiple
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将PDF文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持PDF文件，单个文件不超过50MB
          </div>
        </template>
      </el-upload>
      <div v-if="uploading" style="margin-top: 20px;">
        <el-progress :percentage="uploadProgress" />
      </div>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :disabled="pendingFiles.length === 0 || uploading"
          @click="uploadFiles"
        >
          开始上传
        </el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="showAddDialog" 
      title="添加文献"
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
              v-for="tag in tags" 
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
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="savePaper">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { paperApi, tagApi } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()

const loading = ref(false)
const papers = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const selectedTagId = ref(null)
const tags = ref([])
const selectedPapers = ref([])

const showUploadDialog = ref(false)
const showAddDialog = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const pendingFiles = ref([])
const editingPaper = ref(null)

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

const loadPapers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      sort: 'createdAt,desc'
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    if (selectedTagId.value) {
      params.tagId = selectedTagId.value
    }
    const res = await paperApi.getList(params)
    if (res.success) {
      papers.value = res.data.content
      total.value = res.data.totalElements
    }
  } catch (error) {
    ElMessage.error('加载论文列表失败')
  } finally {
    loading.value = false
  }
}

const loadTags = async () => {
  try {
    const res = await tagApi.getAll()
    if (res.success) {
      tags.value = res.data
    }
  } catch (error) {
    console.error('加载标签失败')
  }
}

const handleSelectionChange = (selection) => {
  selectedPapers.value = selection
}

const goToDetail = (id) => {
  router.push(`/paper/${id}`)
}

const handleFileChange = (file) => {
  if (file && file.raw) {
    pendingFiles.value.push(file.raw)
  }
}

const uploadFiles = async () => {
  if (pendingFiles.value.length === 0) return
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    for (let i = 0; i < pendingFiles.value.length; i++) {
      const file = pendingFiles.value[i]
      await paperApi.upload(file, (progressEvent) => {
        const totalProgress = (i / pendingFiles.value.length) * 100 +
          (progressEvent.loaded / progressEvent.total) * (100 / pendingFiles.value.length)
        uploadProgress.value = Math.round(totalProgress)
      })
    }
    ElMessage.success(`成功上传 ${pendingFiles.value.length} 个文件`)
    showUploadDialog.value = false
    pendingFiles.value = []
    loadPapers()
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const editPaper = (row) => {
  editingPaper.value = row
  paperForm.value = {
    title: row.title,
    authors: row.authors || '',
    publicationYear: row.publicationYear || null,
    journal: row.journal || '',
    volume: row.volume || '',
    issue: row.issue || '',
    pages: row.pages || '',
    doi: row.doi || '',
    keywords: row.keywords || '',
    abstractText: row.abstractText || '',
    tagIds: row.tags ? row.tags.map(t => t.id) : []
  }
  showAddDialog.value = true
}

const savePaper = async () => {
  if (!paperForm.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  
  try {
    if (editingPaper.value) {
      await paperApi.update(editingPaper.value.id, paperForm.value)
      ElMessage.success('更新成功')
    } else {
      await paperApi.create(paperForm.value)
      ElMessage.success('添加成功')
    }
    showAddDialog.value = false
    resetForm()
    loadPapers()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deletePaper = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除"${row.title}"吗？`, '确认删除', {
      type: 'warning'
    })
    await paperApi.delete(row.id)
    ElMessage.success('删除成功')
    loadPapers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const exportSelected = async () => {
  if (selectedPapers.value.length === 0) return
  
  try {
    const ids = selectedPapers.value.map(p => p.id)
    const blob = await paperApi.exportMultipleBibTeX(ids)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'references.bib'
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const resetForm = () => {
  editingPaper.value = null
  paperForm.value = {
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
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  loadTags()
  loadPapers()
})
</script>

<style scoped>
.paper-list {
  min-height: 100%;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>
