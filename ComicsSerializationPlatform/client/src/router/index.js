import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/comic/:id',
    name: 'ComicDetail',
    component: () => import('@/views/ComicDetail.vue')
  },
  {
    path: '/read/:comicId/chapter/:chapterId',
    name: 'Reader',
    component: () => import('@/views/Reader.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/author',
    name: 'AuthorDashboard',
    component: () => import('@/views/AuthorDashboard.vue'),
    meta: { requiresAuth: true, requiresRole: 'author' }
  },
  {
    path: '/author/comic/create',
    name: 'CreateComic',
    component: () => import('@/views/CreateComic.vue'),
    meta: { requiresAuth: true, requiresRole: 'author' }
  },
  {
    path: '/author/comic/:id/edit',
    name: 'EditComic',
    component: () => import('@/views/EditComic.vue'),
    meta: { requiresAuth: true, requiresRole: 'author' }
  },
  {
    path: '/author/comic/:id/chapters',
    name: 'ManageChapters',
    component: () => import('@/views/ManageChapters.vue'),
    meta: { requiresAuth: true, requiresRole: 'author' }
  },
  {
    path: '/author/comic/:id/chapter/create',
    name: 'CreateChapter',
    component: () => import('@/views/CreateChapter.vue'),
    meta: { requiresAuth: true, requiresRole: 'author' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-subscriptions',
    name: 'MySubscriptions',
    component: () => import('@/views/MySubscriptions.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-favorites',
    name: 'MyFavorites',
    component: () => import('@/views/MyFavorites.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const userStore = JSON.parse(localStorage.getItem('user') || 'null')
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresRole && userStore?.role !== to.meta.requiresRole && userStore?.role !== 'admin') {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
