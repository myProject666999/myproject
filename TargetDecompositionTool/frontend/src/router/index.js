import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'TargetTree',
      component: () => import('@/views/TargetTree.vue')
    },
    {
      path: '/target/:id',
      name: 'TargetDetail',
      component: () => import('@/views/TargetDetail.vue')
    },
    {
      path: '/review',
      name: 'ReviewList',
      component: () => import('@/views/ReviewList.vue')
    },
    {
      path: '/archive',
      name: 'ArchiveList',
      component: () => import('@/views/ArchiveList.vue')
    }
  ]
})

export default router
