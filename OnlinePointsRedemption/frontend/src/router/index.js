import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '积分商城' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/exchange/:id',
    name: 'Exchange',
    component: () => import('@/views/Exchange.vue'),
    meta: { title: '兑换商品' }
  },
  {
    path: '/points/detail',
    name: 'PointsDetail',
    component: () => import('@/views/PointsDetail.vue'),
    meta: { title: '积分明细' }
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/views/Ranking.vue'),
    meta: { title: '积分排行' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: { title: '后台管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '积分商城'} - 在线积分兑换系统`
  next()
})

export default router
