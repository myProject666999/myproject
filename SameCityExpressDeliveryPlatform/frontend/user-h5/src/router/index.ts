import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

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
    path: '/order/create',
    name: 'CreateOrder',
    component: () => import('@/views/CreateOrder.vue'),
    meta: { requiresAuth: true }
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
    path: '/address',
    name: 'AddressList',
    component: () => import('@/views/AddressList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/address/edit',
    name: 'AddressEdit',
    component: () => import('@/views/AddressEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exception/create/:orderId',
    name: 'CreateException',
    component: () => import('@/views/CreateException.vue'),
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
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
