import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/tasks'
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/Tasks.vue')
  },
  {
    path: '/files',
    name: 'Files',
    component: () => import('@/views/Files.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
