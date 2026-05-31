import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/columns',
    name: 'ColumnList',
    component: () => import('../views/ColumnList.vue')
  },
  {
    path: '/column/:id',
    name: 'ColumnDetail',
    component: () => import('../views/ColumnDetail.vue')
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/subscribe/:id',
    name: 'Subscribe',
    component: () => import('../views/Subscribe.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/author/dashboard',
    name: 'AuthorDashboard',
    component: () => import('../views/AuthorDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/author/stats',
    name: 'RevenueStats',
    component: () => import('../views/RevenueStats.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && userStore.user?.role !== 2) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
