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
    meta: { title: '仪表盘' }
  },
  {
    path: '/bays',
    name: 'Bays',
    component: () => import('../views/Bays.vue'),
    meta: { title: '打位管理' }
  },
  {
    path: '/coaches',
    name: 'Coaches',
    component: () => import('../views/Coaches.vue'),
    meta: { title: '教练管理' }
  },
  {
    path: '/reservations',
    name: 'Reservations',
    component: () => import('../views/Reservations.vue'),
    meta: { title: '预约管理' }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('../views/Members.vue'),
    meta: { title: '会员管理' }
  },
  {
    path: '/equipment',
    name: 'Equipment',
    component: () => import('../views/Equipment.vue'),
    meta: { title: '球具租赁' }
  },
  {
    path: '/cards',
    name: 'Cards',
    component: () => import('../views/Cards.vue'),
    meta: { title: '卡类型管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 高尔夫练习场预约系统` : '高尔夫练习场预约系统'
  next()
})

export default router
