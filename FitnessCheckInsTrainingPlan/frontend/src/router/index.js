import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/today',
    name: 'Today',
    component: () => import('../views/Today.vue')
  },
  {
    path: '/plans',
    name: 'Plans',
    component: () => import('../views/Plans.vue')
  },
  {
    path: '/plan/edit/:id?',
    name: 'PlanEdit',
    component: () => import('../views/PlanEdit.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/Calendar.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/Stats.vue')
  },
  {
    path: '/exercises',
    name: 'Exercises',
    component: () => import('../views/Exercises.vue')
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: () => import('../views/Achievements.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
