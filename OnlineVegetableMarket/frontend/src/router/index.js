import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/',
    name: 'Products',
    component: () => import('../views/Products.vue'),
    meta: { title: '新鲜蔬菜', requiresAuth: false },
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue'),
    meta: { title: '商品详情' },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { title: '确认订单', requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Orders.vue'),
    meta: { title: '我的订单', requiresAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('../views/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true },
  },
  {
    path: '/merchant',
    name: 'Merchant',
    component: () => import('../views/Merchant.vue'),
    meta: { title: '商家后台', requiresAuth: true, requiresMerchant: true },
    children: [
      {
        path: '',
        redirect: '/merchant/products',
      },
      {
        path: 'products',
        name: 'MerchantProducts',
        component: () => import('../views/merchant/ProductManage.vue'),
      },
      {
        path: 'orders',
        name: 'MerchantOrders',
        component: () => import('../views/merchant/OrderManage.vue'),
      },
      {
        path: 'inventory',
        name: 'MerchantInventory',
        component: () => import('../views/merchant/InventoryManage.vue'),
      },
      {
        path: 'slots',
        name: 'MerchantSlots',
        component: () => import('../views/merchant/SlotManage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.title) {
    document.title = `${to.meta.title} - 鲜时达`
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresMerchant && userStore.role !== 'merchant' && userStore.role !== 'admin') {
    next('/')
    return
  }

  next()
})

export default router
