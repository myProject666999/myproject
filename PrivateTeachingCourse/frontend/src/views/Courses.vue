<template>
  <div class="page-container">
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部课程" name="all">
        <van-loading v-if="loading" class="flex-center" style="padding: 20px" />
        <van-empty v-else-if="courses.length === 0" description="暂无课程" />
        <div v-else>
          <div v-for="course in courses" :key="course.id" class="course-item">
            <div class="course-header">
              <span class="course-badge" :class="getStatusClass(course.status)">{{ getStatusText(course.status) }}</span>
              <span class="course-category">{{ course.category }}</span>
            </div>
            <div class="course-name">{{ course.name }}</div>
            <div class="course-info">
              <van-icon name="calendar" /> {{ course.date }} {{ course.startTime }}-{{ course.endTime }}
            </div>
            <div class="course-info">
              <van-icon name="location-o" /> {{ course.location || '待定' }}
            </div>
            <div class="course-info">
              <van-icon name="user-o" /> {{ course.Coach?.User?.name }}
            </div>
            <div class="course-footer">
              <span class="text-muted">{{ course.bookedCount }}/{{ course.capacity }}人</span>
              <van-button
                size="small"
                type="primary"
                round
                :disabled="course.status !== 'upcoming'"
                @click="handleBook(course)"
              >
                {{ course.bookedCount >= course.capacity ? '候补' : '预约' }}
              </van-button>
            </div>
          </div>
        </div>
      </van-tab>
      <van-tab title="教练列表" name="coaches">
        <van-loading v-if="loadingCoaches" class="flex-center" style="padding: 20px" />
        <van-empty v-else-if="coaches.length === 0" description="暂无教练" />
        <div v-else>
          <div
            v-for="coach in coaches"
            :key="coach.id"
            class="coach-item"
            @click="$router.push(`/coach-detail/${coach.id}`)"
          >
            <van-image
              round
              width="70"
              height="70"
              :src="coach.User?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
            />
            <div class="coach-detail">
              <div class="coach-name">{{ coach.User?.name }} <span class="coach-rating">⭐ {{ coach.rating }}</span></div>
              <div class="coach-title">{{ coach.title }}</div>
              <div class="coach-specialty">专长：{{ coach.specialty }}</div>
              <div class="coach-meta">教龄 {{ coach.experience }}年 · {{ coach.studentCount }}学员</div>
            </div>
            <van-icon name="arrow" />
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { courseAPI, coachAPI, bookingAPI } from '@/api'

export default {
  setup() {
    const activeTab = ref('all')
    const loading = ref(true)
    const loadingCoaches = ref(true)
    const courses = ref([])
    const coaches = ref([])

    const getStatusText = (status) => {
      const map = { upcoming: '即将开始', in_progress: '进行中', completed: '已完成', cancelled: '已取消' }
      return map[status] || status
    }
    const getStatusClass = (status) => {
      const map = { upcoming: 'status-upcoming', in_progress: 'status-active', completed: 'status-done', cancelled: 'status-cancelled' }
      return map[status] || ''
    }

    const loadCourses = async () => {
      loading.value = true
      try {
        const res = await courseAPI.getAll()
        courses.value = res.courses
      } finally {
        loading.value = false
      }
    }

    const loadCoaches = async () => {
      loadingCoaches.value = true
      try {
        const res = await coachAPI.getAll()
        coaches.value = res.coaches
      } finally {
        loadingCoaches.value = false
      }
    }

    const handleBook = async (course) => {
      try {
        await showConfirmDialog({
          title: '确认预约',
          message: `确定要预约「${course.name}」吗？`
        })
        const res = await bookingAPI.create({ courseId: course.id })
        showSuccessToast(res.message)
        loadCourses()
      } catch (e) {
        if (e !== 'cancel') console.error(e)
      }
    }

    onMounted(() => {
      loadCourses()
      loadCoaches()
    })

    return { activeTab, loading, loadingCoaches, courses, coaches, getStatusText, getStatusClass, handleBook }
  }
}
</script>

<style scoped>
.course-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}
.course-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.course-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  color: #fff;
}
.status-upcoming { background: #1989fa; }
.status-active { background: #07c160; }
.status-done { background: #969799; }
.status-cancelled { background: #ee0a24; }
.course-category {
  font-size: 12px;
  color: #969799;
  background: #f7f8fa;
  padding: 2px 8px;
  border-radius: 4px;
}
.course-name {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
}
.course-info {
  font-size: 13px;
  color: #646566;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.course-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebedf0;
}
.coach-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.coach-detail {
  flex: 1;
  margin-left: 12px;
}
.coach-name {
  font-size: 17px;
  font-weight: 600;
}
.coach-rating {
  font-size: 13px;
  color: #ff976a;
  margin-left: 8px;
}
.coach-title {
  font-size: 13px;
  color: #1989fa;
  margin: 4px 0;
}
.coach-specialty {
  font-size: 13px;
  color: #646566;
}
.coach-meta {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}
</style>
