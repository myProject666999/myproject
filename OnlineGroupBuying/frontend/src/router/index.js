import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'GroupList',
        component: () => import('@/views/GroupList.vue'),
        meta: { title: '团购列表' }
      },
      {
        path: 'group/:id',
        name: 'GroupDetail',
        component: () => import('@/views/GroupDetail.vue'),
        meta: { title: '团购详情' }
      },
      {
        path: 'my/groups',
        name: 'MyGroups',
        component: () => import('@/views/MyGroups.vue'),
        meta: { title: '我的拼团', requiresAuth: true }
      },
      {
        path: 'my/orders',
        name: 'MyOrders',
        component: () => import('@/views/MyOrders.vue'),
        meta: { title: '我的订单', requiresAuth: true }
      },
      {
        path: 'create',
        name: 'CreateGroup',
        component: () => import('@/views/CreateGroup.vue'),
        meta: { title: '发起拼团', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/Admin.vue'),
        meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true }
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
  if (to.meta.title) {
    document.title = `${to.meta.title} - 社区拼团`
  }
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
