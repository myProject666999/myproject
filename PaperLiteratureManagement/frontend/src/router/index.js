import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'PaperList',
    component: () => import('@/views/PaperList.vue')
  },
  {
    path: '/paper/:id',
    name: 'PaperDetail',
    component: () => import('@/views/PaperDetail.vue')
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/Tags.vue')
  },
  {
    path: '/notes',
    name: 'Notes',
    component: () => import('@/views/Notes.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
