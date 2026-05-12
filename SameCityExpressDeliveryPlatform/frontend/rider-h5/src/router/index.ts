import { createRouter, createWebHistory } from 'vue-router'
import { useRiderStore } from '@/stores/rider'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true, tabBar: true }
  },
  {
    path: '/order',
    name: 'OrderList',
    component: () => import('@/views/OrderList.vue'),
    meta: { requiresAuth: true, tabBar: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exception',
    name: 'ExceptionList',
    component: () => import('@/views/ExceptionList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true, tabBar: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const riderStore = useRiderStore()

  if (to.meta.requiresAuth && !riderStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
