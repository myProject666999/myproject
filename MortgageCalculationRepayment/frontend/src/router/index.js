import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/calculator'
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('./views/Calculator.vue')
  },
  {
    path: '/schemes',
    name: 'Schemes',
    component: () => import('./views/Schemes.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('./views/Calendar.vue')
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('./views/Statistics.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
