<template>
  <div class="upload-page">
    <el-row :gutter="24">
      <el-col :span="16">
        <el-card class="upload-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#667eea"><Upload /></el-icon>
              <span>文件上传与转码</span>
            </div>
          </template>

          <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
            <el-form-item label="选择文件" prop="file">
              <el-upload
                class="upload-dragger"
                drag
                :auto-upload="false"
                :limit="1"
                :on-change="handleFileChange"
                :on-exceed="handleExceed"
                :file-list="fileList"
                accept="video/*,audio/*"
              >
                <el-icon class="el-icon--upload" :size="48"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  将媒体文件拖拽到此处，或<em>点击选择文件</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持视频和音频格式，单个文件大小不超过 2GB
                  </div>
                </template>
              </el-upload>
            </el-form-item>

            <el-form-item label="目标格式" prop="outputFormat">
              <el-select v-model="form.outputFormat" placeholder="请选择转码格式" style="width: 100%">
                <el-opt-group label="视频格式">
                  <el-option label="MP4 (H.264)" value="mp4" />
                  <el-option label="WebM (VP8)" value="webm" />
                  <el-option label="AVI" value="avi" />
                  <el-option label="MOV" value="mov" />
                  <el-option label="FLV" value="flv" />
                  <el-option label="MKV" value="mkv" />
                </el-opt-group>
                <el-opt-group label="音频格式">
                  <el-option label="MP3" value="mp3" />
                  <el-option label="WAV" value="wav" />
                  <el-option label="AAC" value="aac" />
                  <el-option label="OGG" value="ogg" />
                  <el-option label="FLAC" value="flac" />
                  <el-option label="M4A" value="m4a" />
                </el-opt-group>
              </el-select>
            </el-form-item>

            <el-form-item v-if="selectedFile">
              <el-alert type="info" :closable="false" show-icon>
                <template #title>
                  文件信息：{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
                </template>
              </el-alert>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="uploading"
                @click="handleSubmit"
                :disabled="!selectedFile"
              >
                <el-icon v-if="!uploading"><VideoPlay /></el-icon>
                {{ uploading ? '上传中...' : '开始上传并转码' }}
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card v-if="uploadResult" class="result-card">
          <el-result
            :icon="uploadResult.success ? 'success' : 'error'"
            :title="uploadResult.success ? '上传成功' : '上传失败'"
            :sub-title="uploadResult.message"
          >
            <template #extra v-if="uploadResult.success">
              <el-button type="primary" @click="goToProgress">查看转码进度</el-button>
              <el-button @click="goToTasks">查看任务列表</el-button>
            </template>
          </el-result>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#667eea"><InfoFilled /></el-icon>
              <span>使用说明</span>
            </div>
          </template>
          <el-steps direction="vertical" :active="4" finish-status="success" align-center>
            <el-step title="上传文件" description="选择要转码的音视频文件" />
            <el-step title="选择格式" description="选择需要转换的目标格式" />
            <el-step title="等待转码" description="系统自动处理，实时显示进度" />
            <el-step title="下载文件" description="转码完成后下载结果" />
          </el-steps>
        </el-card>

        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#67c23a"><Warning /></el-icon>
              <span>注意事项</span>
            </div>
          </template>
          <ul class="tips-list">
            <li>上传文件将自动进入转码队列</li>
            <li>转码进度可在任务列表页实时查看</li>
            <li>失败任务会自动重试（最多3次）</li>
            <li>请确保上传的文件格式有效</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload as UploadIcon, UploadFilled, VideoPlay, InfoFilled, Warning } from '@element-plus/icons-vue'
import { uploadFile } from '../api'

const router = useRouter()
const formRef = ref(null)
const fileList = ref([])
const selectedFile = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)

const form = reactive({
  outputFormat: ''
})

const rules = {
  outputFormat: [{ required: true, message: '请选择目标格式', trigger: 'change' }]
}

const formatOptions = [
  { label: 'MP4 (H.264)', value: 'mp4' },
  { label: 'WebM (VP8)', value: 'webm' },
  { label: 'AVI', value: 'avi' },
  { label: 'MOV', value: 'mov' },
  { label: 'FLV', value: 'flv' },
  { label: 'MKV', value: 'mkv' },
  { label: 'MP3', value: 'mp3' },
  { label: 'WAV', value: 'wav' },
  { label: 'AAC', value: 'aac' },
  { label: 'OGG', value: 'ogg' },
  { label: 'FLAC', value: 'flac' },
  { label: 'M4A', value: 'm4a' }
]

function handleFileChange(file) {
  selectedFile.value = file.raw
  fileList.value = [file]
  uploadResult.value = null
}

function handleExceed() {
  ElMessage.warning('只能上传一个文件，请先移除当前文件')
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return size.toFixed(2) + ' ' + units[i]
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()

  if (!selectedFile.value) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  uploading.value = true
  uploadResult.value = null

  try {
    const { data } = await uploadFile(selectedFile.value, form.outputFormat)
    uploadResult.value = { success: true, message: data.message, taskId: data.task_id }
    ElMessage.success(data.message)
  } catch (err) {
    const msg = err.response?.data?.error || err.message || '上传失败'
    uploadResult.value = { success: false, message: msg }
    ElMessage.error(msg)
  } finally {
    uploading.value = false
  }
}

function handleReset() {
  formRef.value?.resetFields()
  fileList.value = []
  selectedFile.value = null
  uploadResult.value = null
  form.outputFormat = ''
}

function goToProgress() {
  if (uploadResult.value?.taskId) {
    router.push(`/progress/${uploadResult.value.taskId}`)
  }
}

function goToTasks() {
  router.push('/tasks')
}
</script>

<style scoped>
.upload-page {
  max-width: 1400px;
  margin: 0 auto;
}
.upload-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}
.upload-dragger :deep(.el-upload-dragger) {
  padding: 40px 20px;
}
.result-card {
  margin-bottom: 20px;
}
.info-card {
  margin-bottom: 20px;
}
.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tips-list li {
  padding: 8px 0;
  color: #606266;
  border-bottom: 1px dashed #ebeef5;
  font-size: 13px;
}
.tips-list li:last-child {
  border-bottom: none;
}
.tips-list li::before {
  content: "• ";
  color: #67c23a;
}
</style>
