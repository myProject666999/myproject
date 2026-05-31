import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/areas',
    children: [
      {
        path: 'areas',
        name: 'AreaList',
        component: () => import('../views/AreaList.vue'),
        meta: { title: '巡检区域' }
      },
      {
        path: 'route-plan',
        name: 'RoutePlan',
        component: () => import('../views/RoutePlan.vue'),
        meta: { title: '航线规划' }
      },
      {
        path: 'tasks',
        name: 'TaskList',
        component: () => import('../views/TaskList.vue'),
        meta: { title: '任务管理' }
      },
      {
        path: 'media',
        name: 'MediaList',
        component: () => import('../views/MediaList.vue'),
        meta: { title: '影像归档' }
      },
      {
        path: 'annotations',
        name: 'AnnotationList',
        component: () => import('../views/AnnotationList.vue'),
        meta: { title: '问题标注' }
      },
      {
        path: 'reports',
        name: 'ReportList',
        component: () => import('../views/ReportList.vue'),
        meta: { title: '巡检报告' }
      },
      {
        path: 'comparisons',
        name: 'ComparisonList',
        component: () => import('../views/ComparisonList.vue'),
        meta: { title: '历史对比' }
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
  if (to.path !== '/login' && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
