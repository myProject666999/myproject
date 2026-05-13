import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/Category.vue'),
    meta: { title: '选择品类' }
  },
  {
    path: '/estimate/:categoryId',
    name: 'Estimate',
    component: () => import('@/views/Estimate.vue'),
    meta: { title: '估价' }
  },
  {
    path: '/appointment',
    name: 'Appointment',
    component: () => import('@/views/Appointment.vue'),
    meta: { title: '上门预约', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/order-detail/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: () => import('@/views/Wallet.vue'),
    meta: { title: '我的钱包', requiresAuth: true }
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('@/views/Address.vue'),
    meta: { title: '地址管理', requiresAuth: true }
  },
  {
    path: '/collector',
    name: 'Collector',
    component: () => import('@/views/collector/CollectorHome.vue'),
    meta: { title: '回收员端', requiresAuth: true, role: 'collector' }
  },
  {
    path: '/collector/tasks',
    name: 'CollectorTasks',
    component: () => import('@/views/collector/Tasks.vue'),
    meta: { title: '我的任务', requiresAuth: true, role: 'collector' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '二手回收平台'
  
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
    
    if (to.meta.role) {
      const userRole = localStorage.getItem('userRole')
      if (userRole !== to.meta.role) {
        next('/home')
        return
      }
    }
  }
  
  next()
})

export default router
