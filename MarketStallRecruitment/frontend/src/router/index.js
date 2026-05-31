import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import MainLayout from '../layouts/MainLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import EventList from '../views/EventList.vue'
import EventDetail from '../views/EventDetail.vue'
import EventCreate from '../views/EventCreate.vue'
import RegistrationList from '../views/RegistrationList.vue'
import StallMap from '../views/StallMap.vue'
import PaymentList from '../views/PaymentList.vue'
import CheckIn from '../views/CheckIn.vue'
import EventReview from '../views/EventReview.vue'
import AnnouncementList from '../views/AnnouncementList.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
      },
      {
        path: 'event/list',
        name: 'EventList',
        component: EventList,
        meta: { requiresAuth: true }
      },
      {
        path: 'event/detail/:id',
        name: 'EventDetail',
        component: EventDetail,
        meta: { requiresAuth: true }
      },
      {
        path: 'event/create',
        name: 'EventCreate',
        component: EventCreate,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'registration/list',
        name: 'RegistrationList',
        component: RegistrationList,
        meta: { requiresAuth: true }
      },
      {
        path: 'stall/map/:eventId',
        name: 'StallMap',
        component: StallMap,
        meta: { requiresAuth: true }
      },
      {
        path: 'payment/list',
        name: 'PaymentList',
        component: PaymentList,
        meta: { requiresAuth: true }
      },
      {
        path: 'checkin/:eventId',
        name: 'CheckIn',
        component: CheckIn,
        meta: { requiresAuth: true }
      },
      {
        path: 'review/:eventId',
        name: 'EventReview',
        component: EventReview,
        meta: { requiresAuth: true }
      },
      {
        path: 'announcement/list',
        name: 'AnnouncementList',
        component: AnnouncementList,
        meta: { requiresAuth: true }
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
  const role = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.requiresAdmin && (role !== '0' && role !== '1')) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
