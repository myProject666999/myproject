import { createRouter, createWebHistory } from 'vue-router'
import ResumeList from '@/views/ResumeList.vue'
import ResumeEdit from '@/views/ResumeEdit.vue'
import ResumePreview from '@/views/ResumePreview.vue'
import TemplateSelect from '@/views/TemplateSelect.vue'
import Analytics from '@/views/Analytics.vue'

const routes = [
  {
    path: '/',
    redirect: '/resumes'
  },
  {
    path: '/resumes',
    name: 'ResumeList',
    component: ResumeList
  },
  {
    path: '/resume/edit/:id',
    name: 'ResumeEdit',
    component: ResumeEdit
  },
  {
    path: '/resume/preview/:id',
    name: 'ResumePreview',
    component: ResumePreview
  },
  {
    path: '/resume/templates',
    name: 'TemplateSelect',
    component: TemplateSelect
  },
  {
    path: '/resume/:id/analytics',
    name: 'Analytics',
    component: Analytics
  },
  {
    path: '/s/:code',
    name: 'ShortLinkRedirect',
    component: () => import('@/views/ShortLinkRedirect.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
