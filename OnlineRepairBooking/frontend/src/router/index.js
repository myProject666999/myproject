import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', requiresAuth: false }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('@/views/ServiceList.vue'),
    meta: { title: '服务列表', requiresAuth: false }
  },
  {
    path: '/service/:id',
    name: 'ServiceDetail',
    component: () => import('@/views/ServiceDetail.vue'),
    meta: { title: '服务详情', requiresAuth: false }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrderList.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/worker/dashboard',
    name: 'WorkerDashboard',
    component: () => import('@/views/WorkerDashboard.vue'),
    meta: { title: '工人工作台', requiresAuth: true, role: 'worker' }
  },
  {
    path: '/worker/orders',
    name: 'WorkerOrders',
    component: () => import('@/views/WorkerOrders.vue'),
    meta: { title: '工人订单', requiresAuth: true, role: 'worker' }
  },
  {
    path: '/worker/register',
    name: 'WorkerRegister',
    component: () => import('@/views/WorkerRegister.vue'),
    meta: { title: '申请成为师傅', requiresAuth: true }
  },
  {
    path: '/worker/:id',
    name: 'WorkerDetail',
    component: () => import('@/views/WorkerDetail.vue'),
    meta: { title: '师傅详情', requiresAuth: false }
  },
  {
    path: '/review/:orderId',
    name: 'Review',
    component: () => import('@/views/ReviewPage.vue'),
    meta: { title: '评价服务', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('@/views/AddressList.vue'),
    meta: { title: '地址管理', requiresAuth: true }
  },
  {
    path: '/address/edit',
    name: 'AddressEdit',
    component: () => import('@/views/AddressEdit.vue'),
    meta: { title: '编辑地址', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  document.title = to.meta.title ? `${to.meta.title} - 在线维修预约` : '在线维修预约'
  
  if (to.meta.requiresAuth && !userStore.token) {
    showToast('请先登录')
    next('/login')
    return
  }
  
  if (to.meta.role && userStore.userInfo?.role !== to.meta.role) {
    showToast('无权限访问')
    next('/')
    return
  }
  
  next()
})

export default router
