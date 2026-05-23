import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: { title: '生成短链' }
  },
  {
    path: '/manage',
    name: 'manage',
    component: () => import('../views/Manage.vue'),
    meta: { title: '我的链接', requiresAuth: true }
  },
  {
    path: '/stats/:code',
    name: 'stats',
    component: () => import('../views/Stats.vue'),
    meta: { title: '访问统计' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/r/:code',
    name: 'redirect',
    component: () => import('../views/Redirect.vue'),
    meta: { title: '跳转中...' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    next('/login')
  } else {
    next()
  }
})

export default router
