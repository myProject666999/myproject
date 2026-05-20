import { createRouter, createWebHistory } from 'vue-router'
import BillList from '../pages/BillList.vue'
import Settlement from '../pages/Settlement.vue'

const routes = [
  {
    path: '/',
    redirect: '/bills'
  },
  {
    path: '/bills',
    name: 'Bills',
    component: BillList
  },
  {
    path: '/settlement',
    name: 'Settlement',
    component: Settlement
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
