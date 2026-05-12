import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
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
    path: '/',
    component: () => import('@/layouts/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'nannies',
        name: 'Nannies',
        component: () => import('@/views/NannyList.vue')
      },
      {
        path: 'nannies/:id',
        name: 'NannyDetail',
        component: () => import('@/views/NannyDetail.vue')
      },
      {
        path: 'demands',
        name: 'Demands',
        component: () => import('@/views/DemandList.vue')
      },
      {
        path: 'demands/create',
        name: 'CreateDemand',
        component: () => import('@/views/CreateDemand.vue')
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/OrderList.vue')
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/OrderDetail.vue')
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/views/Attendance.vue')
      },
      {
        path: 'daily-records',
        name: 'DailyRecords',
        component: () => import('@/views/DailyRecords.vue')
      },
      {
        path: 'reviews',
        name: 'Reviews',
        component: () => import('@/views/Reviews.vue')
      },
      {
        path: 'disputes',
        name: 'Disputes',
        component: () => import('@/views/Disputes.vue')
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('@/views/CourseList.vue')
      },
      {
        path: 'courses/:id',
        name: 'CourseDetail',
        component: () => import('@/views/CourseDetail.vue')
      },
      {
        path: 'admin/nannies',
        name: 'AdminNannies',
        component: () => import('@/views/admin/NannyManage.vue')
      },
      {
        path: 'admin/courses',
        name: 'AdminCourses',
        component: () => import('@/views/admin/CourseManage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')

  if (to.path === '/login' || to.path === '/register') {
    next()
  } else {
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
