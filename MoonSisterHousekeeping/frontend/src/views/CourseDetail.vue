<template>
  <div>
    <el-button type="text" @click="$router.back()">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <el-card v-if="course" class="mt-10">
      <div class="course-header">
        <el-image
          :src="course.cover || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=online%20course%20learning%20nanny%20training&image_size=square'"
          fit="cover"
          style="width: 300px; height: 200px"
        />
        <div class="course-brief">
          <h2>{{ course.title }}</h2>
          <div class="course-tags">
            <el-tag size="large">{{ course.category || '综合' }}</el-tag>
            <el-tag size="large" type="warning">{{ course.level || '初级' }}</el-tag>
          </div>
          <div class="course-price">
            <span v-if="course.price > 0" class="price">¥{{ course.price }}</span>
            <span v-else class="price free">免费</span>
          </div>
          <div class="course-info">
            <span>讲师: {{ course.teacher || '专业讲师' }}</span>
            <span>时长: {{ course.duration }}分钟</span>
            <span>学习人数: {{ course.view_count }}</span>
          </div>
          <p class="course-desc">{{ course.description }}</p>
          <el-button type="primary" size="large" @click="handleStartLearning" v-if="isNanny">
            开始学习
          </el-button>
          <el-tag type="info" v-else>仅限月嫂用户学习</el-tag>
        </div>
      </div>

      <el-divider />

      <div class="course-player" v-if="course.video_url">
        <h3>课程视频</h3>
        <video :src="course.video_url" controls style="width: 100%; max-width: 800px"></video>
      </div>

      <div class="course-content">
        <h3>课程简介</h3>
        <p>{{ course.description }}</p>
      </div>

      <el-divider />

      <div class="learning-progress" v-if="myRecord">
        <h3>学习进度</h3>
        <el-progress :percentage="myRecord.progress" :status="myRecord.is_completed ? 'success' : ''" />
        <p class="mt-10">上次学习位置: {{ formatTime(myRecord.last_position) }}</p>
        <p v-if="myRecord.is_completed">
          完成时间: {{ formatDateTime(myRecord.completed_at) }}
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseDetail, startLearning as apiStartLearning, getMyCourses } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isNanny = computed(() => userStore.role === 'nanny')

const route = useRoute()
const course = ref(null)
const myRecord = ref(null)

const loadData = async () => {
  try {
    const courseRes = await getCourseDetail(route.params.id)
    course.value = courseRes.data

    if (isNanny.value) {
      const myCourseRes = await getMyCourses().catch(() => ({ data: [] }))
      myRecord.value = myCourseRes.data?.find(r => r.course_id === parseInt(route.params.id))
    }
  } catch (error) {
    console.error(error)
  }
}

const handleStartLearning = async () => {
  try {
    await apiStartLearning(route.params.id)
    ElMessage.success('已开始学习')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const formatTime = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

onMounted(loadData)
</script>

<style scoped>
.course-header {
  display: flex;
  gap: 30px;
}

.course-brief {
  flex: 1;
}

.course-brief h2 {
  margin: 0 0 15px 0;
}

.course-tags {
  margin-bottom: 15px;
}

.course-tags .el-tag {
  margin-right: 10px;
}

.course-price {
  margin: 15px 0;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
}

.price.free {
  color: #67c23a;
}

.course-info {
  display: flex;
  gap: 20px;
  color: #909399;
  margin-bottom: 15px;
}

.course-desc {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 20px;
}

.course-player {
  margin: 30px 0;
}

.course-content {
  line-height: 1.8;
  color: #606266;
}

.learning-progress {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.mt-10 {
  margin-top: 10px;
}
</style>
