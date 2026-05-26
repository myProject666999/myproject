import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '仪表盘' }
  },
  {
    path: '/applications',
    name: 'ApplicationList',
    component: () => import('../views/ApplicationList.vue'),
    meta: { title: '申请列表' }
  },
  {
    path: '/applications/create',
    name: 'ApplicationCreate',
    component: () => import('../views/ApplicationCreate.vue'),
    meta: { title: '新建开票申请' }
  },
  {
    path: '/applications/:id',
    name: 'ApplicationDetail',
    component: () => import('../views/ApplicationDetail.vue'),
    meta: { title: '申请详情' }
  },
  {
    path: '/review',
    name: 'ReviewList',
    component: () => import('../views/ReviewList.vue'),
    meta: { title: '审核管理' }
  },
  {
    path: '/invoices',
    name: 'InvoiceList',
    component: () => import('../views/InvoiceList.vue'),
    meta: { title: '发票记录' }
  },
  {
    path: '/invoices/:id',
    name: 'InvoiceDetail',
    component: () => import('../views/InvoiceDetail.vue'),
    meta: { title: '发票详情' }
  },
  {
    path: '/titles',
    name: 'TitleManage',
    component: () => import('../views/TitleManage.vue'),
    meta: { title: '抬头管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router