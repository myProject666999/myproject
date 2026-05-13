
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/booking',
    name: 'Booking',
    component: () => import('@/views/Booking.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/Order.vue')
  },
  {
    path: '/song',
    name: 'Song',
    component: () => import('@/views/Song.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'room',
        name: 'RoomManage',
        component: () => import('@/views/admin/RoomManage.vue')
      },
      {
        path: 'booking',
        name: 'BookingManage',
        component: () => import('@/views/admin/BookingManage.vue')
      },
      {
        path: 'drink',
        name: 'DrinkManage',
        component: () => import('@/views/admin/DrinkManage.vue')
      },
      {
        path: 'user',
        name: 'UserManage',
        component: () => import('@/views/admin/UserManage.vue')
      },
      {
        path: 'checkout',
        name: 'CheckoutManage',
        component: () => import('@/views/admin/CheckoutManage.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
