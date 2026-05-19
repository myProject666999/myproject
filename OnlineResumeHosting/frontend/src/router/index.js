import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/resumes'
  },
  {
    path: '/resumes',
    name: 'ResumeList',
    component: () => import('../views/ResumeList.vue')
  },
  {
    path: '/resume/edit/:id?',
    name: 'ResumeEdit',
    component: () => import('../views/ResumeEdit.vue')
  },
  {
    path: '/resume/preview/:id',
    name: 'ResumePreview',
    component: () => import('../views/ResumePreview.vue')
  },
  {
    path: '/resume/:id/templates',
    name: 'TemplateSelect',
    component: () => import('../views/TemplateSelect.vue')
  },
  {
    path: '/resume/:id/logs',
    name: 'VisitLogs',
    component: () => import('../views/VisitLogs.vue')
  },
  {
    path: '/public/:code',
    name: 'PublicResume',
    component: () => import('../views/PublicResume.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
