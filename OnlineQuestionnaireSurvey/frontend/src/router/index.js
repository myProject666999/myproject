import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/surveys'
      },
      {
        path: 'surveys',
        name: 'SurveyList',
        component: () => import('@/views/SurveyList.vue')
      },
      {
        path: 'surveys/design/:id',
        name: 'SurveyDesign',
        component: () => import('@/views/SurveyDesign.vue')
      },
      {
        path: 'surveys/statistics/:id',
        name: 'SurveyStatistics',
        component: () => import('@/views/SurveyStatistics.vue')
      },
      {
        path: 'my-surveys',
        name: 'MySurveys',
        component: () => import('@/views/MySurveys.vue')
      }
    ]
  },
  {
    path: '/survey/fill/:id',
    name: 'SurveyFill',
    component: () => import('@/views/SurveyFill.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
