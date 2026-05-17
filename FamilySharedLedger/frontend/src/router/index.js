import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../views/Layout.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'family',
        name: 'Family',
        component: () => import('../views/Family.vue')
      },
      {
        path: 'bills',
        name: 'Bills',
        component: () => import('../views/Bills.vue')
      },
      {
        path: 'settlement',
        name: 'Settlement',
        component: () => import('../views/Settlement.vue')
      },
      {
        path: 'balance',
        name: 'Balance',
        component: () => import('../views/Balance.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path === '/login') {
    next()
  } else {
    token ? next() : next('/login')
  }
})

export default router
