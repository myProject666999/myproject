<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-select v-model="filter.appointmentId" placeholder="选择订单" clearable style="width: 300px" @change="fetchList">
        <el-option
          v-for="a in appointments"
          :key="a.id"
          :label="`${a.orderNo} - ${a.customer?.name}`"
          :value="a.id"
        />
      </el-select>
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :show-file-list="false"
        multiple
        accept="image/*"
        :on-change="handleFileChange"
        style="display: inline-block;"
      >
        <el-button type="primary" :disabled="!filter.appointmentId">
          <el-icon><Upload /></el-icon>
          上传照片
        </el-button>
      </el-upload>
      <el-button v-if="selectedPhotos.length > 0" type="success" @click="handleSelectPhotos">
        <el-icon><Check /></el-icon>
        标记已选 ({{ selectedPhotos.length }})
      </el-button>
      <el-button v-if="selectedPhotos.length > 0" type="warning" @click="handleUnselectPhotos">
        <el-icon><Close /></el-icon>
        取消选择
      </el-button>
    </div>

    <div v-if="!filter.appointmentId" style="margin-top: 50px; text-align: center; color: #909399;">
      <el-icon :size="50"><Picture /></el-icon>
      <p style="margin-top: 20px;">请先选择一个订单</p>
    </div>

    <div v-else class="table-container">
      <div v-if="loading" style="text-align: center; padding: 50px;">
        <el-icon class="is-loading" :size="30"><Loading /></el-icon>
      </div>
      <div v-else-if="photos.length === 0" style="text-align: center; padding: 50px; color: #909399;">
        <p>暂无照片，请上传</p>
      </div>
      <div v-else class="photo-grid">
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="photo-item"
          :class="{ selected: selectedPhotos.includes(photo.id) || photo.isSelected }"
          @click="togglePhotoSelection(photo.id)"
        >
          <img :src="photo.originalPath" :alt="photo.filename" />
          <div class="photo-info">
            <el-tag v-if="photo.isSelected" type="success" size="small">已选</el-tag>
            <el-tag v-else type="info" size="small">原片</el-tag>
            <span style="margin-left: 5px;">{{ photo.filename }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPhotos, uploadPhotos, selectPhotos, getAppointments } from '@/api'

const route = useRoute()
const uploadRef = ref(null)
const loading = ref(false)

const filter = reactive({
  appointmentId: route.params.appointmentId || ''
})

const appointments = ref([])
const photos = ref([])
const selectedPhotos = ref([])
const pendingFiles = ref([])

const fetchAppointments = async () => {
  try {
    const data = await getAppointments({ pageSize: 1000 })
    appointments.value = data.list
  } catch (error) {
    console.error(error)
  }
}

const fetchList = async () => {
  if (!filter.appointmentId) {
    photos.value = []
    return
  }
  loading.value = true
  try {
    const data = await getPhotos({ appointmentId: filter.appointmentId })
    photos.value = data
    selectedPhotos.value = []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleFileChange = (file) => {
  pendingFiles.value.push(file.raw)
  if (pendingFiles.value.length > 0) {
    handleUpload()
  }
}

const handleUpload = async () => {
  if (pendingFiles.value.length === 0) return
  
  try {
    const formData = new FormData()
    pendingFiles.value.forEach(file => {
      formData.append('photos', file)
    })
    formData.append('appointmentId', filter.appointmentId)
    
    await uploadPhotos(formData)
    ElMessage.success('上传成功')
    pendingFiles.value = []
    fetchList()
  } catch (error) {
    console.error(error)
  }
}

const togglePhotoSelection = (photoId) => {
  const index = selectedPhotos.value.indexOf(photoId)
  if (index > -1) {
    selectedPhotos.value.splice(index, 1)
  } else {
    selectedPhotos.value.push(photoId)
  }
}

const handleSelectPhotos = async () => {
  if (selectedPhotos.value.length === 0) return
  
  try {
    await selectPhotos(selectedPhotos.value, true)
    ElMessage.success(`已将 ${selectedPhotos.value.length} 张照片标记为已选`)
    selectedPhotos.value = []
    fetchList()
  } catch (error) {
    console.error(error)
  }
}

const handleUnselectPhotos = async () => {
  if (selectedPhotos.value.length === 0) return
  
  try {
    await selectPhotos(selectedPhotos.value, false)
    ElMessage.success('已取消选择')
    selectedPhotos.value = []
    fetchList()
  } catch (error) {
    console.error(error)
  }
}

watch(() => route.params.appointmentId, (newVal) => {
  if (newVal) {
    filter.appointmentId = newVal
    fetchList()
  }
})

onMounted(() => {
  fetchAppointments()
  if (filter.appointmentId) {
    fetchList()
  }
})
</script>
