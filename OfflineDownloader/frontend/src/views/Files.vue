<template>
  <div class="files-page">
    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total_files || 0 }}</div>
              <div class="stat-label">总文件数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon video">
              <el-icon><VideoCamera /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.video_count || 0 }}</div>
              <div class="stat-label">视频文件</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon audio">
              <el-icon><Headset /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.audio_count || 0 }}</div>
              <div class="stat-label">音频文件</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon size">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatSize(statistics.total_size || 0) }}</div>
              <div class="stat-label">总大小</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="file-list-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>文件库</span>
            <el-radio-group v-model="currentType" size="small" @change="loadFiles">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="video">视频</el-radio-button>
              <el-radio-button label="audio">音频</el-radio-button>
              <el-radio-button label="image">图片</el-radio-button>
            </el-radio-group>
          </div>
          <div class="header-right">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文件名"
              size="small"
              clearable
              style="width: 200px"
              @keyup.enter="loadFiles"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button size="small" @click="handleScan">
              <el-icon><RefreshRight /></el-icon>
              扫描目录
            </el-button>
            <el-button size="small" @click="loadFiles">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="file-list">
        <div v-if="files.length === 0" class="empty-state">
          <el-empty description="暂无文件" />
        </div>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="file in files" :key="file.id">
            <div class="file-item">
              <div class="file-thumbnail" @click="handlePreview(file)">
                <div v-if="file.is_video" class="thumbnail-placeholder video">
                  <el-icon><VideoCamera /></el-icon>
                </div>
                <div v-else-if="file.is_audio" class="thumbnail-placeholder audio">
                  <el-icon><Headset /></el-icon>
                </div>
                <div v-else-if="file.is_image" class="thumbnail-placeholder image">
                  <el-icon><Picture /></el-icon>
                </div>
                <div v-else class="thumbnail-placeholder">
                  <el-icon><Document /></el-icon>
                </div>
                <div v-if="file.is_video || file.is_audio" class="play-overlay">
                  <el-icon class="play-icon"><VideoPlay /></el-icon>
                </div>
              </div>
              <div class="file-info">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  <span>{{ formatSize(file.size) }}</span>
                </div>
              </div>
              <div class="file-actions">
                <el-button size="small" text @click="handlePreview(file)">
                  <el-icon><View /></el-icon>
                  预览
                </el-button>
                <el-button size="small" text @click="handleDownload(file)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-dropdown @command="(cmd) => handleFileAction(cmd, file)">
                  <el-button size="small" text>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="delete">
                        <el-icon><Delete /></el-icon>
                        删除记录
                      </el-dropdown-item>
                      <el-dropdown-item command="deleteWithFile">
                        <el-icon><Delete /></el-icon>
                        删除文件
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadFiles"
          @current-change="loadFiles"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="previewVisible"
      :title="previewFile?.name"
      width="80%"
      top="5vh"
      destroy-on-close
    >
      <div v-if="previewFile" class="preview-content">
        <video
          v-if="previewFile.is_video"
          :src="getPlayUrl(previewFile.id)"
          controls
          autoplay
          style="width: 100%; max-height: 70vh"
        />
        <audio
          v-else-if="previewFile.is_audio"
          :src="getPlayUrl(previewFile.id)"
          controls
          autoplay
          style="width: 100%"
        />
        <img
          v-else-if="previewFile.is_image"
          :src="getPlayUrl(previewFile.id)"
          style="max-width: 100%; max-height: 70vh; display: block; margin: 0 auto"
        />
        <div v-else class="no-preview">
          <el-empty description="该文件类型不支持预览" />
          <el-button type="primary" @click="handleDownload(previewFile)">
            <el-icon><Download /></el-icon>
            下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFileList, getFileStatistics, deleteFile, scanDirectory, getPlayUrl, getDownloadUrl } from '@/api/file'

const loading = ref(false)
const files = ref([])
const statistics = ref({})
const currentType = ref('')
const searchKeyword = ref('')
const pagination = ref({
  page: 1,
  pageSize: 24,
  total: 0
})

const previewVisible = ref(false)
const previewFile = ref(null)

const loadStatistics = async () => {
  try {
    const result = await getFileStatistics()
    statistics.value = result
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
}

const loadFiles = async () => {
  loading.value = true
  try {
    const result = await getFileList(currentType.value, searchKeyword.value, pagination.value.page, pagination.value.pageSize)
    files.value = result.list
    pagination.value.total = result.total
  } catch (error) {
    console.error('Failed to load files:', error)
  } finally {
    loading.value = false
  }
}

const handlePreview = (file) => {
  if (file.is_video || file.is_audio || file.is_image) {
    previewFile.value = file
    previewVisible.value = true
  } else {
    ElMessage.info('该文件类型不支持预览，请下载后查看')
  }
}

const handleDownload = (file) => {
  const url = getDownloadUrl(file.id)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('开始下载')
}

const handleFileAction = async (action, file) => {
  try {
    switch (action) {
      case 'delete':
        await ElMessageBox.confirm('确定要删除此文件记录吗？文件将保留在磁盘上。', '确认删除', {
          type: 'warning'
        })
        await deleteFile(file.id, false)
        ElMessage.success('记录已删除')
        break
      case 'deleteWithFile':
        await ElMessageBox.confirm('确定要删除此文件吗？此操作将从磁盘上删除文件，不可恢复！', '确认删除', {
          type: 'warning'
        })
        await deleteFile(file.id, true)
        ElMessage.success('文件已删除')
        break
    }
    loadFiles()
    loadStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Action failed:', error)
    }
  }
}

const handleScan = async () => {
  try {
    await scanDirectory()
    ElMessage.success('扫描已启动，请稍后刷新查看')
    setTimeout(() => {
      loadFiles()
      loadStatistics()
    }, 2000)
  } catch (error) {
    console.error('Failed to scan:', error)
  }
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

onMounted(() => {
  loadStatistics()
  loadFiles()
})
</script>

<style scoped>
.files-page {
  max-width: 1600px;
  margin: 0 auto;
}

.stats-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.video {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.audio {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.size {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.file-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.file-list {
  min-height: 300px;
}

.empty-state {
  padding: 60px 0;
}

.file-item {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.file-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.file-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: #f5f7fa;
  cursor: pointer;
  overflow: hidden;
}

.thumbnail-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #c0c4cc;
}

.thumbnail-placeholder.video {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #e6a23c;
}

.thumbnail-placeholder.audio {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #409eff;
}

.thumbnail-placeholder.image {
  background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
  color: #67c23a;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.file-thumbnail:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 56px;
  color: white;
}

.file-info {
  padding: 12px;
}

.file-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.file-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.file-actions {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  border-top: 1px solid #ebeef5;
}

.preview-content {
  text-align: center;
}

.no-preview {
  padding: 40px 0;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
