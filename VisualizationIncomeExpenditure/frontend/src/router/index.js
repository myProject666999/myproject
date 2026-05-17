import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Calendar',
    component: () => import('../views/Calendar.vue')
  },
  {
    path: '/day/:date',
    name: 'DayDetail',
    component: () => import('../views/DayDetail.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
