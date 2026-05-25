import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Query',
    component: () => import('../views/QueryView.vue'),
    meta: { title: '运单查询' }
  },
  {
    path: '/tracking/:waybillNo',
    name: 'Tracking',
    component: () => import('../views/TrackingView.vue'),
    meta: { title: '轨迹详情' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { title: '运单管理' }
  },
  {
    path: '/create',
    name: 'Create',
    component: () => import('../views/CreateView.vue'),
    meta: { title: '创建运单' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/StatisticsView.vue'),
    meta: { title: '数据统计' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 物流快递跟踪系统` : '物流快递跟踪系统'
  next()
})

export default router
