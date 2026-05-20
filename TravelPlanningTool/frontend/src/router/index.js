import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'TripOverview',
    component: () => import('@/views/TripOverview.vue')
  },
  {
    path: '/schedule',
    name: 'DailySchedule',
    component: () => import('@/views/DailySchedule.vue')
  },
  {
    path: '/budget',
    name: 'Budget',
    component: () => import('@/views/Budget.vue')
  },
  {
    path: '/hotel',
    name: 'Hotel',
    component: () => import('@/views/Hotel.vue')
  },
  {
    path: '/packing',
    name: 'PackingList',
    component: () => import('@/views/PackingList.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
