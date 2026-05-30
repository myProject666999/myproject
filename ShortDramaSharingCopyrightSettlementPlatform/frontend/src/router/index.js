import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
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
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'drama',
        name: 'DramaList',
        component: () => import('@/views/drama/List.vue'),
        meta: { title: '剧集管理' }
      },
      {
        path: 'stakeholder',
        name: 'StakeholderList',
        component: () => import('@/views/stakeholder/List.vue'),
        meta: { title: '权益方管理' }
      },
      {
        path: 'rule',
        name: 'RuleList',
        component: () => import('@/views/rule/List.vue'),
        meta: { title: '分账规则' }
      },
      {
        path: 'data/play',
        name: 'PlayData',
        component: () => import('@/views/data/PlayData.vue'),
        meta: { title: '播放数据' }
      },
      {
        path: 'data/payment',
        name: 'PaymentData',
        component: () => import('@/views/data/PaymentData.vue'),
        meta: { title: '付费数据' }
      },
      {
        path: 'share/tasks',
        name: 'ShareTasks',
        component: () => import('@/views/share/Tasks.vue'),
        meta: { title: '分账任务' }
      },
      {
        path: 'share/details',
        name: 'ShareDetails',
        component: () => import('@/views/share/Details.vue'),
        meta: { title: '分账明细' }
      },
      {
        path: 'settlement',
        name: 'SettlementList',
        component: () => import('@/views/settlement/List.vue'),
        meta: { title: '结算单' }
      },
      {
        path: 'reconciliation',
        name: 'ReconciliationList',
        component: () => import('@/views/reconciliation/List.vue'),
        meta: { title: '对账管理' }
      },
      {
        path: 'copyright',
        name: 'CopyrightList',
        component: () => import('@/views/copyright/List.vue'),
        meta: { title: '版权授权' }
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
