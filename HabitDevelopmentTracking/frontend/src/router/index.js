import { createRouter, createWebHistory } from 'vue-router'
import TodayCheckin from '../views/TodayCheckin.vue'
import HabitList from '../views/HabitList.vue'
import Heatmap from '../views/Heatmap.vue'

const routes = [
  {
    path: '/',
    redirect: '/today'
  },
  {
    path: '/today',
    name: 'Today',
    component: TodayCheckin,
    meta: { title: '今日打卡' }
  },
  {
    path: '/habits',
    name: 'Habits',
    component: HabitList,
    meta: { title: '习惯列表' }
  },
  {
    path: '/heatmap',
    name: 'Heatmap',
    component: Heatmap,
    meta: { title: '热力图' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '习惯养成追踪'
  next()
})

export default router
