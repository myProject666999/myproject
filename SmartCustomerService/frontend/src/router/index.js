import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'ticket/create',
        name: 'CreateTicket',
        component: () => import('@/views/CreateTicket.vue')
      },
      {
        path: 'ticket/list',
        name: 'TicketList',
        component: () => import('@/views/TicketList.vue')
      },
      {
        path: 'ticket/detail/:id',
        name: 'TicketDetail',
        component: () => import('@/views/TicketDetail.vue')
      },
      {
        path: 'agent/workbench',
        name: 'AgentWorkbench',
        component: () => import('@/views/AgentWorkbench.vue')
      },
      {
        path: 'kb/list',
        name: 'KnowledgeBase',
        component: () => import('@/views/KnowledgeBase.vue')
      },
      {
        path: 'kb/detail/:id',
        name: 'KbArticleDetail',
        component: () => import('@/views/KbArticleDetail.vue')
      },
      {
        path: 'stats',
        name: 'Statistics',
        component: () => import('@/views/Statistics.vue')
      },
      {
        path: 'user/list',
        name: 'UserList',
        component: () => import('@/views/UserList.vue')
      },
      {
        path: 'user/profile',
        name: 'UserProfile',
        component: () => import('@/views/UserProfile.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
