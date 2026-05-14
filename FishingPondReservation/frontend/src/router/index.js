import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

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
    component: () => import('@/views/Layout.vue'),
    redirect: '/ponds',
    children: [
      {
        path: 'ponds',
        name: 'Ponds',
        component: () => import('@/views/Ponds.vue')
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/Equipment.vue')
      },
      {
        path: 'my-reservations',
        name: 'MyReservations',
        component: () => import('@/views/MyReservations.vue')
      },
      {
        path: 'my-orders',
        name: 'MyOrders',
        component: () => import('@/views/MyOrders.vue')
      },
      {
        path: 'leaderboard',
        name: 'Leaderboard',
        component: () => import('@/views/Leaderboard.vue')
      },
      {
        path: 'live',
        name: 'Live',
        component: () => import('@/views/Live.vue')
      }
    ]
  },
  {
    path: '/live-screen',
    name: 'LiveScreen',
    component: () => import('@/views/LiveScreen.vue')
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'ponds',
        name: 'AdminPonds',
        component: () => import('@/views/admin/Ponds.vue')
      },
      {
        path: 'equipment',
        name: 'AdminEquipment',
        component: () => import('@/views/admin/Equipment.vue')
      },
      {
        path: 'reservations',
        name: 'AdminReservations',
        component: () => import('@/views/admin/Reservations.vue')
      },
      {
        path: 'catch',
        name: 'AdminCatch',
        component: () => import('@/views/admin/Catch.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue')
      },
      {
        path: 'live',
        name: 'AdminLive',
        component: () => import('@/views/admin/Live.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const token = store.state.token
  const user = store.state.user

  if (to.meta.requiresAdmin) {
    if (!token) {
      next('/login')
    } else if (user && user.role !== 'ADMIN') {
      next('/')
    } else {
      next()
    }
  } else if (to.path === '/login' || to.path === '/register' || to.path === '/live-screen') {
    next()
  } else if (!token) {
    next('/login')
  } else {
    next()
  }
})

export default router
