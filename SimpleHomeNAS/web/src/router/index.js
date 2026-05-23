import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Files',
    component: () => import('@/views/Files.vue')
  },
  {
    path: '/shares',
    name: 'Shares',
    component: () => import('@/views/Shares.vue')
  },
  {
    path: '/status',
    name: 'Status',
    component: () => import('@/views/Status.vue')
  },
  {
    path: '/share/:token',
    name: 'ShareView',
    component: () => import('@/views/ShareView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
