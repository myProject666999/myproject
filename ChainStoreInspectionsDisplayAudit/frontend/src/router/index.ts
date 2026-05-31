import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { setupRouterGuards } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/tasks',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'TaskList',
        component: () => import('@/pages/TaskList.vue')
      },
      {
        path: ':id',
        name: 'TaskDetail',
        component: () => import('@/pages/TaskDetail.vue')
      }
    ]
  },
  {
    path: '/inspection/:taskId',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Inspection',
        component: () => import('@/pages/Inspection.vue')
      }
    ]
  },
  {
    path: '/issues',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'IssueList',
        component: () => import('@/pages/IssueList.vue')
      },
      {
        path: ':id',
        name: 'IssueDetail',
        component: () => import('@/pages/IssueDetail.vue')
      }
    ]
  },
  {
    path: '/ranking',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Ranking',
        component: () => import('@/pages/Ranking.vue')
      }
    ]
  },
  {
    path: '/reports',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'ReportList',
        component: () => import('@/pages/ReportList.vue')
      },
      {
        path: ':id',
        name: 'ReportDetail',
        component: () => import('@/pages/ReportDetail.vue')
      }
    ]
  },
  {
    path: '/stores',
    component: Layout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        name: 'StoreManagement',
        component: () => import('@/pages/StoreManagement.vue')
      }
    ]
  },
  {
    path: '/templates',
    component: Layout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        name: 'TemplateManagement',
        component: () => import('@/pages/TemplateManagement.vue')
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        name: 'UserManagement',
        component: () => import('@/pages/UserManagement.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

setupRouterGuards(router)

export default router
