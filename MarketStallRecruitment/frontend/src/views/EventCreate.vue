<template>
  <div class="event-create-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? 'Edit Event' : 'Create Event' }}</span>
          <el-button @click="goBack">Back</el-button>
        </div>
      </template>
      <el-form :model="eventForm" :rules="rules" ref="eventFormRef" label-width="140px" style="max-width: 800px; margin: 0 auto">
        <el-form-item label="Title" prop="title">
          <el-input v-model="eventForm.title" placeholder="Enter event title" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="eventForm.description" type="textarea" :rows="4" placeholder="Enter event description" />
        </el-form-item>
        <el-form-item label="Cover Image" prop="coverImage">
          <el-input v-model="eventForm.coverImage" placeholder="Enter cover image URL" />
        </el-form-item>
        <el-form-item label="Address" prop="address">
          <el-input v-model="eventForm.address" placeholder="Enter event address" />
        </el-form-item>
        <el-form-item label="Start Time" prop="startTime">
          <el-date-picker v-model="eventForm.startTime" type="datetime" placeholder="Select start time" style="width: 100%" />
        </el-form-item>
        <el-form-item label="End Time" prop="endTime">
          <el-date-picker v-model="eventForm.endTime" type="datetime" placeholder="Select end time" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Registration Start" prop="registrationStart">
          <el-date-picker v-model="eventForm.registrationStart" type="datetime" placeholder="Select registration start" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Registration End" prop="registrationEnd">
          <el-date-picker v-model="eventForm.registrationEnd" type="datetime" placeholder="Select registration end" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Contact Phone" prop="contactPhone">
          <el-input v-model="eventForm.contactPhone" placeholder="Enter contact phone" />
        </el-form-item>
        <el-form-item label="Organizer" prop="organizer">
          <el-input v-model="eventForm.organizer" placeholder="Enter organizer name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">Submit</el-button>
          <el-button @click="resetForm">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getEventDetail, createEvent, updateEvent } from '@/api/event'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const eventFormRef = ref(null)
const loading = ref(false)
const isEdit = ref(false)
const eventId = ref(null)

const eventForm = ref({
  title: '',
  description: '',
  coverImage: '',
  address: '',
  startTime: null,
  endTime: null,
  registrationStart: null,
  registrationEnd: null,
  contactPhone: '',
  organizer: ''
})

const rules = {
  title: [{ required: true, message: 'Please enter title', trigger: 'blur' }],
  description: [{ required: true, message: 'Please enter description', trigger: 'blur' }],
  address: [{ required: true, message: 'Please enter address', trigger: 'blur' }],
  startTime: [{ required: true, message: 'Please select start time', trigger: 'change' }],
  endTime: [{ required: true, message: 'Please select end time', trigger: 'change' }],
  registrationStart: [{ required: true, message: 'Please select registration start', trigger: 'change' }],
  registrationEnd: [{ required: true, message: 'Please select registration end', trigger: 'change' }]
}

const fetchDetail = async (id) => {
  try {
    const res = await getEventDetail(id)
    const data = res.data
    eventForm.value = {
      title: data.title || '',
      description: data.description || '',
      coverImage: data.coverImage || '',
      address: data.address || '',
      startTime: data.startTime ? dayjs(data.startTime).toDate() : null,
      endTime: data.endTime ? dayjs(data.endTime).toDate() : null,
      registrationStart: data.registrationStart ? dayjs(data.registrationStart).toDate() : null,
      registrationEnd: data.registrationEnd ? dayjs(data.registrationEnd).toDate() : null,
      contactPhone: data.contactPhone || '',
      organizer: data.organizer || ''
    }
  } catch (err) {
    ElMessage.error('Failed to fetch event detail')
  }
}

const handleSubmit = async () => {
  if (!eventFormRef.value) return
  await eventFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const formData = { ...eventForm.value }
        if (isEdit.value) {
          await updateEvent(eventId.value, formData)
          ElMessage.success('Event updated successfully')
        } else {
          await createEvent(formData)
          ElMessage.success('Event created successfully')
        }
        router.push('/event/list')
      } catch (err) {
        ElMessage.error(err.message || 'Operation failed')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  eventFormRef.value?.resetFields()
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  const id = route.query.id
  if (id) {
    isEdit.value = true
    eventId.value = id
    fetchDetail(id)
  }
})
</script>

<style scoped>
.event-create-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
