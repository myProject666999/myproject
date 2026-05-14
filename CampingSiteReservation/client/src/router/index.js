import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('@/views/Map.vue')
  },
  {
    path: '/campsites',
    name: 'Campsites',
    component: () => import('@/views/Campsites.vue')
  },
  {
    path: '/campsite/:id',
    name: 'CampsiteDetail',
    component: () => import('@/views/CampsiteDetail.vue')
  },
  {
    path: '/equipments',
    name: 'Equipments',
    component: () => import('@/views/Equipments.vue')
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/Activities.vue')
  },
  {
    path: '/checkin',
    name: 'Checkin',
    component: () => import('@/views/Checkin.vue')
  },
  {
    path: '/reviews',
    name: 'Reviews',
    component: () => import('@/views/Reviews.vue')
  },
  {
    path: '/review/:id',
    name: 'ReviewDetail',
    component: () => import('@/views/ReviewDetail.vue')
  },
  {
    path: '/create-review',
    name: 'CreateReview',
    component: () => import('@/views/CreateReview.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/Order.vue')
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue')
  },
  {
    path: '/notice',
    name: 'Notice',
    component: () => import('@/views/Notice.vue')
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/Contact.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
