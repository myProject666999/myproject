import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

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
      title: '应用注册'
    }
  },
  {
    path: '/route',
    name: 'Route',
    component: () => import('@/views/route/Index.vue'),
    meta: {
      title: '路由编排'
    }
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('@/views/config/Index.vue'),
    meta: {
      title: '配置下发'
    }
  },
  {
    path: '/gray',
    name: 'Gray',
    component: () => import('@/views/gray/Index.vue'),
    meta: {
      title: '灰度发布'
    }
  },
  {
    path: '/health',
    name: 'Health',
    component: () => import('@/views/health/Index.vue'),
    meta: {
      title: '健康监控'
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

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 微前端模块注册与编排中心`
  }
})

export default router
