import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'DataBoard' }
      },
      {
        path: 'vehicles',
        name: 'Vehicles',
        component: () => import('@/views/VehicleList.vue'),
        meta: { title: '车辆管理', icon: 'Van' }
      },
      {
        path: 'spots',
        name: 'ParkingSpots',
        component: () => import('@/views/ParkingSpots.vue'),
        meta: { title: '车位管理', icon: 'Location' }
      },
      {
        path: 'records',
        name: 'AccessRecords',
        component: () => import('@/views/AccessRecords.vue'),
        meta: { title: '出入记录', icon: 'Tickets' }
      },
      {
        path: 'billing',
        name: 'Billing',
        component: () => import('@/views/Billing.vue'),
        meta: { title: '计费管理', icon: 'Money' }
      },
      {
        path: 'cards',
        name: 'MonthlyCards',
        component: () => import('@/views/MonthlyCards.vue'),
        meta: { title: '月卡管理', icon: 'CreditCard' }
      },
      {
        path: 'payments',
        name: 'Payments',
        component: () => import('@/views/Payments.vue'),
        meta: { title: '支付记录', icon: 'Wallet' }
      }
    ]
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
    next('/')
  } else {
    next()
  }
})

export default router
