<template>
  <div class="page-container">
    <div class="table-toolbar">
      <el-select v-model="filterTaskId" placeholder="按任务筛选" clearable style="width: 200px" @change="loadList">
        <el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" />
      </el-select>
      <el-button type="primary" @click="uploadDialogVisible = true"><el-icon><Upload /></el-icon>上传影像</el-button>
    </div>

    <div class="media-grid" v-loading="loading">
      <div class="media-item" v-for="item in mediaList" :key="item.id" @click="openPreview(item)">
        <div class="media-thumb">
          <el-image :src="item.thumbnailUrl || item.url" fit="cover" style="width: 100%; height: 100%" />
        </div>
        <div class="media-info">
          <div class="media-name" :title="item.fileName">{{ item.fileName }}</div>
          <div class="media-time">{{ item.captureTime || item.createdAt }}</div>
        </div>
      </div>
      <el-empty v-if="!loading && mediaList.length === 0" description="暂无影像数据" />
    </div>

    <el-pagination
      v-if="total > 0"
      style="margin-top: 16px; justify-content: flex-end"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadList"
    />

    <el-dialog v-model="uploadDialogVisible" title="上传影像" width="560px" destroy-on-close @close="resetUpload">
      <el-form label-width="80px" size="default">
        <el-form-item label="关联任务">
          <el-select v-model="uploadTaskId" placeholder="选择任务" style="width: 100%">
            <el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload ref="uploadRef" :auto-upload="false" :limit="1" :on-change="onFileChange" :on-remove="onFileRemove" accept="image/*,video/*">
            <el-button type="primary">选择文件</el-button>
            <template #tip><div class="upload-tip">支持图片/视频文件，大文件自动分片上传</div></template>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="uploadProgress > 0" label="上传进度">
          <el-progress :percentage="uploadProgress" :status="uploadStatus" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" :disabled="!selectedFile" @click="handleUpload">开始上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="影像预览" width="800px" destroy-on-close>
      <div class="preview-container">
        <img v-if="previewItem?.fileType === 'image'" :src="previewItem.url" style="max-width: 100%; max-height: 70vh" />
        <video v-else-if="previewItem?.fileType === 'video'" :src="previewItem.url" controls style="max-width: 100%; max-height: 70vh" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMediaList, initChunkUpload, uploadChunk, mergeChunks } from '../api/media'
import { getTaskList } from '../api/task'

const CHUNK_SIZE = 5 * 1024 * 1024

const loading = ref(false)
const mediaList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filterTaskId = ref('')
const taskList = ref([])

const uploadDialogVisible = ref(false)
const uploadTaskId = ref(null)
const selectedFile = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadRef = ref(null)

const previewVisible = ref(false)
const previewItem = ref(null)

async function loadList() {
  loading.value = true
  try {
    const res = await getMediaList({ page: page.value, pageSize: pageSize.value, taskId: filterTaskId.value })
    mediaList.value = res.data.list || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

async function loadTaskList() {
  try {
    const res = await getTaskList({ pageSize: 100 })
    taskList.value = res.data.list || res.data || []
  } catch {}
}

function onFileChange(file) {
  selectedFile.value = file.raw
}

function onFileRemove() {
  selectedFile.value = null
}

function resetUpload() {
  selectedFile.value = null
  uploadProgress.value = 0
  uploadStatus.value = ''
  uploadTaskId.value = null
}

async function computeMD5(file) {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('MD5', buffer).catch(async () => {
    let hash = 0
    const arr = new Uint8Array(buffer)
    for (let i = 0; i < arr.length; i++) {
      hash = ((hash << 5) - hash) + arr[i]
      hash |= 0
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  })
  if (typeof hashBuffer === 'string') return hashBuffer
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function handleUpload() {
  if (!selectedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  if (!uploadTaskId.value) {
    ElMessage.warning('请选择关联任务')
    return
  }
  uploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = ''
  try {
    const file = selectedFile.value
    const fileMD5 = await computeMD5(file)
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

    const initRes = await initChunkUpload({
      fileName: file.name,
      fileSize: file.size,
      fileMD5,
      totalChunks,
      taskId: uploadTaskId.value
    })
    const uploadId = initRes.data.uploadId

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)
      const formData = new FormData()
      formData.append('uploadId', uploadId)
      formData.append('chunkIndex', i)
      formData.append('chunk', chunk)

      await uploadChunk(formData, (progressEvent) => {
        const chunkProgress = ((i + progressEvent.loaded / progressEvent.total) / totalChunks) * 100
        uploadProgress.value = Math.min(Math.round(chunkProgress), 99)
      })
    }

    await mergeChunks({ uploadId, fileName: file.name, fileMD5, totalChunks, taskId: uploadTaskId.value })
    uploadProgress.value = 100
    uploadStatus.value = 'success'
    ElMessage.success('上传成功')
    setTimeout(() => {
      uploadDialogVisible.value = false
      resetUpload()
      loadList()
    }, 800)
  } catch {
    uploadStatus.value = 'exception'
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

function openPreview(item) {
  previewItem.value = item
  previewVisible.value = true
}

onMounted(() => {
  loadList()
  loadTaskList()
})
</script>

<style scoped>
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.media-item {
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;
  border: 1px solid #ebeef5;
}

.media-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.media-thumb {
  width: 100%;
  height: 150px;
  overflow: hidden;
  background: #f5f7fa;
}

.media-info {
  padding: 8px 10px;
}

.media-name {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.preview-container {
  text-align: center;
}
</style>
