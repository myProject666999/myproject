<template>
  <div>
    <AppHeader />
    <div class="app-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? '编辑作品' : '创建新作品' }}</h1>
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>

      <el-card>
        <el-form 
          ref="comicFormRef" 
          :model="comicForm" 
          :rules="rules"
          label-width="100px"
          class="comic-form"
        >
          <el-form-item label="封面" prop="cover">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeCoverUpload"
              :http-request="handleCoverUpload"
              accept="image/*"
              class="cover-uploader"
            >
              <div v-if="comicForm.cover" class="cover-preview">
                <img :src="comicForm.cover" alt="封面" />
              </div>
              <div v-else class="cover-placeholder">
                <el-icon :size="48"><Plus /></el-icon>
                <p>上传封面</p>
                <p class="upload-tip">建议尺寸 600×800，不超过 5MB</p>
              </div>
            </el-upload>
          </el-form-item>
          
          <el-form-item label="作品标题" prop="title">
            <el-input 
              v-model="comicForm.title" 
              placeholder="请输入作品标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="分类" prop="category">
            <el-select v-model="comicForm.category" placeholder="请选择分类" style="width: 100%">
              <el-option label="热血" value="热血" />
              <el-option label="日常" value="日常" />
              <el-option label="校园" value="校园" />
              <el-option label="奇幻" value="奇幻" />
              <el-option label="悬疑" value="悬疑" />
              <el-option label="科幻" value="科幻" />
              <el-option label="恋爱" value="恋爱" />
            </el-select>
          </el-form-item>

          <el-form-item label="简介" prop="description">
            <el-input
              v-model="comicForm.description"
              type="textarea"
              :rows="5"
              placeholder="请输入作品简介"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item v-if="isEdit" label="状态" prop="status">
            <el-select v-model="comicForm.status" placeholder="请选择状态">
              <el-option label="连载中" value="ongoing" />
              <el-option label="已完结" value="completed" />
              <el-option label="暂停更新" value="hiatus" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
              {{ isEdit ? '保存修改' : '创建作品' }}
            </el-button>
            <el-button @click="$router.back()">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { comicApi } from '@/api'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const comicId = route.params.id
const isEdit = computed(() => !!comicId)

const comicForm = reactive({
  title: '',
  description: '',
  category: '',
  status: 'ongoing',
  cover: ''
})

const loading = ref(false)
const comicFormRef = ref(null)

const rules = {
  title: [
    { required: true, message: '请输入作品标题', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入作品简介', trigger: 'blur' }
  ]
}

onMounted(() => {
  if (isEdit.value) {
    fetchComicDetail()
  }
})

async function fetchComicDetail() {
  try {
    const res = await comicApi.getDetail(comicId)
    const comic = res.comic
    comicForm.title = comic.title
    comicForm.description = comic.description
    comicForm.category = comic.category
    comicForm.status = comic.status
    comicForm.cover = comic.cover
  } catch (error) {
    console.error('获取作品详情失败', error)
  }
}

function beforeCoverUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
  }
  return isImage && isLt5M
}

function handleCoverUpload(options) {
  comicForm.cover = URL.createObjectURL(options.file)
  comicForm._coverFile = options.file
}

async function handleSubmit() {
  if (!comicFormRef.value) return
  
  try {
    await comicFormRef.value.validate()
  } catch (error) {
    return
  }

  if (!comicForm.cover && !isEdit.value) {
    ElMessage.warning('请上传封面')
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('title', comicForm.title)
    formData.append('description', comicForm.description)
    formData.append('category', comicForm.category)
    if (isEdit.value) {
      formData.append('status', comicForm.status)
    }
    if (comicForm._coverFile) {
      formData.append('cover', comicForm._coverFile)
    }

    if (isEdit.value) {
      await comicApi.update(comicId, formData)
      ElMessage.success('更新成功')
    } else {
      const res = await comicApi.create(formData)
      ElMessage.success('创建成功')
      router.push(`/author/comic/${res.comicId}/chapters`)
      return
    }
    router.back()
  } catch (error) {
    console.error('提交失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.comic-form {
  max-width: 800px;
  margin: 0 auto;
}

.cover-uploader {
  width: 200px;
  height: 266px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  gap: 8px;
}

.upload-tip {
  font-size: 12px;
}
</style>
