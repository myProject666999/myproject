import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/today'
  },
  {
    path: '/today',
    name: 'Today',
    component: () => import('@/views/Today.vue'),
    meta: { title: '今日用药', icon: 'Calendar' }
  },
  {
    path: '/schedules',
    name: 'Schedules',
    component: () => import('@/views/Schedules.vue'),
    meta: { title: '用药表', icon: 'List' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/Inventory.vue'),
    meta: { title: '库存管理', icon: 'Box' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
