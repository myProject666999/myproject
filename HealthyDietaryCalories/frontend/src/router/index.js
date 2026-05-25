import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/today'
  },
  {
    path: '/today',
    name: 'Today',
    component: () => import('../views/TodayView.vue')
  },
  {
    path: '/add-food',
    name: 'AddFood',
    component: () => import('../views/AddFoodView.vue')
  },
  {
    path: '/foods',
    name: 'Foods',
    component: () => import('../views/FoodsView.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/StatsView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
