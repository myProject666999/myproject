import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserList.vue'),
        meta: { title: '用户管理', roles: ['ADMIN', 'RECEPTION'] }
      },
      {
        path: 'membership-cards',
        name: 'MembershipCards',
        component: () => import('@/views/membership/MembershipCardList.vue'),
        meta: { title: '会员卡管理', roles: ['ADMIN', 'RECEPTION'] }
      },
      {
        path: 'group-classes',
        name: 'GroupClasses',
        component: () => import('@/views/groupClass/GroupClassList.vue'),
        meta: { title: '团体课管理' }
      },
      {
        path: 'private-courses',
        name: 'PrivateCourses',
        component: () => import('@/views/privateCourse/PrivateCourseList.vue'),
        meta: { title: '私教课程管理', roles: ['ADMIN', 'RECEPTION', 'COACH'] }
      },
      {
        path: 'performance',
        name: 'Performance',
        component: () => import('@/views/performance/PerformanceList.vue'),
        meta: { title: '业绩管理', roles: ['ADMIN', 'RECEPTION'] }
      },
      {
        path: 'gate-records',
        name: 'GateRecords',
        component: () => import('@/views/gate/GateRecordList.vue'),
        meta: { title: '闸机记录', roles: ['ADMIN', 'RECEPTION'] }
      },
      {
        path: 'renewal-reminders',
        name: 'RenewalReminders',
        component: () => import('@/views/reminder/ReminderList.vue'),
        meta: { title: '续卡提醒', roles: ['ADMIN', 'RECEPTION'] }
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
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  if (to.meta.requiresAuth !== false && !token) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }

  if (to.meta.roles && to.meta.roles.length > 0) {
    if (!to.meta.roles.includes(userInfo.role)) {
      ElMessage.error('权限不足')
      next(from.path || '/dashboard')
      return
    }
  }

  if (to.path === '/login' && token) {
    next('/dashboard')
    return
  }

  next()
})

export default router
