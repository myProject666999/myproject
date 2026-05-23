<template>
  <div>
    <AppHeader />
    <div class="app-container">
      <div class="page-header">
        <div>
          <el-button text @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h1 class="page-title">添加新章节</h1>
        </div>
      </div>

      <el-card>
        <el-form 
          ref="chapterFormRef" 
          :model="chapterForm" 
          :rules="rules"
          label-width="100px"
          class="chapter-form"
        >
          <el-form-item label="章节序号" prop="chapterNumber">
            <el-input-number 
              v-model="chapterForm.chapterNumber" 
              :min="1"
              controls-position="right"
            />
          </el-form-item>

          <el-form-item label="章节标题" prop="title">
            <el-input 
              v-model="chapterForm.title" 
              placeholder="请输入章节标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="章节图片" prop="images">
            <el-upload
              :file-list="fileList"
              :before-upload="beforeImageUpload"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :auto-upload="false"
              list-type="picture-card"
              multiple
              accept="image/*"
              class="image-uploader"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">建议按照顺序上传漫画图片，支持拖拽排序</div>
          </el-form-item>

          <el-form-item label="发布状态" prop="status">
            <el-radio-group v-model="chapterForm.status">
              <el-radio value="published">立即发布</el-radio>
              <el-radio value="draft">保存为草稿</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
              提交
            </el-button>
            <el-button @click="$router.back()">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { chapterApi } from '@/api'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const comicId = route.params.id

const chapterForm = reactive({
  title: '',
  chapterNumber: 1,
  status: 'published'
})

const fileList = ref([])
const loading = ref(false)
const chapterFormRef = ref(null)

const rules = {
  title: [
    { required: true, message: '请输入章节标题', trigger: 'blur' }
  ],
  chapterNumber: [
    { required: true, message: '请输入章节序号', trigger: 'blur' }
  ],
  images: [
    {
      validator: (rule, value, callback) => {
        if (fileList.value.length === 0) {
          callback(new Error('请上传章节图片'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

onMounted(async () => {
  try {
    const res = await chapterApi.getList(comicId)
    const maxChapter = Math.max(...res.chapters.map(c => c.chapter_number), 0)
    chapterForm.chapterNumber = maxChapter + 1
  } catch (error) {
    console.error('获取章节列表失败', error)
  }
})

function beforeImageUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB')
  }
  return isImage && isLt10M
}

function handleFileChange(file, files) {
  fileList.value = files
}

function handleFileRemove(file, files) {
  fileList.value = files
}

async function handleSubmit() {
  if (!chapterFormRef.value) return
  
  try {
    await chapterFormRef.value.validate()
  } catch (error) {
    return
  }

  if (fileList.value.length === 0) {
    ElMessage.warning('请上传章节图片')
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('title', chapterForm.title)
    formData.append('chapterNumber', chapterForm.chapterNumber)
    formData.append('status', chapterForm.status)
    
    const sortedFiles = [...fileList.value].sort((a, b) => {
      if (a.raw?.lastModified && b.raw?.lastModified) {
        return a.raw.lastModified - b.raw.lastModified
      }
      return 0
    })
    
    sortedFiles.forEach(file => {
      formData.append('images', file.raw || file)
    })

    await chapterApi.create(comicId, formData)
    ElMessage.success('章节创建成功')
    router.back()
  } catch (error) {
    console.error('提交失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.chapter-form {
  max-width: 800px;
  margin: 0 auto;
}

.image-uploader :deep(.el-upload--picture-card) {
  width: 150px;
  height: 150px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
