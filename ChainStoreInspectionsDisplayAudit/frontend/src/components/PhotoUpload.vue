<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Camera, MapPin, Clock, Trash2, ZoomIn, X } from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { uploadPhoto } from '@/api/photo'
import type { UploadProps, UploadUserFile } from 'element-plus'
import type { Photo } from '@/types/models'

interface PhotoUploadFile extends UploadUserFile {
  response?: Photo
}

interface Props {
  modelValue?: Photo[]
  maxCount?: number
  type?: 'inspection' | 'issue' | 'rectification'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  maxCount: 9,
  type: 'inspection',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [photos: Photo[]]
}>()

const fileList = ref<PhotoUploadFile[]>([])
const uploadLoading = ref(false)
const previewVisible = ref(false)
const previewImage = ref('')
const currentLocation = ref('')
const currentTime = ref('')

onMounted(() => {
  initMockLocation()
  initFileList()
})

function initFileList() {
  fileList.value = props.modelValue.map(photo => ({
    name: `photo_${photo.id}.jpg`,
    url: photo.url,
    status: 'success' as const,
    response: photo
  }))
  updateCurrentTime()
}

function initMockLocation() {
  const mockLocations = [
    '北京市朝阳区建国路88号',
    '上海市浦东新区陆家嘴环路1000号',
    '广州市天河区天河路385号',
    '深圳市南山区科技园',
    '杭州市西湖区文三路'
  ]
  currentLocation.value = mockLocations[Math.floor(Math.random() * mockLocations.length)]
}

function updateCurrentTime() {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

const httpRequest: UploadProps['httpRequest'] = async (options) => {
  const { file, onSuccess, onError } = options
  uploadLoading.value = true
  updateCurrentTime()

  try {
    const formData = new FormData()
    formData.append('file', file as File)
    formData.append('type', props.type)
    formData.append('location', currentLocation.value)
    formData.append('shotTime', currentTime.value)

    const response = await uploadPhoto(formData)
    if (response.code === 0) {
      const newPhoto = response.data
      const newModelValue = [...props.modelValue, newPhoto]
      emit('update:modelValue', newModelValue)
      onSuccess?.(newPhoto)
      ElMessage.success('照片上传成功')
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    ElMessage.error('照片上传失败，请重试')
    onError?.(error as any)
  } finally {
    uploadLoading.value = false
  }
}

function handleRemove(file: PhotoUploadFile, uploadFiles: PhotoUploadFile[]) {
  const photoId = file.response?.id
  if (photoId) {
    const newModelValue = props.modelValue.filter(p => p.id !== photoId)
    emit('update:modelValue', newModelValue)
  }
  fileList.value = uploadFiles
}

function handleExceed() {
  ElMessage.warning(`最多只能上传 ${props.maxCount} 张照片`)
}

function handlePreview(file: PhotoUploadFile) {
  previewImage.value = file.url || ''
  previewVisible.value = true
}

function handleClosePreview() {
  previewVisible.value = false
  previewImage.value = ''
}

function getPhotoTime(file: PhotoUploadFile) {
  const photo = file.response as Photo | undefined
  return photo?.uploadedAt ? dayjs(photo.uploadedAt).format('MM-DD HH:mm') : ''
}

async function handleDelete(file: PhotoUploadFile) {
  try {
    await ElMessageBox.confirm('确定要删除这张照片吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const photoId = file.response?.id
    if (photoId) {
      const newModelValue = props.modelValue.filter(p => p.id !== photoId)
      emit('update:modelValue', newModelValue)
      fileList.value = fileList.value.filter(f => f.response?.id !== photoId)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}
</script>

<template>
  <div class="photo-upload">
    <div class="upload-header">
      <div class="upload-info">
        <div class="info-item">
          <MapPin :size="14" class="info-icon" />
          <span>{{ currentLocation }}</span>
        </div>
        <div class="info-item">
          <Clock :size="14" class="info-icon" />
          <span>{{ currentTime }}</span>
        </div>
      </div>
      <div class="upload-count">
        已上传 {{ modelValue.length }} / {{ maxCount }} 张
      </div>
    </div>

    <el-upload
      v-model:file-list="fileList"
      list-type="picture-card"
      :multiple="true"
      :limit="maxCount"
      :disabled="disabled || uploadLoading"
      :before-upload="beforeUpload"
      :http-request="httpRequest"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      accept="image/*"
      class="upload-container"
    >
      <div class="upload-btn">
        <Camera :size="24" class="upload-icon" />
        <div class="upload-text">点击上传</div>
      </div>
      <template #file="{ file }">
        <div class="photo-item">
          <img class="photo-img" :src="file.url" alt="" />
          <div class="photo-meta">
            <div class="meta-item">
              <MapPin :size="12" />
              <span class="meta-text">{{ currentLocation }}</span>
            </div>
            <div class="meta-item">
              <Clock :size="12" />
              <span class="meta-text">{{ getPhotoTime(file) }}</span>
            </div>
          </div>
          <div class="photo-actions">
            <div class="action-btn" @click.stop="handlePreview(file)">
              <ZoomIn :size="16" />
            </div>
            <div class="action-btn delete" @click.stop="handleDelete(file)">
              <Trash2 :size="16" />
            </div>
          </div>
        </div>
      </template>
    </el-upload>

    <el-dialog v-model="previewVisible" :show-close="false" width="auto" class="preview-dialog">
      <div class="preview-container">
        <img :src="previewImage" class="preview-img" />
        <div class="preview-close" @click="handleClosePreview">
          <X :size="24" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.photo-upload {
  width: 100%;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: #F5F8FF;
  border-radius: 8px;
  border: 1px solid #E0EAFF;
}

.upload-info {
  display: flex;
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #667085;
}

.info-icon {
  color: #165DFF;
}

.upload-count {
  font-size: 12px;
  color: #165DFF;
  font-weight: 500;
}

.upload-container {
  width: 100%;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #98A2B3;
}

.upload-icon {
  color: #667085;
}

.upload-text {
  font-size: 12px;
}

.photo-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-meta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  font-size: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-item:hover .photo-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.action-btn.delete:hover {
  background-color: #EF4444;
}

.preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.preview-img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
}

.preview-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.preview-close:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

:deep(.el-upload--picture-card) {
  width: 148px;
  height: 148px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 148px;
  height: 148px;
}
</style>
