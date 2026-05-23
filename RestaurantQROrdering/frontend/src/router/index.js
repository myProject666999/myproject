import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/menu'
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('../views/MenuView.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/CartView.vue')
  },
  {
    path: '/order-status',
    name: 'OrderStatus',
    component: () => import('../views/OrderStatusView.vue')
  },
  {
    path: '/kitchen',
    name: 'Kitchen',
    component: () => import('../views/KitchenView.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
