import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/order/list',
    name: 'OrderList',
    component: () => import('@/views/order/OrderList.vue')
  },
  {
    path: '/order/create',
    name: 'OrderCreate',
    component: () => import('@/views/order/OrderCreate.vue')
  },
  {
    path: '/order/detail/:id',
    name: 'OrderDetail',
    component: () => import('@/views/order/OrderDetail.vue')
  },
  {
    path: '/review/pending',
    name: 'ReviewPending',
    component: () => import('@/views/review/ReviewPending.vue')
  },
  {
    path: '/review/history',
    name: 'ReviewHistory',
    component: () => import('@/views/review/ReviewHistory.vue')
  },
  {
    path: '/execution/list',
    name: 'ExecutionList',
    component: () => import('@/views/execution/ExecutionList.vue')
  },
  {
    path: '/execution/detail/:id',
    name: 'ExecutionDetail',
    component: () => import('@/views/execution/ExecutionDetail.vue')
  },
  {
    path: '/audit',
    name: 'AuditLog',
    component: () => import('@/views/audit/AuditLog.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
