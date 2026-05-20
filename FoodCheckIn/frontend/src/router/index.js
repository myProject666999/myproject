import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'MapHome',
    component: () => import('@/views/MapHome.vue')
  },
  {
    path: '/restaurants',
    name: 'RestaurantList',
    component: () => import('@/views/RestaurantList.vue')
  },
  {
    path: '/restaurant/:id',
    name: 'RestaurantDetail',
    component: () => import('@/views/RestaurantDetail.vue')
  },
  {
    path: '/checkin',
    name: 'Checkin',
    component: () => import('@/views/Checkin.vue')
  },
  {
    path: '/checkins',
    name: 'CheckinList',
    component: () => import('@/views/CheckinList.vue')
  },
  {
    path: '/checkin/:id',
    name: 'CheckinDetail',
    component: () => import('@/views/CheckinDetail.vue')
  },
  {
    path: '/month-review',
    name: 'MonthReview',
    component: () => import('@/views/MonthReview.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
