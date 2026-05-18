import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/today'
  },
  {
    path: '/today',
    name: 'TodayDiary',
    component: () => import('../views/TodayDiary.vue')
  },
  {
    path: '/list',
    name: 'DiaryList',
    component: () => import('../views/DiaryList.vue')
  },
  {
    path: '/trend',
    name: 'MoodTrend',
    component: () => import('../views/MoodTrend.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
