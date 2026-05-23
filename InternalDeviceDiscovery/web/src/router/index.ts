import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/devices',
  },
  {
    path: '/scan',
    name: 'scan',
    component: () => import('../views/ScanView.vue'),
  },
  {
    path: '/devices',
    name: 'devices',
    component: () => import('../views/DeviceListView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
