import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '餐厅列表' }
  },
  {
    path: '/queue/:restaurantId',
    name: 'Queue',
    component: () => import('@/views/Queue.vue'),
    meta: { title: '取号' }
  },
  {
    path: '/my-queue',
    name: 'MyQueue',
    component: () => import('@/views/MyQueue.vue'),
    meta: { title: '我的排队' }
  },
  {
    path: '/reservation/:restaurantId',
    name: 'Reservation',
    component: () => import('@/views/Reservation.vue'),
    meta: { title: '预约' }
  },
  {
    path: '/my-reservation',
    name: 'MyReservation',
    component: () => import('@/views/MyReservation.vue'),
    meta: { title: '我的预约' }
  },
  {
    path: '/merchant/:restaurantId',
    name: 'Merchant',
    component: () => import('@/views/Merchant.vue'),
    meta: { title: '商家叫号台' }
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('@/views/Verify.vue'),
    meta: { title: '核验' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '餐厅排队叫号系统'
  next()
})

export default router
