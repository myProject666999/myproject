import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/problem/list'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/problem/list',
    name: 'ProblemList',
    component: () => import('@/views/ProblemList.vue'),
    meta: { title: '题目列表' }
  },
  {
    path: '/problem/detail/:id',
    name: 'ProblemDetail',
    component: () => import('@/views/ProblemDetail.vue'),
    meta: { title: '题目详情' }
  },
  {
    path: '/submission/list',
    name: 'SubmissionList',
    component: () => import('@/views/SubmissionList.vue'),
    meta: { title: '提交记录' }
  },
  {
    path: '/submission/detail/:id',
    name: 'SubmissionDetail',
    component: () => import('@/views/SubmissionDetail.vue'),
    meta: { title: '提交详情' }
  },
  {
    path: '/contest/list',
    name: 'ContestList',
    component: () => import('@/views/ContestList.vue'),
    meta: { title: '竞赛列表' }
  },
  {
    path: '/contest/detail/:id',
    name: 'ContestDetail',
    component: () => import('@/views/ContestDetail.vue'),
    meta: { title: '竞赛详情' }
  },
  {
    path: '/ranklist',
    name: 'Ranklist',
    component: () => import('@/views/Ranklist.vue'),
    meta: { title: '排行榜' }
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/admin/problem/list',
    name: 'AdminProblemList',
    component: () => import('@/views/admin/AdminProblemList.vue'),
    meta: { title: '题库管理', requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/problem/edit/:id',
    name: 'AdminProblemEdit',
    component: () => import('@/views/admin/AdminProblemEdit.vue'),
    meta: { title: '编辑题目', requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/problem/create',
    name: 'AdminProblemCreate',
    component: () => import('@/views/admin/AdminProblemEdit.vue'),
    meta: { title: '创建题目', requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/user/list',
    name: 'AdminUserList',
    component: () => import('@/views/admin/AdminUserList.vue'),
    meta: { title: '用户管理', requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/contest/list',
    name: 'AdminContestList',
    component: () => import('@/views/admin/AdminContestList.vue'),
    meta: { title: '竞赛管理', requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/contest/edit/:id',
    name: 'AdminContestEdit',
    component: () => import('@/views/admin/AdminContestEdit.vue'),
    meta: { title: '编辑竞赛', requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/contest/create',
    name: 'AdminContestCreate',
    component: () => import('@/views/admin/AdminContestEdit.vue'),
    meta: { title: '创建竞赛', requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/announcement/list',
    name: 'AdminAnnouncementList',
    component: () => import('@/views/admin/AdminAnnouncementList.vue'),
    meta: { title: '公告管理', requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/system/config',
    name: 'AdminSystemConfig',
    component: () => import('@/views/admin/AdminSystemConfig.vue'),
    meta: { title: '系统设置', requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 在线编程评测系统` : '在线编程评测系统'
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.role === 'admin' && !userStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
