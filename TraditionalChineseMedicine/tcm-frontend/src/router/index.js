import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/patients'
  },
  {
    path: '/patients',
    name: 'Patients',
    component: () => import('../views/Patients.vue')
  },
  {
    path: '/diagnosis',
    name: 'Diagnosis',
    component: () => import('../views/Diagnosis.vue')
  },
  {
    path: '/prescription',
    name: 'Prescription',
    component: () => import('../views/Prescription.vue')
  },
  {
    path: '/herbs',
    name: 'Herbs',
    component: () => import('../views/Herbs.vue')
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/Inventory.vue')
  },
  {
    path: '/templates',
    name: 'Templates',
    component: () => import('../views/Templates.vue')
  },
  {
    path: '/decoction',
    name: 'Decoction',
    component: () => import('../views/Decoction.vue')
  },
  {
    path: '/followup',
    name: 'FollowUp',
    component: () => import('../views/FollowUp.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
