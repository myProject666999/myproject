import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/members',
    name: 'MemberList',
    component: () => import('../views/MemberList.vue')
  },
  {
    path: '/members/:id',
    name: 'MemberDetail',
    component: () => import('../views/MemberDetail.vue'),
    props: true
  },
  {
    path: '/visits/:id',
    name: 'VisitDetail',
    component: () => import('../views/VisitDetail.vue'),
    props: true
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('../views/Reminders.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
