import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'patients',
        name: 'PatientList',
        component: () => import('../views/patient/PatientList.vue')
      },
      {
        path: 'patients/:id',
        name: 'PatientDetail',
        component: () => import('../views/patient/PatientDetail.vue')
      },
      {
        path: 'appointments',
        name: 'AppointmentList',
        component: () => import('../views/appointment/AppointmentList.vue')
      },
      {
        path: 'schedules',
        name: 'ScheduleList',
        component: () => import('../views/schedule/ScheduleList.vue')
      },
      {
        path: 'treatment-plans',
        name: 'TreatmentPlanList',
        component: () => import('../views/treatment/TreatmentPlanList.vue')
      },
      {
        path: 'treatment-records',
        name: 'TreatmentRecordList',
        component: () => import('../views/treatment/TreatmentRecordList.vue')
      },
      {
        path: 'medical-images',
        name: 'MedicalImageList',
        component: () => import('../views/image/MedicalImageList.vue')
      },
      {
        path: 'reminders',
        name: 'ReminderList',
        component: () => import('../views/reminder/ReminderList.vue')
      },
      {
        path: 'doctors',
        name: 'DoctorList',
        component: () => import('../views/doctor/DoctorList.vue')
      },
      {
        path: 'payments',
        name: 'PaymentList',
        component: () => import('../views/payment/PaymentList.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
