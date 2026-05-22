import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/report'
  },
  {
    path: '/report',
    name: 'ReportList',
    component: () => import('../views/ReportList.vue')
  },
  {
    path: '/report/add',
    name: 'ReportAdd',
    component: () => import('../views/ReportAdd.vue')
  },
  {
    path: '/report/detail/:id',
    name: 'ReportDetail',
    component: () => import('../views/ReportDetail.vue')
  },
  {
    path: '/trend',
    name: 'IndicatorTrend',
    component: () => import('../views/IndicatorTrend.vue')
  },
  {
    path: '/compare',
    name: 'YearCompare',
    component: () => import('../views/YearCompare.vue')
  },
  {
    path: '/rule',
    name: 'AbnormalRule',
    component: () => import('../views/AbnormalRule.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
