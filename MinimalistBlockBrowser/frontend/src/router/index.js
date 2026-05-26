import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/block/:number',
    name: 'Block',
    component: () => import('../views/Block.vue'),
    meta: { title: '区块详情' }
  },
  {
    path: '/block/hash/:hash',
    name: 'BlockHash',
    component: () => import('../views/Block.vue'),
    meta: { title: '区块详情' }
  },
  {
    path: '/transaction/:hash',
    name: 'Transaction',
    component: () => import('../views/Transaction.vue'),
    meta: { title: '交易详情' }
  },
  {
    path: '/address/:address',
    name: 'Address',
    component: () => import('../views/Address.vue'),
    meta: { title: '地址详情' }
  },
  {
    path: '/gas',
    name: 'GasTracker',
    component: () => import('../views/GasTracker.vue'),
    meta: { title: 'Gas 追踪' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | 极简区块浏览器` : '极简区块浏览器'
  next()
})

export default router