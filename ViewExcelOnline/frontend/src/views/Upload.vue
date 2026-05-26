<template>
  <div class="upload-container">
    <div class="upload-card">
      <h1 class="title">Excel 在线查看器</h1>
      <p class="subtitle">无需 Office，在线查看 Excel 文件</p>
      
      <el-upload
        class="upload-dragger"
        drag
        :action="uploadUrl"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :show-file-list="false"
        accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将 Excel 文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .xlsx, .xls 格式文件
          </div>
        </template>
      </el-upload>

      <div v-if="uploading" class="uploading">
        <el-progress :percentage="50" :indeterminate="true" />
        <p>正在上传并解析文件...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const router = useRouter()
const uploading = ref(false)
const uploadUrl = '/api/upload'

const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel' ||
                  file.name.endsWith('.xlsx') ||
                  file.name.endsWith('.xls')
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  uploading.value = true
  return true
}

const handleSuccess = (response) => {
  uploading.value = false
  ElMessage.success('上传成功!')
  router.push(`/view/${response.id}`)
}

const handleError = () => {
  uploading.value = false
  ElMessage.error('上传失败，请重试')
}
</script>

<style scoped>
.upload-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.upload-card {
  background: white;
  padding: 60px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 500px;
  width: 90%;
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  margin-bottom: 40px;
  font-size: 14px;
}

.upload-dragger {
  width: 100%;
}

.uploading {
  margin-top: 20px;
}

.uploading p {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}
</style>
