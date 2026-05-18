import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/reminders'
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('@/views/Reminders.vue')
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('@/views/Contacts.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/Calendar.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
