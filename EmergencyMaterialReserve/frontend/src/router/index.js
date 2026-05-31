import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', noAuth: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '物资分布大屏', icon: 'Monitor' }
      },
      {
        path: 'materials',
        name: 'Materials',
        component: () => import('@/views/Materials.vue'),
        meta: { title: '物资台账', icon: 'Box' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/Inventory.vue'),
        meta: { title: '库存管理', icon: 'Goods' }
      },
      {
        path: 'expiry',
        name: 'Expiry',
        component: () => import('@/views/Expiry.vue'),
        meta: { title: '效期预警', icon: 'AlarmClock' }
      },
      {
        path: 'transfers',
        name: 'Transfers',
        component: () => import('@/views/Transfers.vue'),
        meta: { title: '调拨单', icon: 'Switch' }
      },
      {
        path: 'stock',
        name: 'Stock',
        component: () => import('@/views/Stock.vue'),
        meta: { title: '出入库', icon: 'Sell' }
      },
      {
        path: 'demands',
        name: 'Demands',
        component: () => import('@/views/Demands.vue'),
        meta: { title: '需求申报', icon: 'Document' }
      },
      {
        path: 'warehouses',
        name: 'Warehouses',
        component: () => import('@/views/Warehouses.vue'),
        meta: { title: '仓库管理', icon: 'OfficeBuilding' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - 应急物资储备与调拨管理系统`
    : '应急物资储备与调拨管理系统'

  const userStore = useUserStore()

  if (to.meta.noAuth || userStore.token) {
    next()
  } else {
    next('/login')
  }
})

export default router
