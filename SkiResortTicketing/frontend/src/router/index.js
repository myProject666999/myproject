import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'HomeFilled' }
      },
      {
        path: 'ticket',
        name: 'Ticket',
        component: () => import('@/views/ticket/index.vue'),
        meta: { title: '票种管理', icon: 'Ticket' }
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/equipment/index.vue'),
        meta: { title: '雪具租赁', icon: 'Goods' }
      },
      {
        path: 'coach',
        name: 'Coach',
        component: () => import('@/views/coach/index.vue'),
        meta: { title: '教练预约', icon: 'User' }
      },
      {
        path: 'locker',
        name: 'Locker',
        component: () => import('@/views/locker/index.vue'),
        meta: { title: '储物柜管理', icon: 'Box' }
      },
      {
        path: 'gate',
        name: 'Gate',
        component: () => import('@/views/gate/index.vue'),
        meta: { title: '闸机管理', icon: 'Switch' }
      },
      {
        path: 'lost',
        name: 'Lost',
        component: () => import('@/views/lost/index.vue'),
        meta: { title: '失物招领', icon: 'Warning' }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '订单管理', icon: 'Document' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '滑雪场票务系统'
  next()
})

export default router
