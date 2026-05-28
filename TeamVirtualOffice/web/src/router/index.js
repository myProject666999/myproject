import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/office',
    name: 'Office',
    component: () => import('@/views/OfficePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/room/:id',
    name: 'Room',
    component: () => import('@/views/RoomPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/MembersPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/ActivitiesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: '/office'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
