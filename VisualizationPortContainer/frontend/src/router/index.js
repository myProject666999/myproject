import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '堆场可视化大屏', icon: 'DataAnalysis' }
      },
      {
        path: 'container/inbound',
        name: 'Inbound',
        component: () => import('@/views/container/Inbound.vue'),
        meta: { title: '进场登记', icon: 'Upload' }
      },
      {
        path: 'container/outbound',
        name: 'Outbound',
        component: () => import('@/views/container/Outbound.vue'),
        meta: { title: '出场登记', icon: 'Download' }
      },
      {
        path: 'container/list',
        name: 'ContainerList',
        component: () => import('@/views/container/List.vue'),
        meta: { title: '集装箱列表', icon: 'List' }
      },
      {
        path: 'allocation',
        name: 'Allocation',
        component: () => import('@/views/allocation/Allocation.vue'),
        meta: { title: '堆位分配', icon: 'Location' }
      },
      {
        path: 'task',
        name: 'TaskDispatch',
        component: () => import('@/views/task/TaskDispatch.vue'),
        meta: { title: '任务调度', icon: 'Tickets' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/Statistics.vue'),
        meta: { title: '统计分析', icon: 'TrendCharts' }
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
  const token = userStore.token

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    if (to.meta.title) {
      document.title = `${to.meta.title} - 集装箱堆场可视化管理系统`
    }
    next()
  }
})

export default router
