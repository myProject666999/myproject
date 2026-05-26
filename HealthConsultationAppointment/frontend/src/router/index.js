import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Departments',
    component: () => import('@/views/Departments.vue')
  },
  {
    path: '/department/:id',
    name: 'DepartmentDetail',
    component: () => import('@/views/DepartmentDetail.vue')
  },
  {
    path: '/doctor/:id',
    name: 'DoctorSchedule',
    component: () => import('@/views/DoctorSchedule.vue')
  },
  {
    path: '/appointment/:scheduleId',
    name: 'Appointment',
    component: () => import('@/views/Appointment.vue')
  },
  {
    path: '/my-appointments',
    name: 'MyAppointments',
    component: () => import('@/views/MyAppointments.vue')
  },
  {
    path: '/queue-admin',
    name: 'QueueAdmin',
    component: () => import('@/views/QueueAdmin.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
