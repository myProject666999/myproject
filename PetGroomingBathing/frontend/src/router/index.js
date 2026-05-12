import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/pets',
    name: 'Pets',
    component: () => import('@/views/Pets.vue')
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('@/views/Services.vue')
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('@/views/Appointments.vue')
  },
  {
    path: '/vehicles',
    name: 'Vehicles',
    component: () => import('@/views/Vehicles.vue')
  },
  {
    path: '/consumptions',
    name: 'Consumptions',
    component: () => import('@/views/Consumptions.vue')
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('@/views/Reminders.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
