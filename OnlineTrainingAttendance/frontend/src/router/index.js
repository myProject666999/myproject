import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    children: [
      {
        path: 'training',
        name: 'TrainingList',
        component: () => import('@/views/TrainingList.vue')
      },
      {
        path: 'training/:id/checkin',
        name: 'TrainingCheckin',
        component: () => import('@/views/Checkin.vue')
      },
      {
        path: 'certificates',
        name: 'CertificateList',
        component: () => import('@/views/CertificateList.vue')
      },
      {
        path: 'verify',
        name: 'Verify',
        component: () => import('@/views/Verify.vue')
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/Admin.vue'),
        meta: { requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('token')
  if (to.name !== 'Login' && !isLoggedIn) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
