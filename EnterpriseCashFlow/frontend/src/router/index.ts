import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '资金总览' }
  },
  {
    path: '/receivable-payable',
    name: 'ReceivablePayable',
    component: () => import('../views/ReceivablePayable.vue'),
    meta: { title: '应收应付' }
  },
  {
    path: '/cashflow-forecast',
    name: 'CashflowForecast',
    component: () => import('../views/CashflowForecast.vue'),
    meta: { title: '现金流预测' }
  },
  {
    path: '/gap-warning',
    name: 'GapWarning',
    component: () => import('../views/GapWarning.vue'),
    meta: { title: '缺口预警' }
  },
  {
    path: '/daily-report',
    name: 'DailyReport',
    component: () => import('../views/DailyReport.vue'),
    meta: { title: '日报管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '企业现金流管理系统'}`
  next()
})

export default router
