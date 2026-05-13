import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'DataLine' }
      },
      {
        path: 'appointments',
        name: 'Appointments',
        component: () => import('@/views/Appointments.vue'),
        meta: { title: '预约管理', icon: 'Calendar' }
      },
      {
        path: 'schedule',
        name: 'Schedule',
        component: () => import('@/views/Schedule.vue'),
        meta: { title: '档期管理', icon: 'Clock' }
      },
      {
        path: 'packages',
        name: 'Packages',
        component: () => import('@/views/Packages.vue'),
        meta: { title: '套餐管理', icon: 'ShoppingBag' }
      },
      {
        path: 'costumes',
        name: 'Costumes',
        component: () => import('@/views/Costumes.vue'),
        meta: { title: '服装管理', icon: 'ShoppingCart' }
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/Customers.vue'),
        meta: { title: '客户管理', icon: 'User' }
      },
      {
        path: 'photos/:appointmentId?',
        name: 'Photos',
        component: () => import('@/views/Photos.vue'),
        meta: { title: '客片管理', icon: 'Picture' }
      },
      {
        path: 'work-orders',
        name: 'WorkOrders',
        component: () => import('@/views/WorkOrders.vue'),
        meta: { title: '工单管理', icon: 'Tickets' }
      },
      {
        path: 'deliveries',
        name: 'Deliveries',
        component: () => import('@/views/Deliveries.vue'),
        meta: { title: '交付管理', icon: 'Goods' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '员工管理', icon: 'UserFilled', roles: ['admin'] }
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
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
    
    const requiredRoles = to.meta.roles
    if (requiredRoles && !requiredRoles.includes(userStore.role)) {
      next({ name: 'Dashboard' })
      return
    }
  }
  
  if (to.name === 'Login' && userStore.isLoggedIn) {
    next({ name: 'Dashboard' })
    return
  }
  
  next()
})

export default router
