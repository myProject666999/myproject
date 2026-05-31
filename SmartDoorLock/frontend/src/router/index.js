import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/Layout.vue'),
    redirect: '/apartment',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'apartment',
        name: 'Apartment',
        component: () => import('@/views/Apartment.vue'),
        meta: { title: '房源管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'lease',
        name: 'Lease',
        component: () => import('@/views/Lease.vue'),
        meta: { title: '租约管理', icon: 'Document' }
      },
      {
        path: 'password',
        name: 'Password',
        component: () => import('@/views/Password.vue'),
        meta: { title: '门锁密码', icon: 'Key' }
      },
      {
        path: 'bill',
        name: 'Bill',
        component: () => import('@/views/Bill.vue'),
        meta: { title: '账单缴费', icon: 'Money' }
      },
      {
        path: 'repair',
        name: 'Repair',
        component: () => import('@/views/Repair.vue'),
        meta: { title: '报修管理', icon: 'Tools' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404', requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const title = to.meta.title ? `${to.meta.title} - 长租公寓智能门锁管理系统` : '长租公寓智能门锁管理系统'
  document.title = title

  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else {
    if (to.path === '/login' && userStore.isLoggedIn) {
      next({ path: '/' })
    } else {
      next()
    }
  }
})

export default router
