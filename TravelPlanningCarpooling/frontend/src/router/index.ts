import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册', public: true }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { title: '首页', requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { title: '行程列表' }
      },
      {
        path: 'ride/publish',
        name: 'PublishRide',
        component: () => import('../views/PublishRide.vue'),
        meta: { title: '发布行程' }
      },
      {
        path: 'request/publish',
        name: 'PublishRequest',
        component: () => import('../views/PublishRequest.vue'),
        meta: { title: '发布需求' }
      },
      {
        path: 'match/:requestId',
        name: 'MatchResult',
        component: () => import('../views/MatchResult.vue'),
        meta: { title: '匹配结果' }
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('../views/OrderDetail.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('../views/OrderList.vue'),
        meta: { title: '我的订单' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'profile/credit',
        name: 'Credit',
        component: () => import('../views/Credit.vue'),
        meta: { title: '信用评价' }
      },
      {
        path: 'profile/vehicles',
        name: 'Vehicles',
        component: () => import('../views/Vehicles.vue'),
        meta: { title: '车辆管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '拼车平台'} - 行程规划与拼车平台`
  const userStore = useUserStore()
  userStore.init()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
