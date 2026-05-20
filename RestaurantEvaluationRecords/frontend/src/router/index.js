import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/restaurants'
      },
      {
        path: 'restaurants',
        name: 'RestaurantList',
        component: () => import('@/views/RestaurantList.vue'),
        meta: { title: '餐厅列表' }
      },
      {
        path: 'restaurant/:id',
        name: 'RestaurantDetail',
        component: () => import('@/views/RestaurantDetail.vue'),
        meta: { title: '餐厅详情' }
      },
      {
        path: 'friend-reviews',
        name: 'FriendReviews',
        component: () => import('@/views/FriendReviews.vue'),
        meta: { title: '好友评价' }
      },
      {
        path: 'my-reviews',
        name: 'MyReviews',
        component: () => import('@/views/MyReviews.vue'),
        meta: { title: '我的评价' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/restaurants')
  } else {
    next()
  }
})

export default router
