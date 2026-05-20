import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'GameLibrary',
    component: () => import('../views/GameLibrary.vue')
  },
  {
    path: '/games',
    name: 'GameManagement',
    component: () => import('../views/GameManagement.vue')
  },
  {
    path: '/game/:id',
    name: 'GameDetail',
    component: () => import('../views/GameDetail.vue')
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
