<template>
  <div class="coach-detail-page">
    <van-nav-bar title="教练详情" left-arrow @click-left="$router.back()" />
    <van-loading v-if="loading" class="flex-center" style="padding: 40px" />
    <template v-else-if="coach">
      <div class="coach-header">
        <van-image
          round
          width="80"
          height="80"
          :src="coach.User?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
        />
        <div class="coach-info">
          <div class="coach-name">{{ coach.User?.name }}</div>
          <div class="coach-title">{{ coach.title }}</div>
          <div class="coach-rating">
            <van-rate v-model="coach.rating" readonly size="16" />
            <span class="text-muted" style="margin-left: 8px">教龄 {{ coach.experience }}年</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">个人简介</div>
        <p class="text-muted" style="line-height: 1.8">{{ coach.introduction || '暂无介绍' }}</p>
        <div class="coach-achievements mt-12">
          <div class="achievement-item">
            <div class="achievement-num">{{ coach.studentCount }}</div>
            <div class="achievement-label">学员数</div>
          </div>
          <div class="achievement-item">
            <div class="achievement-num">{{ coach.experience }}</div>
            <div class="achievement-label">从业年数</div>
          </div>
          <div class="achievement-item">
            <div class="achievement-num">{{ coach.SuccessStories?.length || 0 }}</div>
            <div class="achievement-label">成功案例</div>
          </div>
        </div>
      </div>

      <div class="card" v-if="coach.videoUrl">
        <div class="card-title">教练视频</div>
        <video :src="coach.videoUrl" controls class="coach-video"></video>
      </div>

      <div class="card" v-if="coach.SuccessStories?.length">
        <div class="card-title">成功案例</div>
        <div v-for="story in coach.SuccessStories" :key="story.id" class="story-item">
          <div class="story-title">{{ story.title }}</div>
          <div class="story-meta text-muted" v-if="story.duration">训练周期：{{ story.duration }}</div>
          <div class="story-meta text-muted" v-if="story.results">训练成果：{{ story.results }}</div>
          <p class="story-content mt-8">{{ story.content }}</p>
        </div>
      </div>

      <div class="card" v-if="coach.Courses?.length">
        <div class="card-title">近期课程</div>
        <div v-for="course in coach.Courses" :key="course.id" class="mini-course">
          <div class="flex-between">
            <span class="course-name">{{ course.name }}</span>
            <van-button
              size="small"
              type="primary"
              round
              @click="handleBook(course)"
            >
              {{ course.bookedCount >= course.capacity ? '候补' : '预约' }}
            </van-button>
          </div>
          <div class="text-muted mt-8">{{ course.date }} {{ course.startTime }}-{{ course.endTime }}</div>
        </div>
      </div>
    </template>
    <van-empty v-else description="教练不存在" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showConfirmDialog, Toast } from 'vant'
import { coachAPI, bookingAPI } from '@/api'

export default {
  setup() {
    const route = useRoute()
    const loading = ref(true)
    const coach = ref(null)

    const loadCoach = async () => {
      try {
        const res = await coachAPI.getById(route.params.id)
        coach.value = res.coach
      } finally {
        loading.value = false
      }
    }

    const handleBook = async (course) => {
      try {
        await showConfirmDialog({
          title: '确认预约',
          message: `确定要预约「${course.name}」吗？`
        })
        const res = await bookingAPI.create({ courseId: course.id })
        Toast.success(res.message)
        loadCoach()
      } catch (e) {
        if (e !== 'cancel') console.error(e)
      }
    }

    onMounted(loadCoach)
    return { coach, loading, handleBook }
  }
}
</script>

<style scoped>
.coach-detail-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}
.coach-header {
  background: linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%);
  padding: 30px 20px;
  display: flex;
  align-items: center;
  color: #fff;
}
.coach-info {
  margin-left: 16px;
}
.coach-name {
  font-size: 22px;
  font-weight: 600;
}
.coach-title {
  font-size: 14px;
  opacity: 0.9;
  margin: 4px 0;
}
.card {
  background: #fff;
  margin: 12px;
  border-radius: 8px;
  padding: 16px;
}
.coach-achievements {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
}
.achievement-item {
  text-align: center;
}
.achievement-num {
  font-size: 22px;
  font-weight: 600;
  color: #1989fa;
}
.achievement-label {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}
.coach-video {
  width: 100%;
  border-radius: 8px;
}
.story-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebedf0;
}
.story-item:last-child {
  border-bottom: none;
}
.story-title {
  font-size: 15px;
  font-weight: 600;
}
.story-meta {
  font-size: 12px;
  margin-top: 4px;
}
.story-content {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}
.mini-course {
  padding: 12px 0;
  border-bottom: 1px solid #ebedf0;
}
.mini-course:last-child {
  border-bottom: none;
}
.mini-course .course-name {
  font-size: 15px;
  font-weight: 500;
}
</style>
