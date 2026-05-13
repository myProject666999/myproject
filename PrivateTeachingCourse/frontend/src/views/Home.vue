<template>
  <div class="page-container">
    <div class="home-banner">
      <div class="banner-content">
        <h2>私教课程预约平台</h2>
        <p>专业教练，科学训练，健康生活</p>
      </div>
    </div>

    <div class="quick-entry">
      <van-grid :column-num="4" clickable>
        <van-grid-item icon="calendar-o" text="预约课程" @click="$router.push('/courses')" />
        <van-grid-item icon="orders-o" text="我的预约" @click="goToRoute('/bookings')" />
        <van-grid-item icon="qr" text="扫码签到" @click="goToRoute('/checkins')" />
        <van-grid-item icon="chart-trending-o" text="体测数据" @click="goToRoute('/body-tests')" />
        <van-grid-item icon="clock-o" text="训练记录" @click="goToRoute('/trainings')" />
        <van-grid-item icon="friends-o" text="学员社区" @click="$router.push('/community')" />
        <van-grid-item icon="user-o" text="教练介绍" @click="scrollToCoaches" />
        <van-grid-item icon="setting-o" text="个人中心" @click="goToRoute('/profile')" />
      </van-grid>
    </div>

    <div id="coaches-section" class="section mt-16">
      <div class="flex-between">
        <div class="card-title">推荐教练</div>
        <router-link to="/courses" class="text-primary">查看全部</router-link>
      </div>
      <van-loading v-if="loadingCoaches" class="flex-center" style="padding: 20px" />
      <div v-else-if="coaches.length === 0" class="text-muted text-center" style="padding: 20px">
        暂无教练信息
      </div>
      <div v-else>
        <div
          v-for="coach in coaches"
          :key="coach.id"
          class="coach-card"
          @click="$router.push(`/coach-detail/${coach.id}`)"
        >
          <van-image
            round
            width="60"
            height="60"
            :src="coach.User?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
          />
          <div class="coach-info">
            <div class="coach-name">{{ coach.User?.name }}</div>
            <div class="coach-title">{{ coach.title }}</div>
            <div class="coach-meta">
              <van-rate v-model="coach.rating" readonly size="14" />
              <span class="text-muted" style="margin-left: 8px">教龄 {{ coach.experience }}年</span>
            </div>
          </div>
          <van-icon name="arrow" />
        </div>
      </div>
    </div>

    <div class="section mt-16">
      <div class="flex-between">
        <div class="card-title">即将开始</div>
        <router-link v-if="isLoggedIn" to="/bookings" class="text-primary">查看全部</router-link>
      </div>
      <van-loading v-if="loadingCourses" class="flex-center" style="padding: 20px" />
      <div v-else-if="courses.length === 0" class="text-muted text-center" style="padding: 20px">
        暂无即将开始的课程
      </div>
      <div v-else>
        <div v-for="course in courses" :key="course.id" class="course-card">
          <div class="course-date">
            <div class="date-day">{{ formatDay(course.date) }}</div>
            <div class="date-week">{{ formatWeek(course.date) }}</div>
          </div>
          <div class="course-info">
            <div class="course-name">{{ course.name }}</div>
            <div class="course-meta text-muted">
              {{ course.startTime }} - {{ course.endTime }} · {{ course.location || '待定' }}
            </div>
            <div class="course-coach text-muted">
              教练：{{ course.Coach?.User?.name }}
            </div>
          </div>
          <div class="course-action">
            <van-button
              size="small"
              type="primary"
              round
              :disabled="course.bookedCount >= course.capacity"
              @click="handleBook(course)"
            >
              {{ course.bookedCount >= course.capacity ? '候补' : '预约' }}
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { coachAPI, courseAPI, bookingAPI } from '@/api'

export default {
  setup() {
    const router = useRouter()
    const store = useStore()
    const isLoggedIn = computed(() => store.getters.isLoggedIn)
    const loadingCoaches = ref(true)
    const loadingCourses = ref(true)
    const coaches = ref([])
    const courses = ref([])

    const formatDay = (date) => new Date(date).getDate()
    const formatWeek = (date) => {
      const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return weeks[new Date(date).getDay()]
    }

    const loadCoaches = async () => {
      try {
        const res = await coachAPI.getAll()
        coaches.value = res.coaches.slice(0, 3)
      } finally {
        loadingCoaches.value = false
      }
    }

    const loadCourses = async () => {
      try {
        const res = await courseAPI.getAll({ status: 'upcoming' })
        courses.value = res.courses.slice(0, 5)
      } finally {
        loadingCourses.value = false
      }
    }

    const scrollToCoaches = () => {
      document.getElementById('coaches-section')?.scrollIntoView({ behavior: 'smooth' })
    }

    const goToRoute = (path) => {
      if (!isLoggedIn.value) {
        router.push('/login')
      } else {
        router.push(path)
      }
    }

    const handleBook = async (course) => {
      if (!isLoggedIn.value) {
        router.push('/login')
        return
      }
      try {
        await showConfirmDialog({
          title: '确认预约',
          message: `确定要预约「${course.name}」吗？`
        })
        const res = await bookingAPI.create({ courseId: course.id })
        showSuccessToast(res.message)
      } catch (e) {
        if (e !== 'cancel') console.error(e)
      }
    }

    onMounted(() => {
      loadCoaches()
      loadCourses()
    })

    return {
      isLoggedIn, loadingCoaches, loadingCourses, coaches, courses,
      formatDay, formatWeek, scrollToCoaches, goToRoute, handleBook
    }
  }
}
</script>

<style scoped>
.home-banner {
  background: linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%);
  border-radius: 12px;
  padding: 30px 20px;
  color: #fff;
  margin-bottom: 16px;
}
.banner-content h2 {
  font-size: 22px;
  margin-bottom: 6px;
}
.banner-content p {
  opacity: 0.9;
  font-size: 14px;
}
.quick-entry {
  background: #fff;
  border-radius: 8px;
  padding: 8px 0;
}
.section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}
.coach-card {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebedf0;
}
.coach-card:last-child {
  border-bottom: none;
}
.coach-info {
  flex: 1;
  margin-left: 12px;
}
.coach-name {
  font-size: 16px;
  font-weight: 500;
}
.coach-title {
  font-size: 13px;
  color: #969799;
  margin: 4px 0;
}
.coach-meta {
  display: flex;
  align-items: center;
}
.course-card {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebedf0;
}
.course-card:last-child {
  border-bottom: none;
}
.course-date {
  text-align: center;
  width: 50px;
}
.date-day {
  font-size: 24px;
  font-weight: 600;
  color: #1989fa;
}
.date-week {
  font-size: 12px;
  color: #969799;
}
.course-info {
  flex: 1;
  margin-left: 12px;
}
.course-name {
  font-size: 16px;
  font-weight: 500;
}
.course-meta, .course-coach {
  font-size: 13px;
  margin-top: 4px;
}
</style>
