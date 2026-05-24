<template>
  <div class="submit-page" v-loading="loading">
    <el-card class="form-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#409EFF"><Edit /></el-icon>
          <span>提交投诉建议</span>
        </div>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入投诉/建议标题"
            maxlength="200"
            show-word-limit
            clearable
          />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="区域" prop="area">
          <el-input
            v-model="form.area"
            placeholder="请输入所在区域，例如：北京市朝阳区"
            clearable
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请详细描述您的投诉或建议内容"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input
            v-model="form.contactName"
            placeholder="请输入联系人姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="form.contactPhone"
            placeholder="请输入联系电话"
            clearable
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            v-model:file-list="fileList"
            :auto-upload="false"
            :limit="5"
            multiple
            drag
            action="#"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png/pdf 等格式，单个文件不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            提交
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCategories, submitComplaint } from '../api'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const categories = ref([])
const fileList = ref([])

const form = reactive({
  title: '',
  categoryId: null,
  area: '',
  content: '',
  contactName: '',
  contactPhone: ''
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 5, message: '内容至少 5 个字符', trigger: 'blur' }
  ]
}

const loadCategories = async () => {
  loading.value = true
  try {
    const data = await getCategories()
    if (Array.isArray(data)) {
      categories.value = data
    }
  } catch (e) {
    categories.value = [
      { id: 1, name: '环境卫生' },
      { id: 2, name: '设施维修' },
      { id: 3, name: '噪音扰民' },
      { id: 4, name: '安全隐患' },
      { id: 5, name: '其他' }
    ]
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('categoryId', form.categoryId)
      formData.append('area', form.area || '')
      formData.append('content', form.content)
      formData.append('contactName', form.contactName || '')
      formData.append('contactPhone', form.contactPhone || '')
      fileList.value.forEach((file) => {
        if (file.raw) {
          formData.append('files', file.raw)
        }
      })
      await submitComplaint(formData)
      ElMessage.success('提交成功')
      router.push('/my')
    } catch (e) {
      // error handled in interceptor
    } finally {
      submitting.value = false
    }
  })
}

const handleReset = () => {
  if (formRef.value) formRef.value.resetFields()
  fileList.value = []
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.submit-page {
  max-width: 780px;
  margin: 0 auto;
}

.form-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.el-upload {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
}
</style>
