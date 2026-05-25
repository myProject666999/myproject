import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/submit',
    name: 'ReimbursementSubmit',
    component: () => import('@/views/ReimbursementSubmit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my',
    name: 'MyReimbursement',
    component: () => import('@/views/MyReimbursement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/approval',
    name: 'ApprovalWorkbench',
    component: () => import('@/views/ApprovalWorkbench.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/detail/:id',
    name: 'ReimbursementDetail',
    component: () => import('@/views/ReimbursementDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue'),
    meta: { requiresAuth: true }
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
  } else if (to.path === '/login' && userStore.token) {
    next('/submit')
  } else {
    next()
  }
})

export default router
