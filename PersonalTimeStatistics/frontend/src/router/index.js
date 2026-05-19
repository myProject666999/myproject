import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/record'
  },
  {
    path: '/record',
    name: 'Record',
    component: () => import('../views/Record.vue'),
    meta: { title: '时间录入' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { title: '统计图' }
  },
  {
    path: '/goal',
    name: 'Goal',
    component: () => import('../views/Goal.vue'),
    meta: { title: '目标设置' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
