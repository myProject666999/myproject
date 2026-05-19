import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('../views/List.vue')
  },
  {
    path: '/editor/:id?',
    name: 'Editor',
    component: () => import('../views/Editor.vue')
  },
  {
    path: '/share/:code',
    name: 'Share',
    component: () => import('../views/Share.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
