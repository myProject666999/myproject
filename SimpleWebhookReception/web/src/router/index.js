import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Endpoints',
    component: () => import('../views/EndpointList.vue')
  },
  {
    path: '/endpoint/:id',
    name: 'EndpointDetail',
    component: () => import('../views/EndpointDetail.vue')
  },
  {
    path: '/request/:id',
    name: 'RequestDetail',
    component: () => import('../views/RequestDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
