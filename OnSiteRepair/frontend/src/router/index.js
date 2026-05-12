import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
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
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/order/create',
    name: 'CreateOrder',
    component: () => import('@/views/order/Create.vue'),
    meta: { requiresAuth: true, userType: 1 }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/order/List.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/order/Detail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/grab',
    name: 'GrabOrder',
    component: () => import('@/views/worker/Grab.vue'),
    meta: { requiresAuth: true, userType: 2 }
  },
  {
    path: '/map/navigate/:orderId',
    name: 'MapNavigate',
    component: () => import('@/views/MapNavigate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/review/:orderId',
    name: 'CreateReview',
    component: () => import('@/views/Review.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/user/Notifications.vue'),
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
  } else if (to.meta.userType && userStore.userType !== to.meta.userType) {
    next('/home')
  } else {
    next()
  }
})

export default router
