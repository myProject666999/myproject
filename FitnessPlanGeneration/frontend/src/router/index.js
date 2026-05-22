import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'questionnaire',
        name: 'Questionnaire',
        component: () => import('@/views/Questionnaire.vue'),
        meta: { title: '目标问卷' }
      },
      {
        path: 'weekly-plan',
        name: 'WeeklyPlan',
        component: () => import('@/views/WeeklyPlan.vue'),
        meta: { title: '周计划' }
      },
      {
        path: 'daily-plan/:id',
        name: 'DailyPlan',
        component: () => import('@/views/DailyPlan.vue'),
        meta: { title: '每日计划详情' }
      },
      {
        path: 'exercises',
        name: 'Exercises',
        component: () => import('@/views/Exercises.vue'),
        meta: { title: '动作库' }
      },
      {
        path: 'exercise/:id',
        name: 'ExerciseDetail',
        component: () => import('@/views/ExerciseDetail.vue'),
        meta: { title: '动作详情' }
      },
      {
        path: 'check-in/:dailyPlanId',
        name: 'CheckIn',
        component: () => import('@/views/CheckIn.vue'),
        meta: { title: '打卡' }
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/History.vue'),
        meta: { title: '历史记录' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('fitness_user')
  if (to.path !== '/login' && !user) {
    next('/login')
  } else if (to.path === '/login' && user) {
    next('/home')
  } else {
    next()
  }
})

export default router
