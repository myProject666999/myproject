import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'TripList',
    component: () => import('../views/TripList.vue'),
    meta: { title: '行程列表' }
  },
  {
    path: '/trip/create',
    name: 'TripCreate',
    component: () => import('../views/TripEdit.vue'),
    meta: { title: '创建行程' }
  },
  {
    path: '/trip/:id/edit',
    name: 'TripEdit',
    component: () => import('../views/TripEdit.vue'),
    meta: { title: '编辑行程' }
  },
  {
    path: '/trip/:id/map',
    name: 'TripMap',
    component: () => import('../views/TripMap.vue'),
    meta: { title: '地图展示' }
  },
  {
    path: '/trip/:id/budget',
    name: 'TripBudget',
    component: () => import('../views/TripBudget.vue'),
    meta: { title: '预算管理' }
  },
  {
    path: '/trip/:id/share',
    name: 'TripShare',
    component: () => import('../views/TripShare.vue'),
    meta: { title: '分享行程' }
  },
  {
    path: '/share/:token',
    name: 'SharedTrip',
    component: () => import('../views/SharedTrip.vue'),
    meta: { title: '分享的行程' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '旅游行程规划助手'} - 旅游行程规划助手`
  next()
})

export default router
