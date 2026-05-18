import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/CardList.vue'),
    meta: { title: '名片夹' }
  },
  {
    path: '/scan',
    name: 'Scan',
    component: () => import('@/views/Scan.vue'),
    meta: { title: '扫描名片' }
  },
  {
    path: '/card/:id',
    name: 'CardDetail',
    component: () => import('@/views/CardDetail.vue'),
    meta: { title: '名片详情' }
  },
  {
    path: '/card/edit/:id?',
    name: 'CardEdit',
    component: () => import('@/views/CardEdit.vue'),
    meta: { title: '编辑名片' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('@/views/GroupManage.vue'),
    meta: { title: '分组管理' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '数字名片夹'
  next()
})

export default router
