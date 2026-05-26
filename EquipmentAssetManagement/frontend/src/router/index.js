import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/assets',
    name: 'Assets',
    component: () => import('../views/Assets.vue')
  },
  {
    path: '/assets/:id',
    name: 'AssetDetail',
    component: () => import('../views/AssetDetail.vue')
  },
  {
    path: '/borrows',
    name: 'Borrows',
    component: () => import('../views/Borrows.vue')
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('../views/Maintenance.vue')
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/Inventory.vue')
  },
  {
    path: '/inventory/:id',
    name: 'InventoryDetail',
    component: () => import('../views/InventoryDetail.vue')
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/Categories.vue')
  },
  {
    path: '/departments',
    name: 'Departments',
    component: () => import('../views/Departments.vue')
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/Users.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
