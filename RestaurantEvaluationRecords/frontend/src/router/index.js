import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/restaurants',
    name: 'Restaurants',
    component: () => import('../views/RestaurantList.vue')
  },
  {
    path: '/restaurant/:id',
    name: 'RestaurantDetail',
    component: () => import('../views/RestaurantDetail.vue')
  },
  {
    path: '/friends-reviews',
    name: 'FriendsReviews',
    component: () => import('../views/FriendsReviews.vue')
  },
  {
    path: '/my-reviews',
    name: 'MyReviews',
    component: () => import('../views/MyReviews.vue')
  },
  {
    path: '/',
    redirect: '/restaurants'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const currentUser = localStorage.getItem('currentUser')
  if (to.path !== '/login' && !currentUser) {
    next('/login')
  } else {
    next()
  }
})

export default router
