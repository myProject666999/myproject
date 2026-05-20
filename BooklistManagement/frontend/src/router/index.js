import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Bookshelf',
    component: () => import('@/views/Bookshelf.vue')
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: () => import('@/views/BookDetail.vue')
  },
  {
    path: '/yearly-report',
    name: 'YearlyReport',
    component: () => import('@/views/YearlyReport.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
