import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/app'
  },
  {
    path: '/app',
    name: 'App',
    component: () => import('@/views/app/Index.vue'),
    meta: {
      title: '应用注册',
      icon: 'Menu',
      permission: 'app:view'
    }
  },
  {
    path: '/route',
    name: 'Route',
    component: () => import('@/views/route/Index.vue'),
    meta: {
      title: '路由编排',
      icon: 'Share',
      permission: 'route:view'
    }
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('@/views/config/Index.vue'),
    meta: {
      title: '配置下发',
      icon: 'Setting',
      permission: 'config:view'
    }
  },
  {
    path: '/gray',
    name: 'Gray',
    component: () => import('@/views/gray/Index.vue'),
    meta: {
      title: '灰度发布',
      icon: 'Histogram',
      permission: 'gray:view'
    }
  },
  {
    path: '/health',
    name: 'Health',
    component: () => import('@/views/health/Index.vue'),
    meta: {
      title: '健康监控',
      icon: 'Monitor',
      permission: 'health:view'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      hidden: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在',
      hidden: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

const whiteList = ['/login', '/404']

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.title) {
    document.title = `${to.meta.title} - 微前端模块注册与编排中心`
  }

  if (whiteList.includes(to.path)) {
    next()
    return
  }

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    return
  }

  if (to.meta.permission) {
    const hasPermission = userStore.hasPermission(to.meta.permission as string)
    if (!hasPermission) {
      ElMessage.error('没有权限访问该页面')
      next(from.path || '/')
      return
    }
  }

  next()
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 微前端模块注册与编排中心`
  }
})

export default router
