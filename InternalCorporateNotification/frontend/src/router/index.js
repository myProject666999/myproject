import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/announcements',
    children: [
      {
        path: 'announcements',
        name: 'Announcements',
        component: () => import('@/views/AnnouncementList.vue'),
        meta: { title: '公告列表', requiresAuth: true }
      },
      {
        path: 'announcements/:id',
        name: 'AnnouncementDetail',
        component: () => import('@/views/AnnouncementDetail.vue'),
        meta: { title: '公告详情', requiresAuth: true }
      },
      {
        path: 'publish',
        name: 'Publish',
        component: () => import('@/views/Publish.vue'),
        meta: { title: '发布公告', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/Statistics.vue'),
        meta: { title: '已读统计', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/Admin.vue'),
        meta: { title: '后台管理', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/announcements'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/announcements')
  } else {
    next()
  }
})

export default router
